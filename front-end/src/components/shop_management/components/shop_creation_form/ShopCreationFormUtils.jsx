import { useCallback } from 'react';
import axiosInstance from '../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
// Importing image utilities correctly
import { 
  uploadShopCover, 
  formatImageUrl 
} from '../../../../utils/image/imageUploadService.js';
import { validateImageFile } from '../../../../utils/image/imageValidation.js';
import { optimizeImage } from '../../../../utils/image/imageOptimizer.js';

export const ShopCreationFormUtils = () => {
  const { currentUser } = useAuth();
  
  const {
    setError,
    setShowErrorCard,
    setInfo,
    setShowInfoCard,
    setSuccess,
    setShowSuccessCard,
    setUploading
  } = useUI();
  
  const {
    setShops,
    setShowShopCreationForm,
    setSelectedShop,
    selectedShop,
    shops,
    startFormExitAnimation
  } = useShop();

  // Function to refresh the list of shops from the server
  const refreshShopsList = useCallback(async () => {
    try {
      if (!currentUser?.id_user) {
        console.warn('No se puede refrescar la lista de tiendas: falta el ID de usuario');
        return;
      }

      console.log('Refrescando lista de tiendas para el usuario:', currentUser.id_user);
      
      //update: Use POST endpoint as per original code
      const response = await axiosInstance.post('/shop/by-user-id', {
        id_user: currentUser.id_user
      });
      
      if (response?.data?.data) {
        const fetchedShops = response.data.data;
        console.log(`Se encontraron ${fetchedShops.length} tiendas para el usuario:`, fetchedShops);
        
        setShops(fetchedShops);
        
        return fetchedShops;
      } else {
        console.warn('Respuesta inválida al obtener tiendas:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al refrescar lista de tiendas:', error);
      return [];
    }
  }, [currentUser?.id_user, setShops]);

  // Función de validación actualizada para soportar horarios continuos
  const validateSchedule = (formData) => {
    const {
      morning_open,
      morning_close,
      afternoon_open,
      afternoon_close
    } = formData;

    // Check if we have at least opening and closing times
    if (!morning_open || !afternoon_close) {
      return {
        isValid: false,
        error: 'Se requieren al menos los horarios de apertura y cierre.'
      };
    }

    // Convert time strings to comparable values
    const convertTimeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const morningOpenTime = convertTimeToMinutes(morning_open);
    const afternoonCloseTime = convertTimeToMinutes(afternoon_close);
    
    // Check for continuous schedule (no rest period)
    const hasContinuousSchedule = !morning_close || !afternoon_open || 
                                  morning_close === '' || afternoon_open === '';
    
    if (hasContinuousSchedule) {
      // For continuous schedule, just verify that opening is before closing
      if (morningOpenTime >= afternoonCloseTime) {
        return {
          isValid: false,
          error: 'Error en el horario.'
        };
      }
    } else {
      // For schedules with rest periods, validate all four times
      const morningCloseTime = convertTimeToMinutes(morning_close);
      const afternoonOpenTime = convertTimeToMinutes(afternoon_open);
      
      if (morningOpenTime >= morningCloseTime) {
        return {
          isValid: false,
          error: 'Error en el horario de apertura de la mañana.'
        };
      }

      if (morningCloseTime >= afternoonOpenTime) {
        return {
          isValid: false,
          error: 'Error en el horario de cierre de la mañana.'
        };
      }

      if (afternoonOpenTime >= afternoonCloseTime) {
        return {
          isValid: false,
          error: 'Error en el horario de apertura de la tarde.'
        };
      }
    }

    return {
      isValid: true,
      error: null
    };
  };

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (file, shopId, onProgress) => {
    if (!file || !shopId) {
      setError(prevError => ({
        ...prevError,
        imageError: "No hay archivo de imagen o comercio seleccionado"
      }));
      return false;
    }

    try {
      // Primero validamos la imagen
      await validateImageFile(file);
      
      //update: Always optimize and convert to WebP, enforcing 1MB limit
      let optimizedFile = file;
      try {
        // Show initial info message
        setInfo(prevInfo => ({
          ...prevInfo,
          imageInfo: "Optimizando imagen..."
        }));
        setShowInfoCard(true);
        
        //update: Optimize image with strict 1MB limit
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          format: 'image/webp',
          maxSizeKB: 1024 // Strict 1MB limit
        });
        
        console.log('Imagen optimizada:', {
          originalSize: Math.round(file.size / 1024) + 'KB',
          optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB',
          originalFormat: file.type,
          optimizedFormat: optimizedFile.type
        });
        
        //update: Verify the optimized file is under 1MB
        if (optimizedFile.size > 1024 * 1024) {
          console.warn('La imagen optimizada aún excede 1MB, pero procederemos con el mejor resultado posible');
        }
      } catch (optimizeError) {
        console.error('Error al optimizar imagen:', optimizeError);
        setError(prevError => ({
          ...prevError,
          imageError: "Error al optimizar la imagen. Por favor, intente con otra imagen."
        }));
        setShowErrorCard(true);
        return false;
      }

      setUploading(true);
      
      // Creamos FormData directamente para asegurarnos de que el campo tenga el nombre correcto
      const formData = new FormData();
      formData.append('shopCover', optimizedFile); // Este nombre debe coincidir con lo esperado en el backend
      
      // Configuramos la petición
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Shop-ID': shopId
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(progress);
        }
      };
      
      console.log('Enviando petición a /shop/upload-cover-image con formData:', {
        file: optimizedFile.name,
        size: optimizedFile.size,
        type: optimizedFile.type,
        shopId: shopId
      });
      
      // Hacemos la petición directamente en lugar de usar la función de utilidad
      const response = await axiosInstance.post('/shop/upload-cover-image', formData, config);
      
      console.log('Respuesta de subida de imagen:', response.data);
      
      if (!response.data?.data?.image_shop) {
        throw new Error('Respuesta inválida del servidor: falta la ruta image_shop');
      }
      
      const imagePath = response.data.data.image_shop;

      if (imagePath) {
        // Actualizamos la tienda en el array de tiendas con la nueva imagen
        setShops(prevShops => {
          // Si prevShops no es un array o está vacío, manejarlo
          if (!Array.isArray(prevShops) || prevShops.length === 0) {
            console.warn('Array de tiendas vacío o inválido al actualizar imagen');
            return prevShops;
          }
          
          console.log('Actualizando imagen de tienda:', shopId, 'Ruta:', imagePath);
          
          // Encontrar y actualizar la tienda
          return prevShops.map(shop => {
            if (shop.id_shop === shopId) {
              console.log('Actualizando tienda con nueva imagen:', shop.name_shop);
              return { ...shop, image_shop: imagePath };
            }
            return shop;
          });
        });
        
        setSuccess(prevSuccess => ({
          ...prevSuccess,
          imageSuccess: "Imagen subida correctamente (formato WebP)"
        }));
        setShowSuccessCard(true);
        
        // Refrescar la lista de tiendas después de subir la imagen
        await refreshShopsList();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setError(prevError => ({
        ...prevError,
        imageError: error.message || "Error al subir la imagen"
      }));
      setShowErrorCard(true);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleCreateShop = async (formData) => {
    try {
      // Ensure we have a valid user ID and category information
      if (!currentUser?.id_user || !formData.id_user) {
        console.error('Missing user ID:', { currentUser, formData });
        setError(prevError => ({
          ...prevError,
          shopError: 'Error: Usuario no identificado'
        }));
        setShowErrorCard(true);
        return false;
      }
      
      //update: Validate that type ID is provided (removed subtype validation)
      if (!formData.id_type) {
        setError(prevError => ({
          ...prevError,
          shopError: 'Debe seleccionar un tipo de comercio'
        }));
        setShowErrorCard(true);
        return false;
      }
  
      // Ensure the user ID matches the current user
      const shopData = {
        ...formData,
        id_user: currentUser.id_user,
        has_delivery: formData.has_delivery !== undefined ? formData.has_delivery : false,
        open_monday: formData.open_monday !== undefined ? formData.open_monday : true,
        open_tuesday: formData.open_tuesday !== undefined ? formData.open_tuesday : true,
        open_wednesday: formData.open_wednesday !== undefined ? formData.open_wednesday : true,
        open_thursday: formData.open_thursday !== undefined ? formData.open_thursday : true,
        open_friday: formData.open_friday !== undefined ? formData.open_friday : true,
        open_saturday: formData.open_saturday !== undefined ? formData.open_saturday : true,
        open_sunday: formData.open_sunday !== undefined ? formData.open_sunday : false
      };
  
      console.log('Creating shop with data:', shopData);
  
      // Check shop limits with explicit category check
      const userShops = Array.isArray(shops) ? shops.filter(shop => shop.id_user === currentUser.id_user) : [];
      const shopCount = userShops.length;
      
      const isSponsor = currentUser?.contributor_user === true;
      const maxSponsorShops = parseInt(import.meta?.env?.VITE_MAX_SPONSOR_SHOPS || '3');
      const maxRegularShops = parseInt(import.meta?.env?.VITE_MAX_REGULAR_SHOPS || '1');
      const maxShops = isSponsor ? maxSponsorShops : maxRegularShops;
  
      console.log('Shop validation:', {
        shopCount,
        isSponsor,
        maxShops,
        currentUserCategory: currentUser?.contributor_user
      });
  
      if (shopCount >= maxShops) {
        setError(prevError => ({
          ...prevError,
          shopError: isSponsor 
            ? `Has alcanzado el límite máximo de comercios permitidos (${maxSponsorShops}).`
            : 'Para crear más comercios tienes que ser patrocinador del proyecto.'
        }));
        setShowErrorCard(true);
        return false;
      }
  
      // Create the shop
      const response = await axiosInstance.post('/shop/create', shopData);
  
      if (response.data.error) {
        if (response.data.error.includes("Ya existe una comercio con ese nombre")) {
          setInfo(prevInfo => ({ ...prevInfo, shopInfo: "Ya existe una tienda con ese nombre" }));
          setShowInfoCard(true);
          return false;
        }
        throw new Error(response.data.error);
      }
  
      // Obtener la tienda creada
      const newShop = response.data.data;
      console.log('Nueva tienda creada con éxito:', newShop);
      
      // IMPORTANT: Asegurarnos de que la tienda tenga todos los campos necesarios
      if (!newShop || !newShop.id_shop) {
        console.error('La respuesta del servidor no incluye los datos esperados de la tienda:', response.data);
        throw new Error('Respuesta inválida del servidor');
      }
      
      // Actualizar la lista de tiendas inmediatamente para que aparezca en la lista
      console.log('Estado actual de las tiendas antes de agregar:', shops);
      
      const updatedShops = Array.isArray(shops) ? [...shops, newShop] : [newShop];
      console.log('Lista actualizada de tiendas después de agregar:', updatedShops);
      
      // Actualizar el estado global con la nueva lista que incluye la tienda creada
      setShops(updatedShops);
      
      // Agregar mensaje de éxito
      setSuccess(prevSuccess => ({
        ...prevSuccess,
        shopSuccess: "Comercio creado."
      }));
      setShowSuccessCard(true);
      
      // Cerrar el formulario después de actualizar la lista
      setShowShopCreationForm(false);
      
      // También intentamos refrescar desde el servidor para estar seguros
      try {
        await refreshShopsList();
      } catch (refreshError) {
        console.error('Error al refrescar la lista después de crear tienda:', refreshError);
        // Continuamos incluso si el refresco falla, ya que agregamos manualmente
      }
  
      // Devolvemos el objeto tienda para poder utilizar el ID
      return newShop;
    } catch (err) {
      console.error('Error creating shop:', err);
      setError(prevError => ({ 
        ...prevError, 
        shopError: 'Error al crear el comercio.' 
      }));
      setShowErrorCard(true);
      return false;
    }
  };

  const handleUpdateShop = async (id_shop, formData) => {
    try {
      console.log('FormData being sent:', {
        id_shop,
        ...formData,
        morning_open: formData.morning_open,
        morning_close: formData.morning_close,
        afternoon_open: formData.afternoon_open,
        afternoon_close: formData.afternoon_close,
        has_delivery: formData.has_delivery,
        open_monday: formData.open_monday,
        open_tuesday: formData.open_tuesday,
        open_wednesday: formData.open_wednesday,
        open_thursday: formData.open_thursday,
        open_friday: formData.open_friday,
        open_saturday: formData.open_saturday,
        open_sunday: formData.open_sunday
      });
      
      //update: Validate that type ID is provided (removed subtype validation)
      if (!formData.id_type) {
        setError(prevError => ({
          ...prevError,
          shopError: 'Debe seleccionar un tipo de comercio'
        }));
        setShowErrorCard(true);
        return false;
      }
  
      const isNameChanged = selectedShop && selectedShop.name_shop !== formData.name_shop;
      const endpoint = isNameChanged ? '/shop/update-with-folder' : '/shop/update';
  
      const updateData = {
        id_shop,
        name_shop: formData.name_shop,
        //update: Use id_type only (removed id_subtype)
        id_type: formData.id_type,
        location_shop: formData.location_shop,
        id_user: currentUser.id_user,
        calification_shop: formData.calification_shop || 0,
        image_shop: formData.image_shop || '',
        morning_open: formData.morning_open,
        morning_close: formData.morning_close,
        afternoon_open: formData.afternoon_open,
        afternoon_close: formData.afternoon_close,
        has_delivery: formData.has_delivery !== undefined ? formData.has_delivery : false,
        open_monday: formData.open_monday !== undefined ? formData.open_monday : true,
        open_tuesday: formData.open_tuesday !== undefined ? formData.open_tuesday : true,
        open_wednesday: formData.open_wednesday !== undefined ? formData.open_wednesday : true,
        open_thursday: formData.open_thursday !== undefined ? formData.open_thursday : true,
        open_friday: formData.open_friday !== undefined ? formData.open_friday : true,
        open_saturday: formData.open_saturday !== undefined ? formData.open_saturday : true,
        open_sunday: formData.open_sunday !== undefined ? formData.open_sunday : false
      };
  
      if (isNameChanged) {
        updateData.old_name_shop = selectedShop.name_shop;
      }
  
      console.log('Making request to:', endpoint);
      console.log('UpdateData being sent:', updateData);
  
      const response = await axiosInstance.patch(endpoint, updateData);
      console.log('Response received:', response.data);
  
      if (response.data.error) {
        if (response.data.error.includes("Ya existe una comercio con ese nombre")) {
          setInfo(prevInfo => ({ ...prevInfo, shopInfo: "Ya existe una tienda con ese nombre" }));
          setShowInfoCard(true);
          return false;
        }
        setError(prevError => ({ ...prevError, shopError: response.data.error }));
        setShowErrorCard(true);
        throw new Error(response.data.error);
      }
  
      // Actualizar la tienda en el estado con los datos completos de la respuesta
      const updatedShop = response.data.data || { ...updateData, id_shop };
      
      setShops(prevShops => {
        if (!Array.isArray(prevShops)) {
          console.warn('prevShops no es un array, inicializando un nuevo array');
          return [updatedShop];
        }
        
        // Crear una copia para no mutar el estado directamente
        const updatedShops = [...prevShops];
        
        // Encontrar el índice de la tienda a actualizar
        const shopIndex = updatedShops.findIndex(shop => shop.id_shop === id_shop);
        
        if (shopIndex !== -1) {
          // Mantener los campos existentes y sobrescribir con los nuevos
          updatedShops[shopIndex] = { 
            ...updatedShops[shopIndex], 
            ...updatedShop
          };
          console.log('Tienda actualizada en la posición', shopIndex, updatedShops[shopIndex]);
        } else {
          // Si no existe, agregarla (caso inusual pero posible)
          console.log('La tienda no existía en la lista, agregándola');
          updatedShops.push(updatedShop);
        }
        
        return updatedShops;
      });
      
      // Mostrar mensaje de éxito
      setSuccess(prevSuccess => ({
        ...prevSuccess,
        shopSuccess: "Comercio actualizado."
      }));
      setShowSuccessCard(true);
      
      // Cerrar el formulario y limpiar la selección
      setShowShopCreationForm(false);
      setSelectedShop(null);
      
      // Refrescar la lista de tiendas desde el servidor
      await refreshShopsList();
      
      // Devolver un objeto con el ID de la tienda para la subida de imagen
      return { id_shop };
    } catch (err) {
      if (!err.message?.includes("Ya existe una comercio con ese nombre")) {
        console.error('Error updating shop:', err);
        setError(prevError => ({ 
          ...prevError, 
          shopError: 'Error al actualizar el comercio. Por favor, inténtalo de nuevo.' 
        }));
        setShowErrorCard(true);
      }
      return false;
    }
  };

  return {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload,
    refreshShopsList
  };
};