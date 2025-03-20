import React, { useContext, useEffect, useRef } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopsListBySeller from './components/shops_list_by_seller/ShopsListBySeller.jsx';
import ShopCreationForm from './components/shop_creation_form/ShopCreationForm.jsx';
import ProductManagement from './components/product_management/ProductManagement.jsx';
import { ShopManagementUtils } from './ShopManagementUtils.jsx';

const ShopManagement = () => {
  const { 
    currentUser, 
    showShopCreationForm, 
    shops,
    setshowShopManagement,
    showProductManagement,
    selectedShop,
  } = useContext(AppContext);
  

  const hasInitiallyFetchedShops = useRef(false);
  
  const shopManagementUtils = ShopManagementUtils ? ShopManagementUtils() : {};

  
  useEffect(() => {
    if (
      !hasInitiallyFetchedShops.current && 
      shopManagementUtils.fetchUserShops && 
      currentUser?.id_user
    ) {
      console.log('Initial fetch of shops (once only) for user:', currentUser.id_user);
      shopManagementUtils.fetchUserShops();
      hasInitiallyFetchedShops.current = true;
    }
  }, [currentUser?.id_user, shopManagementUtils]);

  
  if (!currentUser || currentUser.type_user !== 'seller') {
    console.log('Non-seller user in ShopManagement, redirecting to login');
    setshowShopManagement(false);
    return null;
  }
  let componentToRender;
  
  if (showProductManagement && selectedShop) {
    // Si estamos en gestión de productos y hay una tienda seleccionada, mostrar ProductManagement
    componentToRender = <ProductManagement />;
  } else if (showShopCreationForm) {
    // Si estamos en creación/edición de tienda, mostrar el formulario
    componentToRender = <ShopCreationForm />;
  } else {
    // Por defecto, mostrar la lista de tiendas
    componentToRender = <ShopsListBySeller />;
  }
  
  return componentToRender;
};

export default ShopManagement;