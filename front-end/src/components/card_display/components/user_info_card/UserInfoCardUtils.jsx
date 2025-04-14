import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { uploadProfileImage, formatImageUrl } from '../../../../utils/image/imageUploadService.js';

export const UserInfoCardUtils = () => {
    // UPDATE: Using useAuth and useUI hooks instead of AppContext
    const {
        currentUser, setCurrentUser
    } = useAuth();

    const {
        setUploading, setError, uploading
    } = useUI();

    const [uploadProgress, setUploadProgress] = useState(0);
    const [localImageUrl, setLocalImageUrl] = useState(null);
    // Store the new image timestamp in a ref to avoid re-renders
    const imageTimestampRef = useRef(null);
    
    // Clean up object URLs when component unmounts
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
            return; // Simplemente retornamos sin mostrar error si el usuario canceló
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setError(prevError => ({
            ...prevError,
            imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
          }));
          return;
        }
        
        // Validate file size (max 10MB before optimization)
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

            // Create a temporary local URL for immediate display
            const localUrl = URL.createObjectURL(file);
            setLocalImageUrl(localUrl);

            setUploading(true);
            setUploadProgress(0);

            console.log('Comenzando carga de imagen de perfil para usuario:', currentUser.name_user);

            // Use the uploadProfileImage function from our service
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
                    // Clear local image URL on error
                    setLocalImageUrl(null);
                }
            });

            console.log('Imagen cargada. Ruta recibida:', imagePath);

            // Generate a new timestamp for this specific upload
            imageTimestampRef.current = Date.now();

            // Update user data with new image path
            const updatedUser = {
                ...currentUser,
                image_user: imagePath
            };

            console.log('Actualizando usuario con nueva imagen:', updatedUser);

            // Guardar en localStorage para persistencia entre recargas
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Actualizar el estado global
            setCurrentUser(updatedUser);
            
            // Limpiamos cualquier error previo
            setError(prevError => ({ ...prevError, imageError: '' }));
            
            // Mantener la URL local un poco más para asegurar una transición suave
            setTimeout(() => {
                setLocalImageUrl(null);
                console.log('URL local liberada, usando imagen del servidor');
            }, 2000); // Aumentamos a 2 segundos para dar más tiempo
            
        } catch (err) {
            console.error('Error en la carga de imagen:', err);
            setError(prevError => ({
                ...prevError,
                imageError: err.message || "Error al subir el archivo"
            }));
            // Clear local image URL on error
            setLocalImageUrl(null);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

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
        
        // Get the formatted base URL
        const formattedUrl = formatImageUrl(imagePath);
        
        // Only add the timestamp param if we have uploaded a new image
        if (imageTimestampRef.current) {
            const urlWithCache = formattedUrl + (formattedUrl.includes('?') ? '&' : '?') + '_t=' + imageTimestampRef.current;
            return urlWithCache;
        }
        
        // Regular use case - just return the formatted URL
        return formattedUrl;
    };

    return {
        getImageUrl,
        handleImageUpload,
        uploadProgress,
        localImageUrl
    };
};