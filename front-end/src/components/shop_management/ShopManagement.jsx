import React, { useContext, useEffect } from 'react';
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
  
  // Use ShopManagementFunctions to get fetchUserShops
  const { fetchUserShops } = ShopManagementFunctions ? ShopManagementFunctions() : { fetchUserShops: null };

  useEffect(() => {
    console.log('ShopManagement rendered with:', {
      currentUser,
      showShopCreationForm,
      isAddingShop,
      showProductManagement,
      selectedShop: selectedShop?.id_shop,
      shopCount: shops?.length
    });
    
    // Fetch shops when the component mounts if fetchUserShops is available
    if (fetchUserShops && currentUser?.id_user) {
      console.log('Fetching shops for user:', currentUser.id_user);
      fetchUserShops();
    }
  }, [currentUser, showShopCreationForm, isAddingShop, shops, showProductManagement, selectedShop, fetchUserShops]);

  // Check if the user is a seller
  if (!currentUser || currentUser.type_user !== 'seller') {
    console.log('Non-seller user in ShopManagement, redirecting to login');
    // Redirect to login if not a seller
    setshowShopManagement(false);
    return null;
  }

  // Check if we need to show ProductManagement based on showProductManagement state
  if (showProductManagement && selectedShop) {
    console.log('Rendering ProductManagement for shop:', selectedShop.id_shop);
    return <ProductManagement />;
  }

  // Only render ShopCreationForm if explicitly requested via showShopCreationForm flag
  if (showShopCreationForm) {
    console.log('Rendering ShopCreationForm');
    return <ShopCreationForm />;
  }

  // Always show the seller's shops list by default, even if empty
  console.log('Rendering ShopsListBySeller');
  return <ShopsListBySeller />;
};

export default ShopManagement;