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
    setShowInfoCard
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
      const response = await axiosInstance.post('/shop/create', {
        ...formData,
        id_user: currentUser.id
      });

      if (response.data.error) {
        // Check if the error is about existing shop name
        if (response.data.error.includes("Ya existe una comercio con ese nombre")) {
          setInfo(prevInfo => ({ ...prevInfo, shopInfo: "Ya existe una tienda con ese nombre" }));
          setShowInfoCard(true);
          return; // Exit early to prevent further error handling
        }
        // For other errors, use the error card
        setError(prevError => ({ ...prevError, shopError: response.data.error }));
        setShowErrorCard(true);
        throw new Error(response.data.error);
      }

      setShops(prevShops => [...prevShops, response.data.data]);
      setShowShopCreationForm(false);
    } catch (err) {
      if (!err.message?.includes("Ya existe una comercio con ese nombre")) {
        console.error('Error creating shop:', err);
        setError(prevError => ({ 
          ...prevError, 
          shopError: 'Error al crear el comercio. Por favor, inténtalo de nuevo.' 
        }));
        setShowErrorCard(true);
      }
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
        id_user: currentUser.id,
        calification_shop: formData.calification_shop || 0,
        image_shop: formData.image_shop || '',
        // Explicitly include schedule fields
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
  
      setShops(prevShops => 
        prevShops.map(shop => 
          shop.id_shop === id_shop ? { ...shop, ...updateData } : shop
        )
      );
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