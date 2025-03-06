import { useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import AppContext from '../../../app_context/AppContext.js';
import { ShopManagementFunctions } from '../ShopManagementFunctions.jsx';

export const ShopsListBySellerFunctions = () => {
  const {
    setSelectedShop,
    setShops,
    shops,
    setShowShopCreationForm,
    setShowProductManagement,
    setError,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    currentUser,
    // UPDATE: Añadimos setSuccess y setShowSuccessCard para mostrar mensajes de éxito
    setSuccess,
    setShowSuccessCard
  } = useContext(AppContext);

  // Estado para llevar la cuenta de tiendas y el límite
  const [shopCount, setShopCount] = useState(0);
  const [shopLimit, setShopLimit] = useState(1); // Valor por defecto para usuarios no sponsor
  
  // UPDATE: Utilizar la función fetchUserShops de ShopManagementFunctions para evitar duplicación
  const { fetchUserShops: fetchShopsFromManagement } = ShopManagementFunctions ? ShopManagementFunctions() : { fetchUserShops: null };
  
  // UPDATE: Crear una versión memorizada de fetchUserShops que use la implementación compartida
  const fetchUserShops = useCallback(() => {
    if (fetchShopsFromManagement) {
      return fetchShopsFromManagement();
    }
    
    // Fallback en caso de que no se pueda obtener la función compartida
    console.warn('Using fallback shop fetch implementation');
    return null;
  }, [fetchShopsFromManagement]);

  // Determinar el límite de tiendas basado en la categoría del usuario
  useEffect(() => {
    if (currentUser?.category_user) {
      setShopLimit(2); // Límite para usuarios sponsor
    } else {
      setShopLimit(1); // Límite para usuarios no sponsor
    }
  }, [currentUser]);

  // Establecer el conteo de tiendas cada vez que cambian las tiendas
  useEffect(() => {
    if (Array.isArray(shops)) {
      setShopCount(shops.length);
    }
  }, [shops]);

  const handleSelectShop = useCallback((shop) => {
    console.log('ShopsListBySellerFunctions - handleSelectShop called with shop:', shop);
    
    // First set the selected shop
    setSelectedShop(shop);
    
    // Then enable product management mode
    setShowProductManagement(true);
    
    // Make sure shop creation form is hidden
    setShowShopCreationForm(false);
    
    console.log('Navigation states updated: showProductManagement=true, showShopCreationForm=false');
  }, [setSelectedShop, setShowProductManagement, setShowShopCreationForm]);

  const handleAddShop = useCallback(() => {
    // Verificar si el usuario ha alcanzado el límite
    if (shopCount >= shopLimit) {
      setError(prevError => ({ 
        ...prevError, 
        shopError: `Has alcanzado el límite de ${shopLimit} comercios. ${!currentUser?.category_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
      }));
      return;
    }
    
    // UPDATE: Limpiar la tienda seleccionada antes de mostrar el formulario
    setSelectedShop(null);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  }, [shopCount, shopLimit, currentUser, setError, setShowShopCreationForm, setShowProductManagement, setSelectedShop]);

  // UPDATE: Mejorada la función handleUpdateShop
  const handleUpdateShop = useCallback((shop) => {
    console.log('ShopsListBySellerFunctions - handleUpdateShop called with shop:', shop);
    
    // Primero configuramos la tienda seleccionada
    setSelectedShop(shop);
    
    // Luego mostramos el formulario y ocultamos la gestión de productos
    setShowShopCreationForm(true);
    setShowProductManagement(false);
    
    console.log('Navigation states updated for edit: showShopCreationForm=true, showProductManagement=false');
  }, [setSelectedShop, setShowShopCreationForm, setShowProductManagement]);

  // Keep track of the shop to be deleted
  const [shopToDelete, setShopToDelete] = useState(null);

  const handleDeleteShop = useCallback((id_shop) => {
    setShopToDelete(id_shop);
    setModalMessage("Esta acción eliminará permanentemente el comercio y todos los productos asociados a él. ¿Deseas continuar?");
    setIsModalOpen(true);
  }, [setModalMessage, setIsModalOpen]);

  // Watch for modal confirmation
  useEffect(() => {
    // UPDATE: Solo ejecutar si isAccepted y shopToDelete son válidos
    if (!isAccepted || !shopToDelete) return;
    
    const deleteShop = async () => {
      try {
        const response = await axiosInstance.delete(`/shop/remove-by-id/with-products/${shopToDelete}`);
        
        if (response.data.error) {
          setError(prevError => ({ ...prevError, shopError: "Error al borrar el comercio" }));
          throw new Error(response.data.error);
        }
    
        setShops(existingShops => existingShops.filter(shop => shop.id_shop !== shopToDelete));
        
        // UPDATE: Mostrar mensaje de éxito
        setSuccess(prevSuccess => ({ ...prevSuccess, shopSuccess: "Comercio eliminado correctamente" }));
        setShowSuccessCard(true);
      } catch (err) {
        console.error('Error deleting shop:', err);
      } finally {
        // UPDATE: Limpiar estados después de la operación
        setShopToDelete(null);
        setIsAccepted(false);
      }
    };

    deleteShop();
  }, [isAccepted, shopToDelete, setError, setShops, setIsAccepted, setSuccess, setShowSuccessCard]);

  return {
    fetchUserShops,
    handleSelectShop,
    handleDeleteShop,
    handleAddShop,
    handleUpdateShop,
    shopCount,
    shopLimit
  };
};