import React, { useContext, useEffect } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopsListBySeller from './shops_list_by_seller/ShopsListBySeller.jsx';
import ShopCreationForm from './shop_creation_form/ShopCreationForm.jsx';
import ProductManagement from './product_management/ProductManagement.jsx';
import { ShopManagementFunctions } from './ShopManagementFunctions.jsx';
import styles from '../../../../public/css/ShopManagement.module.css';

const ShopManagement = () => {
  const { 
    currentUser, 
    showShopCreationForm,
    selectedShop,
    setShowShopCreationForm
  } = useContext(AppContext);

  const {
    fetchUserShops,
  } = ShopManagementFunctions();

  useEffect(() => {
    fetchUserShops();
    setShowShopCreationForm(false); // Reset the form visibility on initial load
  }, [currentUser]);

  const renderComponent = () => {
    console.log('showShopCreationForm:', showShopCreationForm);
    console.log('selectedShop:', selectedShop);
    // Priority 1: Render ShopCreationForm if showShopCreationForm is true
    if (showShopCreationForm) {
      return <ShopCreationForm />;
    }

    // Priority 2: Render ProductManagement if a shop is selected
    if (selectedShop) {  
      return <ProductManagement />;
    }

    // Priority 3: Default to rendering the list of shops
    return <ShopsListBySeller />;
  };

  return (
    <div className={styles.container}>
      {renderComponent()}
    </div>
  );
};

export default ShopManagement;