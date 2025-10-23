// src/components/user_info_card/UserInfoCardUtils.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { uploadProfileImage } from '../../utils/image/imageUploadService.js';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const UserInfoCardUtils = () => {
    const {
        currentUser, setCurrentUser
    } = useAuth();

    const {
        setUploading, setError,
    } = useUI();

    const [uploadProgress, setUploadProgress] = useState(0);
    const [localImageUrl, setLocalImageUrl] = useState(null);
    const imageTimestampRef = useRef(null);
    
    useEffect(() => {
        return () => {
            if (localImageUrl) {
                URL.revokeObjectURL(localImageUrl);
            }
        };
    }, [localImageUrl]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        
        setError(prevError => ({ ...prevError, imageError: "" }));
        
        if (!file) {
            console.log('-> UserInfoCardUtils - handleImageUpload() - El usuario canceló la selección de archivo');
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setError(prevError => ({
            ...prevError,
            imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
          }));
          return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          setError(prevError => ({
            ...prevError,
            imageError: "La imagen es demasiado grande. Máximo 10MB antes de la optimización."
          }));
          return;
        }

        try {
            if (!currentUser?.name_user) {
                throw new Error('No hay usuario activo');
            }

            const localUrl = URL.createObjectURL(file);
            setLocalImageUrl(localUrl);

            setUploading(true);
            setUploadProgress(0);

            console.log('Comenzando carga de imagen de perfil para usuario:', currentUser.name_user);

            const imagePath = await uploadProfileImage({
                file,
                userName: currentUser.name_user,
                onProgress: (progress) => {
                    console.log('Upload progress:', progress);
                    setUploadProgress(progress);
                },
                onError: (errorMessage) => {
                    console.error('Upload error:', errorMessage);
                    setError(prevError => ({
                        ...prevError,
                        imageError: errorMessage
                    }));
                    setLocalImageUrl(null);
                }
            });

            console.log('Imagen cargada. Ruta recibida:', imagePath);

            //update: Generate new timestamp to force image refresh
            imageTimestampRef.current = Date.now();

            const updatedUser = {
                ...currentUser,
                image_user: imagePath
            };

            console.log('Actualizando usuario con nueva imagen:', updatedUser);

            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            setCurrentUser(updatedUser);
            
            setError(prevError => ({ ...prevError, imageError: '' }));
            
            //update: Clear local URL after server image is ready
            setTimeout(() => {
                setLocalImageUrl(null);
                console.log('URL local liberada, usando imagen del servidor');
            }, 2000);
            
        } catch (err) {
            console.error('Error en la carga de imagen:', err);
            setError(prevError => ({
                ...prevError,
                imageError: err.message || "Error al subir el archivo"
            }));
            setLocalImageUrl(null);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    //update: Modified to use the /user/image/:userName endpoint for user images
    const getImageUrl = (imagePath) => {
        // If we have a local image URL (from recent upload), use that first
        if (localImageUrl) {
            console.log('Using local image URL for immediate display:', localImageUrl);
            return localImageUrl;
        }
        
        if (!imagePath) {
            console.error('-> UserInfoCardUtils - getImageUrl() - No se ha proporcionado una ruta de imagen');
            return null;
        }
        
        try {
            // Get base URL from axios config
            const baseURL = axiosInstance.defaults.baseURL || 'https://app.uribarri.online';
            
            //update: If imagePath is just a username (which is what the backend returns now),
            // construct the URL using the /user/image/:userName endpoint
            // This avoids path encoding issues and uses the dedicated image serving route
            
            // Check if it's just a username (no slashes) or a simple path
            const isUsernameOnly = !imagePath.includes('/') && !imagePath.startsWith('http');
            
            let imageUrl;
            if (isUsernameOnly) {
                // Use the dedicated user image endpoint
                const encodedUsername = encodeURIComponent(imagePath);
                imageUrl = `${baseURL}/user/image/${encodedUsername}`;
            } else if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
                // Already a full URL
                imageUrl = imagePath;
            } else {
                // Legacy path format - try to construct from assets path
                const cleanPath = imagePath.replace(/^\/+/, '');
                const pathSegments = cleanPath.split('/');
                const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
                const encodedPath = encodedSegments.join('/');
                imageUrl = `${baseURL}/${encodedPath}`;
            }
            
            // Add cache-busting timestamp if we recently uploaded
            if (imageTimestampRef.current) {
                imageUrl += (imageUrl.includes('?') ? '&' : '?') + '_t=' + imageTimestampRef.current;
            }
            
            console.log('Generated user image URL:', {
                originalPath: imagePath,
                generatedUrl: imageUrl
            });
            
            return imageUrl;
        } catch (error) {
            console.error('Error generating image URL:', error);
            return null;
        }
    };

    return {
        getImageUrl,
        handleImageUpload,
        uploadProgress,
        localImageUrl
    };
};