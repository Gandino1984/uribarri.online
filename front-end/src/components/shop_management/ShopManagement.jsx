import React, { useContext, useEffect } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopsListBySeller from './shops_list_by_seller/ShopsListBySeller.jsx';
import ShopsByType from '../user_management/shops_by_type/ShopsByType.jsx';
import ShopCreationForm from './shop_creation_form/ShopCreationForm.jsx';

const ShopManagement = () => {
  const { 
    type_user, 
    isAddingShop, 
    showShopCreationForm 
  } = useContext(AppContext);

  if (type_user === 'seller') {
    if (isAddingShop || showShopCreationForm) {
      return <ShopCreationForm />;
    }
    return <ShopsListBySeller />;
  } else {
    return <ShopsByType />;
  }
};

export default ShopManagement;