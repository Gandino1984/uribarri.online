import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { ShopManagementUtils } from '../../ShopManagementUtils.jsx';

// UPDATE: Fixed to get setShowProductManagement from UIContext where it's defined
const ShopsListBySellerUtils = () => {
  
  const { currentUser } = useAuth();
  
  const {
    setError,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    setSuccess,
    setShowSuccessCard,
    setShowProductManagement // Now correctly getting this from UIContext
  } = useUI();
  
  const {
    setSelectedShop,
    setShops,
    shops,
    setShowShopCreationForm,
    selectedShop
  } = useShop();

  // Estado para llevar la cuenta de tiendas y el límite
  const [shopCount, setShopCount] = useState(0);
  const [shopLimit, setShopLimit] = useState(1); // Valor por defecto para usuarios no sponsor
  
  // Estado para gestionar el comportamiento de doble clic
  const [shopClickState, setShopClickState] = useState({
    lastClickedShopId: null,
    showCard: false,
    showProducts: false,
    lastClickTime: 0
  });
  
  // Utilizar la función fetchUserShops de ShopManagementUtils para evitar duplicación
  const { fetchUserShops: fetchShopsFromManagement } = ShopManagementUtils ? ShopManagementUtils() : { fetchUserShops: null };
  
  // Crear una versión memorizada de fetchUserShops que use la implementación compartida
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

  // Modificamos el handler para implementar la lógica de selección de tienda
  const handleSelectShop = useCallback((shop) => {
    const currentTime = new Date().getTime();
    const sameShop = shopClickState.lastClickedShopId === shop.id_shop;
    const isDoubleClick = sameShop && (currentTime - shopClickState.lastClickTime < 500); // 500ms threshold for double click
    
    console.log('ShopsListBySellerUtils - handleSelectShop called with shop:', shop.id_shop);
    console.log('Current click state:', {
      sameShop,
      lastClickedShop: shopClickState.lastClickedShopId,
      timeDiff: currentTime - shopClickState.lastClickTime,
      isDoubleClick
    });
    
    // Set the selected shop in the context
    setSelectedShop(shop);
    
    if (isDoubleClick) {
      // Double click or second click on the same shop - show products
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: false,
        showProducts: true,
        lastClickTime: currentTime
      });
      
      // Show product management
      setShowProductManagement(true);
      setShowShopCreationForm(false);
      
      console.log('Double click or second selection - showing product management');
    } else if (sameShop && shopClickState.showCard) {
      // Second click on the same shop - transition to product management
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: false,
        showProducts: true,
        lastClickTime: currentTime
      });
      
      // Show product management
      setShowProductManagement(true);
      setShowShopCreationForm(false);
      
      console.log('Second click on same shop - transitioning to product management');
    } else {
      // First click on a shop or click on a different shop - show shop card
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: true,
        showProducts: false,
        lastClickTime: currentTime
      });
      
      // Hide product management
      setShowProductManagement(false);
      setShowShopCreationForm(false);
      
      console.log('First click or new shop - showing shop card');
    }
  }, [
    shopClickState, 
    setSelectedShop, 
    setShowProductManagement, 
    setShowShopCreationForm
  ]);

  // Método para comprobar si una tienda está seleccionada
  const isShopSelected = useCallback((shopId) => {
    return shopClickState.lastClickedShopId === shopId;
  }, [shopClickState.lastClickedShopId]);

  // Método para saber si mostrar la tarjeta de tienda
  const shouldShowShopCard = useCallback(() => {
    return !!shopClickState.showCard && !!shopClickState.lastClickedShopId;
  }, [shopClickState]);

  const handleAddShop = useCallback(() => {
    // Verificar si el usuario ha alcanzado el límite
    if (shopCount >= shopLimit) {
      setError(prevError => ({ 
        ...prevError, 
        shopError: `Has alcanzado el límite de ${shopLimit} comercios. ${!currentUser?.category_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
      }));
      return;
    }
    
    // Resetear el estado de selección de tienda
    setShopClickState({
      lastClickedShopId: null,
      showCard: false,
      showProducts: false,
      lastClickTime: 0
    });
    
    // Limpiar la tienda seleccionada antes de mostrar el formulario
    setSelectedShop(null);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  }, [
    shopCount, 
    shopLimit, 
    currentUser, 
    setError, 
    setShowShopCreationForm, 
    setShowProductManagement, 
    setSelectedShop
  ]);

  // Mejorada la función handleUpdateShop
  const handleUpdateShop = useCallback((shop) => {
    console.log('ShopsListBySellerUtils - handleUpdateShop called with shop:', shop);
    
    // Resetear el estado de selección de tienda
    setShopClickState({
      lastClickedShopId: null,
      showCard: false,
      showProducts: false,
      lastClickTime: 0
    });
    
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
    // Solo ejecutar si isAccepted y shopToDelete son válidos
    if (!isAccepted || !shopToDelete) return;
    
    const deleteShop = async () => {
      try {
        const response = await axiosInstance.delete(`/shop/remove-by-id/with-products/${shopToDelete}`);
        
        if (response.data.error) {
          setError(prevError => ({ ...prevError, shopError: "Error al borrar el comercio" }));
          throw new Error(response.data.error);
        }
    
        setShops(existingShops => existingShops.filter(shop => shop.id_shop !== shopToDelete));
        
        // Si la tienda eliminada era la tienda seleccionada, limpiar los estados
        if (selectedShop && selectedShop.id_shop === shopToDelete) {
          setSelectedShop(null);
          setShopClickState({
            lastClickedShopId: null,
            showCard: false,
            showProducts: false,
            lastClickTime: 0
          });
        }
        
        // Mostrar mensaje de éxito
        setSuccess(prevSuccess => ({ ...prevSuccess, shopSuccess: "Comercio eliminado correctamente" }));
        setShowSuccessCard(true);
      } catch (err) {
        console.error('Error deleting shop:', err);
      } finally {
        // Limpiar estados después de la operación
        setShopToDelete(null);
        setIsAccepted(false);
      }
    };

    deleteShop();
  }, [isAccepted, shopToDelete, setError, setShops, setIsAccepted, setSuccess, setShowSuccessCard, selectedShop, setSelectedShop]);

  return {
    fetchUserShops,
    handleSelectShop,
    handleDeleteShop,
    handleAddShop,
    handleUpdateShop,
    shopCount,
    shopLimit,
    isShopSelected,
    shouldShowShopCard
  };
};

export default ShopsListBySellerUtils;