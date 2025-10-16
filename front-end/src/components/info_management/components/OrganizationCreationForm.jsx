// src/components/info_management/components/OrganizationCreationForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { Building2, MapPin, Image, X, Save, AlertCircle, Edit } from 'lucide-react';
import styles from '../../../../css/OrganizationCreationForm.module.css';

const OrganizationCreationForm = ({ onSuccess, onCancel, editMode = false, organizationData = null }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  const [formData, setFormData] = useState({
    name_org: editMode && organizationData ? organizationData.name_org : '',
    scope_org: editMode && organizationData ? organizationData.scope_org || '' : ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editMode && organizationData?.image_org 
      ? `${import.meta.env.VITE_API_URL}/${organizationData.image_org}`
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (editMode && organizationData) {
      setFormData({
        name_org: organizationData.name_org || '',
        scope_org: organizationData.scope_org || ''
      });
      if (organizationData.image_org) {
        setImagePreview(`${import.meta.env.VITE_API_URL}/${organizationData.image_org}`);
      }
    }
  }, [editMode, organizationData]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(prev => ({
          ...prev,
          imageError: 'Por favor selecciona una imagen válida (JPG, PNG o WEBP)'
        }));
        return;
      }
      
      // Validate file size (10MB max for initial upload - will be compressed)
      if (file.size > 10 * 1024 * 1024) {
        setError(prev => ({
          ...prev,
          imageError: 'La imagen no debe superar los 10MB'
        }));
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    if (editMode && organizationData?.image_org) {
      setImagePreview(`${import.meta.env.VITE_API_URL}/${organizationData.image_org}`);
    } else {
      setImagePreview(null);
    }
    // Reset file input
    const fileInput = document.getElementById('org-image-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name_org.trim()) {
      errors.name_org = 'El nombre de la asociación es obligatorio';
    } else if (formData.name_org.trim().length < 3) {
      errors.name_org = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name_org.trim().length > 100) {
      errors.name_org = 'El nombre no puede superar los 100 caracteres';
    }
    
    if (formData.scope_org && formData.scope_org.length > 255) {
      errors.scope_org = 'El ámbito no puede superar los 255 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editMode) {
        // Update existing organization
        const updateResponse = await axiosInstance.patch('/organization/update', {
          id_organization: organizationData.id_organization,
          name_org: formData.name_org.trim(),
          scope_org: formData.scope_org.trim() || null
        });
        
        if (updateResponse.data.error) {
          setError(prev => ({
            ...prev,
            updateError: updateResponse.data.error
          }));
          setIsSubmitting(false);
          return;
        }
        
        const updatedOrganization = updateResponse.data.data;
        
        // Upload new image if selected
        if (imageFile && updatedOrganization) {
          const formDataImage = new FormData();
          //update: Field name 'image' matches backend middleware expectation
          formDataImage.append('image', imageFile);
          
          try {
            //update: Use correct lowercase header 'x-organization-id' to match backend
            console.log('Uploading organization image for ID:', updatedOrganization.id_organization);
            
            const uploadResponse = await axiosInstance.post('/organization/upload-image', formDataImage, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-organization-id': updatedOrganization.id_organization.toString()
              }
            });
            
            console.log('Image upload response:', uploadResponse.data);
            
            if (uploadResponse.data.error) {
              console.error('Error in upload response:', uploadResponse.data.error);
              setError(prev => ({
                ...prev,
                imageUploadError: 'La asociación fue actualizada pero hubo un error al subir la imagen'
              }));
            }
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
            setError(prev => ({
              ...prev,
              imageUploadError: 'La asociación fue actualizada pero hubo un error al subir la imagen'
            }));
          }
        }
        
        setSuccess(prev => ({
          ...prev,
          updateSuccess: '¡asociación actualizada exitosamente!'
        }));
        
        // Call success callback with updated data
        if (onSuccess) {
          onSuccess(updatedOrganization);
        }
        
      } else {
        // Create new organization
        console.log('Creating new organization with data:', {
          id_user: currentUser.id_user,
          name_org: formData.name_org.trim(),
          scope_org: formData.scope_org.trim() || null
        });
        
        const createResponse = await axiosInstance.post('/organization/create', {
          id_user: currentUser.id_user,
          name_org: formData.name_org.trim(),
          scope_org: formData.scope_org.trim() || null
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
        
        const newOrganization = createResponse.data.data;
        console.log('New organization created:', newOrganization);
        
        // Upload image if selected
        if (imageFile && newOrganization) {
          const formDataImage = new FormData();
          //update: Field name 'image' matches backend middleware expectation
          formDataImage.append('image', imageFile);
          
          try {
            //update: Use correct lowercase header 'x-organization-id' to match backend
            console.log('Uploading organization image for ID:', newOrganization.id_organization);
            
            const uploadResponse = await axiosInstance.post('/organization/upload-image', formDataImage, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-organization-id': newOrganization.id_organization.toString()
              }
            });
            
            console.log('Image upload response:', uploadResponse.data);
            
            if (uploadResponse.data.error) {
              console.error('Error in upload response:', uploadResponse.data.error);
              setError(prev => ({
                ...prev,
                imageUploadError: 'La asociación fue creada pero hubo un error al subir la imagen'
              }));
            }
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
            setError(prev => ({
              ...prev,
              imageUploadError: 'La asociación fue creada pero hubo un error al subir la imagen'
            }));
          }
        }
        
        setSuccess(prev => ({
          ...prev,
          createSuccess: '¡asociación creada exitosamente! Pendiente de aprobación del administrador.'
        }));
        
        // Reset form
        setFormData({
          name_org: '',
          scope_org: ''
        });
        handleRemoveImage();
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(newOrganization);
        }
      }
      
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} organization:`, err);
      setError(prev => ({
        ...prev,
        submitError: `Error al ${editMode ? 'actualizar' : 'crear'} la asociación. Por favor intenta de nuevo.`
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form
    if (!editMode) {
      setFormData({
        name_org: '',
        scope_org: ''
      });
      handleRemoveImage();
    }
    setFormErrors({});
    
    // Call cancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {editMode ? <Edit size={24} /> : <Building2 size={24} />}
          <span>{editMode ? 'Editar asociación' : 'Crear Nueva asociación'}</span>
        </h2>
        <p className={styles.formSubtitle}>
          {editMode 
            ? 'Actualiza la información de tu asociación'
            : 'Como gestor, puedes crear una nueva asociación para tu comunidad'
          }
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Organization Name Field */}
        <div className={styles.formGroup}>
          <label htmlFor="name_org" className={styles.label}>
            <Building2 size={16} />
            <span>Nombre de la asociación *</span>
          </label>
          <input
            type="text"
            id="name_org"
            name="name_org"
            value={formData.name_org}
            onChange={handleInputChange}
            placeholder="Ej: Asociación Vecinal Uribarri"
            className={`${styles.input} ${formErrors.name_org ? styles.inputError : ''}`}
            maxLength={100}
            disabled={isSubmitting}
          />
          {formErrors.name_org && (
            <span className={styles.errorMessage}>
              <AlertCircle size={14} />
              {formErrors.name_org}
            </span>
          )}
          <span className={styles.charCount}>
            {formData.name_org.length}/100 caracteres
          </span>
        </div>
        
        {/* Organization Scope Field */}
        <div className={styles.formGroup}>
          <label htmlFor="scope_org" className={styles.label}>
            <MapPin size={16} />
            <span>Ámbito de Actuación</span>
          </label>
          <textarea
            id="scope_org"
            name="scope_org"
            value={formData.scope_org}
            onChange={handleInputChange}
            placeholder="Describe el ámbito o área de actuación de la asociación (opcional)"
            className={`${styles.textarea} ${formErrors.scope_org ? styles.inputError : ''}`}
            maxLength={255}
            rows={3}
            disabled={isSubmitting}
          />
          {formErrors.scope_org && (
            <span className={styles.errorMessage}>
              <AlertCircle size={14} />
              {formErrors.scope_org}
            </span>
          )}
          <span className={styles.charCount}>
            {formData.scope_org.length}/255 caracteres
          </span>
        </div>
        
        {/* Image Upload Field */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <Image size={16} />
            <span>Imagen de la asociación</span>
          </label>
          
          {!imagePreview ? (
            <div className={styles.imageUploadArea}>
              <input
                type="file"
                id="org-image-input"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className={styles.fileInput}
                disabled={isSubmitting}
              />
              <label htmlFor="org-image-input" className={styles.fileInputLabel}>
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
              <button
                type="button"
                onClick={handleRemoveImage}
                className={styles.removeImageButton}
                disabled={isSubmitting}
                title={imageFile ? "Eliminar imagen" : "Cambiar imagen"}
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
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
            disabled={isSubmitting || !formData.name_org.trim()}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                <span>{editMode ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{editMode ? 'Actualizar asociación' : 'Crear asociación'}</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Information Note */}
      {!editMode && (
        <div className={styles.infoNote}>
          <AlertCircle size={16} />
          <p>
            Al crear una asociación, automáticamente serás asignado como su gestor. 
            Podrás gestionar los participantes y las publicaciones de la asociación.
            La asociación deberá ser aprobada por un administrador antes de ser visible públicamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizationCreationForm;