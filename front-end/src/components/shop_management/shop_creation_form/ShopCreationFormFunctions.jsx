import { useContext } from 'react';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import AppContext from '../../../app_context/AppContext.js';

export const ShopCreationFormFunctions = () => {
  const {
    currentUser,
    setShops,
    setError,
    setShowShopCreationForm,
    setSelectedShop,
    setShowErrorCard,
    selectedShop,
    setInfo,
    setShowInfoCard,
    shops,
    // UPDATE: Agregamos setSuccess y setShowSuccessCard para mostrar mensajes de éxito
    setSuccess,
    setShowSuccessCard
  } = useContext(AppContext);

  const validateSchedule = (formData) => {
    const {
      morning_open,
      morning_close,
      afternoon_open,
      afternoon_close
    } = formData;

    // Convert time strings to comparable values
    const convertTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const morningOpenTime = convertTimeToMinutes(morning_open);
    const morningCloseTime = convertTimeToMinutes(morning_close);
    const afternoonOpenTime = convertTimeToMinutes(afternoon_open);
    const afternoonCloseTime = convertTimeToMinutes(afternoon_close);

    // Validation checks
    if (morningOpenTime >= morningCloseTime) {
      return {
        isValid: false,
        error: 'El horario de apertura de la mañana debe ser anterior al de cierre.'
      };
    }

    if (morningCloseTime >= afternoonOpenTime) {
      return {
        isValid: false,
        error: 'El horario de cierre de la mañana debe ser anterior al de apertura de la tarde.'
      };
    }

    if (afternoonOpenTime >= afternoonCloseTime) {
      return {
        isValid: false,
        error: 'El horario de apertura de la tarde debe ser anterior al de cierre.'
      };
    }

    return {
      isValid: true,
      error: null
    };
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
        return;
      }
  
      // Ensure the user ID matches the current user
      const shopData = {
        ...formData,
        id_user: currentUser.id_user
      };
  
      console.log('Creating shop with data:', shopData);
  
      // Check shop limits with explicit category check
      const userShops = Array.isArray(shops) ? shops.filter(shop => shop.id_user === currentUser.id_user) : [];
      const shopCount = userShops.length;
      
      // Fix: Properly check if user is sponsor based on category_user boolean value
      const isSponsor = currentUser?.category_user === true;
      const maxShops = isSponsor ? 2 : 1;
  
      console.log('Shop validation:', {
        shopCount,
        isSponsor,
        maxShops,
        currentUserCategory: currentUser?.category_user
      });
  
      if (shopCount >= maxShops) {
        setError(prevError => ({
          ...prevError,
          shopError: isSponsor 
            ? 'Has alcanzado el límite máximo de comercios permitidos (3).'
            : 'Para crear más comercios tienes que ser patrocinador del proyecto.'
        }));
        setShowErrorCard(true);
        return;
      }
  
      // Create the shop
      const response = await axiosInstance.post('/shop/create', shopData);
  
      if (response.data.error) {
        if (response.data.error.includes("Ya existe una comercio con ese nombre")) {
          setInfo(prevInfo => ({ ...prevInfo, shopInfo: "Ya existe una tienda con ese nombre" }));
          setShowInfoCard(true);
          return;
        }
        throw new Error(response.data.error);
      }
  
      // UPDATE: Agregar mensaje de éxito
      setSuccess(prevSuccess => ({
        ...prevSuccess,
        shopSuccess: "¡Comercio creado exitosamente!"
      }));
      setShowSuccessCard(true);
      
      // Actualizar la lista de tiendas y cerrar el formulario
      setShops(prevShops => [...(Array.isArray(prevShops) ? prevShops : []), response.data.data]);
      setShowShopCreationForm(false);
  
    } catch (err) {
      console.error('Error creating shop:', err);
      setError(prevError => ({ 
        ...prevError, 
        shopError: 'Error al crear el comercio.' 
      }));
      setShowErrorCard(true);
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
        afternoon_close: formData.afternoon_close
      });
  
      const isNameChanged = selectedShop && selectedShop.name_shop !== formData.name_shop;
      const endpoint = isNameChanged ? '/shop/update-with-folder' : '/shop/update';
  
      const updateData = {
        id_shop,
        name_shop: formData.name_shop,
        type_shop: formData.type_shop,
        subtype_shop: formData.subtype_shop,
        location_shop: formData.location_shop,
        id_user: currentUser.id_user,
        calification_shop: formData.calification_shop || 0,
        image_shop: formData.image_shop || '',
        morning_open: formData.morning_open,
        morning_close: formData.morning_close,
        afternoon_open: formData.afternoon_open,
        afternoon_close: formData.afternoon_close
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
          return;
        }
        setError(prevError => ({ ...prevError, shopError: response.data.error }));
        setShowErrorCard(true);
        throw new Error(response.data.error);
      }
  
      // UPDATE: Actualizar la tienda en el estado
      setShops(prevShops => 
        prevShops.map(shop => 
          shop.id_shop === id_shop ? { ...shop, ...updateData } : shop
        )
      );
      
      // UPDATE: Mostrar mensaje de éxito
      setSuccess(prevSuccess => ({
        ...prevSuccess,
        shopSuccess: "¡Comercio actualizado exitosamente!"
      }));
      setShowSuccessCard(true);
      
      // Cerrar el formulario y limpiar la selección
      setShowShopCreationForm(false);
      setSelectedShop(null);
    } catch (err) {
      if (!err.message?.includes("Ya existe una comercio con ese nombre")) {
        console.error('Error updating shop:', err);
        setError(prevError => ({ 
          ...prevError, 
          shopError: 'Error al actualizar el comercio. Por favor, inténtalo de nuevo.' 
        }));
        setShowErrorCard(true);
      }
    }
  };

  return {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule
  };
};