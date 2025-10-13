import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { Upload, User, MapPin, Phone, Mail, Star, Package } from 'lucide-react';
import styles from '../../../../../public/css/RiderCard.module.css';
import axiosInstance from '../../../../utils/app/axiosConfig.js';
import { validateImageFile } from '../../../../utils/image/imageValidation.js';

const RiderCard = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { setError, setSuccess, setUploading } = useUI();
  
  const [riderStats, setRiderStats] = useState({
    totalDeliveries: 0,
    rating: 0,
    activeDeliveries: 0
  });
  
  const fileInputRef = useRef(null);
  const uploadInProgress = useRef(false);

  // Get rider image URL
  const getRiderImageUrl = useCallback((imagePath) => {
    if (!imagePath) {
      return null;
    }

    const cleanPath = imagePath.replace(/^\/+/, '');
    const baseUrl = axiosInstance.defaults.baseURL || '';
    const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");

    return imageUrl;
  }, []);

  // Handle profile image upload
  const handleImageUpload = useCallback(async (file) => {
    if (!file) {
      return;
    }

    if (!currentUser?.id_user) {
      setError({ imageError: "Usuario no identificado" });
      return;
    }

    if (uploadInProgress.current) {
      console.log('Upload already in progress');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError({ imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP." });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError({ imageError: "La imagen es demasiado grande. Máximo 10MB." });
      return;
    }

    try {
      await validateImageFile(file);

      const formData = new FormData();
      formData.append('profileImage', file);

      setUploading(true);
      uploadInProgress.current = true;

      const response = await axiosInstance.post(
        '/user/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-User-ID': currentUser.id_user,
          },
        }
      );

      if (response.data.data?.image_user) {
        // Update current user with new image
        const updatedUser = {
          ...currentUser,
          image_user: response.data.data.image_user
        };
        
        setCurrentUser(updatedUser);
        
        // Update localStorage
        const storedData = localStorage.getItem('currentUser');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          parsedData.image_user = response.data.data.image_user;
          localStorage.setItem('currentUser', JSON.stringify(parsedData));
        }
        
        setSuccess({ imageSuccess: "Imagen actualizada correctamente" });
      }
    } catch (err) {
      console.error('Error uploading rider image:', err);
      setError({
        imageError: err.response?.data?.error || err.message || "Error al subir la imagen",
      });
    } finally {
      setUploading(false);
      uploadInProgress.current = false;
    }
  }, [currentUser, setCurrentUser, setUploading, setError, setSuccess]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // TODO: Fetch rider stats from backend
  // useEffect(() => {
  //   fetchRiderStats();
  // }, [currentUser?.id_user]);

  return (
    <div className={styles.container}>
      <div className={styles.profileSection}>
        <div className={styles.imageContainer} onClick={triggerFileInput}>
          {currentUser?.image_user ? (
            <img 
              src={getRiderImageUrl(currentUser.image_user)} 
              alt="Rider profile" 
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.placeholderImage}>
              <User size={40} />
            </div>
          )}
          <div className={styles.uploadOverlay}>
            <Upload size={20} />
            <span>Cambiar foto</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className={styles.riderInfo}>
          <h2 className={styles.riderName}>{currentUser?.name_user || 'Repartidor'}</h2>
          <div className={styles.riderType}>
            <Package size={16} />
            <span>Repartidor</span>
          </div>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{riderStats.totalDeliveries}</span>
          <span className={styles.statLabel}>Entregas totales</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            <Star size={16} className={styles.starIcon} />
            {riderStats.rating.toFixed(1)}
          </span>
          <span className={styles.statLabel}>Calificación</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{riderStats.activeDeliveries}</span>
          <span className={styles.statLabel}>Entregas activas</span>
        </div>
      </div>

      <div className={styles.contactSection}>
        {currentUser?.location_user && (
          <div className={styles.contactItem}>
            <MapPin size={16} color='gray'/>
            <span>{currentUser.location_user}</span>
          </div>
        )}
        {currentUser?.email_user && (
          <div className={styles.contactItem}>
            <Mail size={16} />
            <span>{currentUser.email_user}</span>
          </div>
        )}
        {currentUser?.phone_user && (
          <div className={styles.contactItem}>
            <Phone size={16} />
            <span>{currentUser.phone_user}</span>
          </div>
        )}
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span>Disponible para entregas</span>
        </div>
      </div>
    </div>
  );
};

export default RiderCard;