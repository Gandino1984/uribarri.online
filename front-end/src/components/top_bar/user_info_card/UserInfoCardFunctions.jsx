import { useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { validateImageFile } from '../../../utils/image/imageValidation.js';

export const UserInfoCardFunctions = () => {
    const {
        currentUser, setCurrentUser,
        setUploading, setError,
    } = useContext(AppContext);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];

        setError(prevError => ({ ...prevError, imageError: "" }));
        
        if (!file) {
            console.error('-> UserInfoCardFunctions - handleImageUpload() - No se ha seleccionado un archivo');
            setError(prevError => ({ ...prevError, imageError: "Error al subir el archivo" }));
            return;
        }

        try {
            await validateImageFile(file);

            if (!currentUser?.name_user) {
                throw new Error('No hay usuario activo');
            }

            const formData = new FormData();

            formData.append('name_user', currentUser.name_user);

            formData.append('profileImage', file);

            setUploading(true);

            const response = await axiosInstance.post('/user/upload-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.data?.image_user) {
                const updatedUser = {
                    ...currentUser,
                    image_user: response.data.data.image_user
                };

                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
                
                // clearError('imageError');

                setError(prevError => ({ ...prevError, imageError: '' }));
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(prevError => ({
                ...prevError,
                imageError: err.message || "Error al subir el archivo"
            }));
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            console.error('-> UserInfoCardFunctions - getImageUrl() - No se ha proporcionado una ruta de imagen');
            return null;
        }
            
        const cleanPath = imagePath.replace(/^\/+/, '');
        const baseUrl = axiosInstance.defaults.baseURL || '';
        const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");
        
        return imageUrl;
    };

    return {
        getImageUrl,
        handleImageUpload
    };
};