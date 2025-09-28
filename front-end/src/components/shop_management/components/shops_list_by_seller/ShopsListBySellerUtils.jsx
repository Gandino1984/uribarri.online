import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { ShopManagementUtils } from '../../ShopManagementUtils.jsx';

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
    setShowProductManagement
  } = useUI();
  
  const {
    setSelectedShop,
    setShops,
    shops,
    setShowShopCreationForm,
    selectedShop
  } = useShop();

  const [shopCount, setShopCount] = useState(0);
  
  const [shopClickState, setShopClickState] = useState({
    lastClickedShopId: null,
    showCard: false,
    showProducts: false,
    lastClickTime: 0
  });
  
  const { fetchUserShops: fetchShopsFromManagement } = ShopManagementUtils ? ShopManagementUtils() : { fetchUserShops: null };
  
  //update: Improved fetchUserShops to ensure it always uses the correct implementation
  const fetchUserShops = useCallback(() => {
    if (fetchShopsFromManagement && currentUser?.id_user) {
      console.log('ShopsListBySellerUtils - Calling fetchUserShops for user:', currentUser.id_user);
      return fetchShopsFromManagement();
    }
    
    //update: If no function available or no user, set empty shops array
    console.warn('Cannot fetch shops: missing function or user');
    setShops([]);
    return null;
  }, [fetchShopsFromManagement, currentUser?.id_user, setShops]);

  useEffect(() => {
    if (Array.isArray(shops)) {
      setShopCount(shops.length);
    }
  }, [shops]);

  const handleSelectShop = useCallback((shop) => {
    const currentTime = new Date().getTime();
    const sameShop = shopClickState.lastClickedShopId === shop.id_shop;
    const isDoubleClick = sameShop && (currentTime - shopClickState.lastClickTime < 500);
    
    console.log('ShopsListBySellerUtils - handleSelectShop called with shop:', shop.id_shop);
    console.log('Current click state:', {
      sameShop,
      lastClickedShop: shopClickState.lastClickedShopId,
      timeDiff: currentTime - shopClickState.lastClickTime,
      isDoubleClick
    });
    
    setSelectedShop(shop);
    
    if (isDoubleClick) {
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: false,
        showProducts: true,
        lastClickTime: currentTime
      });
      
      setShowProductManagement(true);
      setShowShopCreationForm(false);
      
      console.log('Double click or second selection - showing product management');
    } else if (sameShop && shopClickState.showCard) {
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: false,
        showProducts: true,
        lastClickTime: currentTime
      });
      
      setShowProductManagement(true);
      setShowShopCreationForm(false);
      
      console.log('Second click on same shop - transitioning to product management');
    } else {
      setShopClickState({
        lastClickedShopId: shop.id_shop,
        showCard: true,
        showProducts: false,
        lastClickTime: currentTime
      });
      
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

  const isShopSelected = useCallback((shopId) => {
    return shopClickState.lastClickedShopId === shopId;
  }, [shopClickState.lastClickedShopId]);

  const shouldShowShopCard = useCallback(() => {
    return !!shopClickState.showCard && !!shopClickState.lastClickedShopId;
  }, [shopClickState]);

  const handleAddShop = useCallback((shopLimit) => {
    const effectiveShopLimit = shopLimit || (currentUser?.contributor_user ? 3 : 1);
    
    if (shopCount >= effectiveShopLimit) {
      setError(prevError => ({ 
        ...prevError, 
        shopError: `Has alcanzado el límite de ${effectiveShopLimit} comercios. ${!currentUser?.contributor_user ? 'Conviértete en patrocinador para aumentar tu límite.' : ''}`
      }));
      return;
    }
    
    setShopClickState({
      lastClickedShopId: null,
      showCard: false,
      showProducts: false,
      lastClickTime: 0
    });
    
    setSelectedShop(null);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  }, [
    shopCount, 
    currentUser, 
    setError, 
    setShowShopCreationForm, 
    setShowProductManagement, 
    setSelectedShop
  ]);

  const handleUpdateShop = useCallback((shop) => {
    console.log('ShopsListBySellerUtils - handleUpdateShop called with shop:', shop);
    
    setShopClickState({
      lastClickedShopId: null,
      showCard: false,
      showProducts: false,
      lastClickTime: 0
    });
    
    setSelectedShop(shop);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
    
    console.log('Navigation states updated for edit: showShopCreationForm=true, showProductManagement=false');
  }, [setSelectedShop, setShowShopCreationForm, setShowProductManagement]);

  const [shopToDelete, setShopToDelete] = useState(null);

  const handleDeleteShop = useCallback((id_shop) => {
    setShopToDelete(id_shop);
    setModalMessage("Esta acción eliminará permanentemente el comercio y todos los productos asociados a él. ¿Deseas continuar?");
    setIsModalOpen(true);
  }, [setModalMessage, setIsModalOpen]);

  useEffect(() => {
    if (!isAccepted || !shopToDelete) return;
    
    const deleteShop = async () => {
      try {
        const response = await axiosInstance.delete(`/shop/remove-by-id/with-products/${shopToDelete}`);
        
        if (response.data.error) {
          setError(prevError => ({ ...prevError, shopError: "Error al borrar el comercio" }));
          throw new Error(response.data.error);
        }
    
        setShops(existingShops => existingShops.filter(shop => shop.id_shop !== shopToDelete));
        
        if (selectedShop && selectedShop.id_shop === shopToDelete) {
          setSelectedShop(null);
          setShopClickState({
            lastClickedShopId: null,
            showCard: false,
            showProducts: false,
            lastClickTime: 0
          });
        }
        
        setSuccess(prevSuccess => ({ ...prevSuccess, shopSuccess: "Comercio eliminado." }));
        setShowSuccessCard(true);
      } catch (err) {
        console.error('Error deleting shop:', err);
      } finally {
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
    isShopSelected,
    shouldShowShopCard
  };
};

export default ShopsListBySellerUtils;