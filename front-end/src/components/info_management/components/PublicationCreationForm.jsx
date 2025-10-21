// src/components/info_management/components/PublicationCreationForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { FileText, Calendar, Clock, Image, X, Save, AlertCircle, Edit, Building2 } from 'lucide-react';
import styles from '../../../../css/PublicationCreationForm.module.css';

const PublicationCreationForm = ({ onSuccess, onCancel, editMode = false, publicationData = null }) => {
  //update: Log component props on every render
  console.log('📋 PublicationCreationForm rendered:', {
    editMode,
    publicationId: publicationData?.id_publication,
    hasImage: !!publicationData?.image_pub,
    imagePath: publicationData?.image_pub
  });

  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [formData, setFormData] = useState({
    title_pub: editMode && publicationData ? publicationData.title_pub : '',
    content_pub: editMode && publicationData ? publicationData.content_pub : '',
    id_org: editMode && publicationData ? publicationData.id_org : '',
    date_pub: editMode && publicationData ? publicationData.date_pub : new Date().toISOString().split('T')[0],
    time_pub: editMode && publicationData ? publicationData.time_pub : new Date().toTimeString().split(' ')[0].substring(0, 5)
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userManagedOrgs, setUserManagedOrgs] = useState([]);
  
  useEffect(() => {
    if (userOrganizations && userOrganizations.length > 0) {
      const managedOrgs = userOrganizations
        .filter(participation => participation.org_managed && participation.organization)
        .map(participation => participation.organization);
      
      setUserManagedOrgs(managedOrgs);
      
      if (managedOrgs.length === 1 && !editMode) {
        setFormData(prev => ({
          ...prev,
          id_org: managedOrgs[0].id_organization
        }));
      }
    }
  }, [userOrganizations, editMode]);
  
  //update: Initialize form data and image preview when entering edit mode
  useEffect(() => {
    console.log('🔍 Edit mode useEffect triggered:', { editMode, publicationData });

    if (editMode && publicationData) {
      console.log('📝 Setting form data for publication:', publicationData.id_publication);

      setFormData({
        title_pub: publicationData.title_pub || '',
        content_pub: publicationData.content_pub || '',
        id_org: publicationData.id_org || '',
        date_pub: publicationData.date_pub || new Date().toISOString().split('T')[0],
        time_pub: publicationData.time_pub ? publicationData.time_pub.substring(0, 5) : new Date().toTimeString().split(' ')[0].substring(0, 5)
      });

      //update: Set image preview if publication has an image, otherwise set to null
      if (publicationData.image_pub) {
        //update: Properly encode the path to handle special characters like # and spaces
        const pathSegments = publicationData.image_pub.split('/');
        const encodedPath = pathSegments.map(segment => encodeURIComponent(segment)).join('/');
        const imageUrl = `${import.meta.env.VITE_API_URL}/${encodedPath}`;

        console.log('🖼️ Setting image preview:', {
          image_pub: publicationData.image_pub,
          encodedPath: encodedPath,
          VITE_API_URL: import.meta.env.VITE_API_URL,
          fullUrl: imageUrl
        });
        setImagePreview(imageUrl);
      } else {
        console.log('ℹ️ No image for this publication');
        setImagePreview(null);
      }

      //update: Reset flags when entering edit mode
      setRemoveExistingImage(false);
      setImageFile(null);
    } else if (!editMode) {
      //update: Reset everything when exiting edit mode
      console.log('🔄 Exiting edit mode, resetting state');
      setImagePreview(null);
      setRemoveExistingImage(false);
      setImageFile(null);
    }
  }, [editMode, publicationData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(prev => ({
          ...prev,
          imageError: 'Por favor selecciona una imagen válida (JPG, PNG o WEBP)'
        }));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(prev => ({
          ...prev,
          imageError: 'La imagen no debe superar los 10MB'
        }));
        return;
      }

      setImageFile(file);
      setRemoveExistingImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  //update: Handle image removal for both create and edit modes
  const handleRemoveImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    //update: Clear the new image file if user selected one
    setImageFile(null);

    //update: Clear the preview
    setImagePreview(null);

    //update: In edit mode, mark that user wants to remove the existing image from the server
    if (editMode && publicationData?.image_pub) {
      setRemoveExistingImage(true);
    }

    //update: Clear file input fields
    const fileInput = document.getElementById('pub-image-input');
    if (fileInput) {
      fileInput.value = '';
    }
    const fileInputChange = document.getElementById('pub-image-input-change');
    if (fileInputChange) {
      fileInputChange.value = '';
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title_pub.trim()) {
      errors.title_pub = 'El título es obligatorio';
    } else if (formData.title_pub.trim().length < 3) {
      errors.title_pub = 'El título debe tener al menos 3 caracteres';
    } else if (formData.title_pub.trim().length > 150) {
      errors.title_pub = 'El título no puede superar los 150 caracteres';
    }
    
    if (!formData.content_pub.trim()) {
      errors.content_pub = 'El contenido es obligatorio';
    } else if (formData.content_pub.trim().length < 10) {
      errors.content_pub = 'El contenido debe tener al menos 10 caracteres';
    }
    
    if (!formData.id_org) {
      errors.id_org = 'Debes seleccionar una asociación';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isManagerOfSelectedOrg = () => {
    if (!formData.id_org) return false;
    return userManagedOrgs.some(org => org.id_organization === formData.id_org);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editMode) {
        const updateResponse = await axiosInstance.patch('/publication/update', {
          id_publication: publicationData.id_publication,
          title_pub: formData.title_pub.trim(),
          content_pub: formData.content_pub.trim(),
          date_pub: formData.date_pub,
          time_pub: formData.time_pub,
          id_org: formData.id_org
        });
        
        if (updateResponse.data.error) {
          setError(prev => ({
            ...prev,
            updateError: updateResponse.data.error
          }));
          setIsSubmitting(false);
          return;
        }
        
        const updatedPublication = updateResponse.data.data;

        if (removeExistingImage && !imageFile) {
          //update: User wants to remove the existing image without adding a new one
          try {
            await axiosInstance.delete('/publication/remove-image', {
              data: {
                id_publication: updatedPublication.id_publication
              }
            });
            console.log('Image removed successfully');
          } catch (imgError) {
            console.error('Error removing image:', imgError);
            setError(prev => ({
              ...prev,
              imageRemoveError: 'Error al eliminar la imagen'
            }));
          }
        } else if (imageFile && updatedPublication) {
          //update: User wants to upload a new image or replace the existing one
          const formDataImage = new FormData();
          formDataImage.append('image', imageFile);

          try {
            console.log('Uploading publication image with headers:', {
              'x-publication-id': updatedPublication.id_publication,
              'x-organization-id': updatedPublication.id_org
            });

            const uploadResponse = await axiosInstance.post('/publication/upload-image', formDataImage, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-publication-id': updatedPublication.id_publication.toString(),
                'x-organization-id': updatedPublication.id_org.toString()
              }
            });

            console.log('Image upload response:', uploadResponse.data);

            if (uploadResponse.data.error) {
              console.error('Error in upload response:', uploadResponse.data.error);
              setError(prev => ({
                ...prev,
                imageUploadError: 'La publicación fue actualizada pero hubo un error al subir la imagen'
              }));
            }
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
            setError(prev => ({
              ...prev,
              imageUploadError: 'La publicación fue actualizada pero hubo un error al subir la imagen'
            }));
          }
        }
        
        setSuccess(prev => ({
          ...prev,
          updateSuccess: '¡Publicación actualizada exitosamente!'
        }));
        
        if (onSuccess) {
          onSuccess(updatedPublication);
        }
        
      } else {
        console.log('Creating new publication with data:', {
          title_pub: formData.title_pub.trim(),
          content_pub: formData.content_pub.trim(),
          date_pub: formData.date_pub,
          time_pub: formData.time_pub,
          id_user_pub: currentUser.id_user,
          id_org: formData.id_org
        });
        
        const createResponse = await axiosInstance.post('/publication/create', {
          title_pub: formData.title_pub.trim(),
          content_pub: formData.content_pub.trim(),
          date_pub: formData.date_pub,
          time_pub: formData.time_pub,
          id_user_pub: currentUser.id_user,
          id_org: formData.id_org
        });
        
        console.log('Create response:', createResponse.data);
        
        if (createResponse.data.error) {
          setError(prev => ({
            ...prev,
            createError: createResponse.data.error
          }));
          setIsSubmitting(false);
          return;
        }
        
        const newPublication = createResponse.data.data;
        console.log('New publication created:', newPublication);
        
        if (imageFile && newPublication) {
          const formDataImage = new FormData();
          formDataImage.append('image', imageFile);
          
          try {
            console.log('Uploading publication image with headers:', {
              'x-publication-id': newPublication.id_publication,
              'x-organization-id': newPublication.id_org
            });
            
            const uploadResponse = await axiosInstance.post('/publication/upload-image', formDataImage, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-publication-id': newPublication.id_publication.toString(),
                'x-organization-id': newPublication.id_org.toString()
              }
            });
            
            console.log('Image upload response:', uploadResponse.data);
            
            if (uploadResponse.data.error) {
              console.error('Error in upload response:', uploadResponse.data.error);
              setError(prev => ({
                ...prev,
                imageUploadError: 'La publicación fue creada pero hubo un error al subir la imagen'
              }));
            }
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
            setError(prev => ({
              ...prev,
              imageUploadError: 'La publicación fue creada pero hubo un error al subir la imagen'
            }));
          }
        }

        const isManager = isManagerOfSelectedOrg();
        setSuccess(prev => ({
          ...prev,
          createSuccess: isManager 
            ? '¡Publicación creada exitosamente! Como gestor, tu publicación está lista para ser aprobada.'
            : '¡Publicación creada! Pendiente de aprobación del gestor de la asociación.'
        }));
        
        setFormData({
          title_pub: '',
          content_pub: '',
          id_org: userManagedOrgs.length === 1 ? userManagedOrgs[0].id_organization : '',
          date_pub: new Date().toISOString().split('T')[0],
          time_pub: new Date().toTimeString().split(' ')[0].substring(0, 5)
        });
        handleRemoveImage();
        
        if (onSuccess) {
          onSuccess(newPublication);
        }
      }
      
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} publication:`, err);
      setError(prev => ({
        ...prev,
        submitError: `Error al ${editMode ? 'actualizar' : 'crear'} la publicación. Por favor intenta de nuevo.`
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (!editMode) {
      setFormData({
        title_pub: '',
        content_pub: '',
        id_org: userManagedOrgs.length === 1 ? userManagedOrgs[0].id_organization : '',
        date_pub: new Date().toISOString().split('T')[0],
        time_pub: new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
      handleRemoveImage();
    }
    setFormErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };
  
  const canCreatePublications = userManagedOrgs.length > 0 || (userOrganizations && userOrganizations.length > 0);
  
  if (!canCreatePublications) {
    return (
      <div className={styles.noAccessContainer}>
        <AlertCircle size={48} />
        <h3>No puedes crear publicaciones</h3>
        <p>Debes ser miembro de al menos una asociación para crear publicaciones.</p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {/* {editMode ? <Edit size={24} /> : <FileText size={24} />} */}
          <span>{editMode ? 'Editar Publicación' : 'Crear Nueva Publicación'}</span>
        </h2>
        <p className={styles.formSubtitle}>
          {editMode 
            ? 'Actualiza la información de tu publicación'
            : 'Crea una publicación para tu asociación. Será revisada por el gestor antes de ser publicada.'
          }
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="id_org" className={styles.label}>
            {/* <Building2 size={16} /> */}
            <span>Asociación </span>
          </label>
          <select
            id="id_org"
            name="id_org"
            value={formData.id_org}
            onChange={handleInputChange}
            className={`${styles.select} ${formErrors.id_org ? styles.inputError : ''}`}
            disabled={isSubmitting || userManagedOrgs.length === 1}
          >
            <option value="">Selecciona una asociación</option>
            {userOrganizations && userOrganizations.map(participation => {
              if (participation.organization) {
                return (
                  <option 
                    key={participation.organization.id_organization} 
                    value={participation.organization.id_organization}
                  >
                    {participation.organization.name_org}
                    {participation.org_managed ? ' (Gestor)' : ''}
                  </option>
                );
              }
              return null;
            })}
          </select>
          {formErrors.id_org && (
            <span className={styles.errorMessage}>
              <AlertCircle size={14} />
              {formErrors.id_org}
            </span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="title_pub" className={styles.label}>
            {/* <FileText size={16} /> */}
            <span>Título de la Publicación </span>
          </label>
          <input
            type="text"
            id="title_pub"
            name="title_pub"
            value={formData.title_pub}
            onChange={handleInputChange}
            placeholder="Ej: Reunión vecinal del próximo mes"
            className={`${styles.input} ${formErrors.title_pub ? styles.inputError : ''}`}
            maxLength={150}
            disabled={isSubmitting}
          />
          {formErrors.title_pub && (
            <span className={styles.errorMessage}>
              <AlertCircle size={14} />
              {formErrors.title_pub}
            </span>
          )}
          <span className={styles.charCount}>
            {formData.title_pub.length}/150 caracteres
          </span>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="content_pub" className={styles.label}>
            {/* <FileText size={16} /> */}
            <span>Contenido </span>
          </label>
          <textarea
            id="content_pub"
            name="content_pub"
            value={formData.content_pub}
            onChange={handleInputChange}
            placeholder="Escribe el contenido de tu publicación..."
            className={`${styles.textarea} ${formErrors.content_pub ? styles.inputError : ''}`}
            rows={6}
            disabled={isSubmitting}
          />
          {formErrors.content_pub && (
            <span className={styles.errorMessage}>
              <AlertCircle size={14} />
              {formErrors.content_pub}
            </span>
          )}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="date_pub" className={styles.label}>
              <Calendar size={16} />
              <span>Fecha</span>
            </label>
            <input
              type="date"
              id="date_pub"
              name="date_pub"
              value={formData.date_pub}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="time_pub" className={styles.label}>
              <Clock size={16} />
              <span>Hora</span>
            </label>
            <input
              type="time"
              id="time_pub"
              name="time_pub"
              value={formData.time_pub}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            {/* <Image size={16} /> */}
            <span>Imagen de la Publicación</span>
          </label>
          {console.log('🖼️ Rendering image section - imagePreview:', imagePreview)}

          {!imagePreview ? (
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                id="pub-image-input"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className={styles.fileInput}
                disabled={isSubmitting}
              />
              <label htmlFor="pub-image-input" className={styles.fileInputLabel}>
                <Image size={32} />
                <span>Haz clic para seleccionar una imagen</span>
                <span className={styles.fileInputHint}>
                  JPG, PNG o WEBP (máx. 10MB)
                </span>
              </label>
            </div>
          ) : (
            <div className={styles.imagePreviewContainer}>
              <img
                src={imagePreview}
                alt="Vista previa"
                className={styles.imagePreview}
              />
              <div className={styles.imageActions}>
                <input
                  type="file"
                  id="pub-image-input-change"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className={styles.fileInput}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="pub-image-input-change"
                  className={styles.changeImageButton}
                  title="Cambiar imagen"
                >
                  <Image size={16} />
                  <span>Cambiar</span>
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeImageButton}
                  disabled={isSubmitting}
                  title="Eliminar imagen"
                >
                  <X size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !formData.title_pub.trim() || !formData.content_pub.trim() || !formData.id_org}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                <span>{editMode ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{editMode ? 'Actualizar Publicación' : 'Crear Publicación'}</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {!editMode && (
        <div className={styles.infoNote}>
          <AlertCircle size={16} />
          <p>
            {isManagerOfSelectedOrg() 
              ? 'Como gestor de esta asociación, tu publicación necesitará ser aprobada antes de ser visible en el tablón informativo.'
              : 'Tu publicación será revisada por el gestor de la asociación antes de ser visible en el tablón informativo. Recibirás una notificación cuando tu publicación sea aprobada.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicationCreationForm;