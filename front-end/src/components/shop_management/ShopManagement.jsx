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

  // UPDATE: Optimizar para reducir llamadas innecesarias
  useEffect(() => {
    // Solo hacer log de eventos clave, no cada renderizado
    console.log('ShopManagement navigation state changed', {
      showShopCreationForm,
      showProductManagement,
      selectedShopId: selectedShop?.id_shop
    });
  }, [showShopCreationForm, showProductManagement, selectedShop?.id_shop]);
  
  // UPDATE: Solo ejecutar la búsqueda de tiendas si no hay tiendas cargadas
  useEffect(() => {
    if (fetchUserShops && currentUser?.id_user && (!shops || shops.length === 0)) {
      console.log('Initial shop fetch for user:', currentUser.id_user);
      fetchUserShops();
    }
    // Eliminar shops de la dependencia para evitar llamadas repetidas
  }, [currentUser?.id_user, fetchUserShops]);

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
  return <ShopsListBySeller />;
};

export default ShopManagement;