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
    setShowShopCreationForm(false);
  }, [currentUser]);


  const renderComponent = () => {
    if (selectedShop) {  
      return <ProductManagement />;
    }
    if (showShopCreationForm) {
      return <ShopCreationForm />;
    }
    return <ShopsListBySeller />;
  };

  return (
    <div className={styles.container}>
      {renderComponent()}
    </div>
  );
};

export default ShopManagement;