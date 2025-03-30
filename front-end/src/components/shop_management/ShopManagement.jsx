import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopsListBySeller from './components/shops_list_by_seller/ShopsListBySeller.jsx';
import ShopCreationForm from './components/shop_creation_form/ShopCreationForm.jsx';
import ProductManagement from './components/product_management/ProductManagement.jsx';
import { ShopManagementUtils } from './ShopManagementUtils.jsx';
import styles from '../../../../public/css/ShopManagement.module.css'; // 🚀 UPDATE: Imported styles correctly

const ShopManagement = () => {
  // UPDATE: Using separate contexts instead of AppContext
  const { currentUser } = useAuth();
  
  const { 
    showShopCreationForm, 
    shops,
    selectedShop
  } = useShop();
  
  const { setShowShopManagement } = useUI();
  
  // UPDATE: Get showProductManagement from UI context where it's defined
  const { showProductManagement } = useUI();
  
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
    setShowShopManagement(false);
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
  
  // 🚀 UPDATE: Wrapped component with container div for proper spacing
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {componentToRender}
      </div>
    </div>
  );
};

export default ShopManagement;