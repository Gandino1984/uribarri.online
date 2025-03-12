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
    shops,
    setshowShopManagement,
    showProductManagement,
    selectedShop,
  } = useContext(AppContext);
  

  const hasInitiallyFetchedShops = useRef(false);
  
  const shopManagementFunctions = ShopManagementFunctions ? ShopManagementFunctions() : {};

  
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