import React, { useContext, useEffect, useRef } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopsListBySeller from './shops_list_by_seller/ShopsListBySeller.jsx';
import ShopCreationForm from './shop_creation_form/ShopCreationForm.jsx';
import ProductManagement from '../shop_management/product_management/ProductManagement.jsx';
import { ShopManagementFunctions } from './ShopManagementFunctions.jsx';

const ShopManagement = () => {
  const { 
    currentUser, 
    showShopCreationForm, 
    isAddingShop,
    shops,
    setshowShopManagement,
    setIsAddingShop,
    setShowShopCreationForm,
    showProductManagement,
    selectedShop
  } = useContext(AppContext);
  
  // UPDATE: Usar un ref para rastrear si ya hemos buscado las tiendas
  const hasInitiallyFetchedShops = useRef(false);
  
  // Use ShopManagementFunctions to get fetchUserShops, but don't destructure it
  // to avoid recreation on each render
  const shopManagementFunctions = ShopManagementFunctions ? ShopManagementFunctions() : {};

  // UPDATE: Un solo efecto para el fetch inicial, usando hasInitiallyFetchedShops.current para evitar fetch redundantes
  useEffect(() => {
    if (
      !hasInitiallyFetchedShops.current && 
      shopManagementFunctions.fetchUserShops && 
      currentUser?.id_user
    ) {
      console.log('Initial fetch of shops (once only) for user:', currentUser.id_user);
      shopManagementFunctions.fetchUserShops();
      hasInitiallyFetchedShops.current = true;
    }
  }, [currentUser?.id_user, shopManagementFunctions]);

  // Check if the user is a seller
  if (!currentUser || currentUser.type_user !== 'seller') {
    console.log('Non-seller user in ShopManagement, redirecting to login');
    // Redirect to login if not a seller
    setshowShopManagement(false);
    return null;
  }

  // Check if we need to show ProductManagement based on showProductManagement state
  if (showProductManagement && selectedShop) {
    return <ProductManagement />;
  }

  // Only render ShopCreationForm if explicitly requested via showShopCreationForm flag
  if (showShopCreationForm) {
    return <ShopCreationForm />;
  }

  // Always show the seller's shops list by default, even if empty
  return <ShopsListBySeller fetchUserShops={false} />;
};

export default ShopManagement;