import React, { useContext, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import ShopProductsList from './shop_products_list/ShopProductsList.jsx';
import ProductCreationForm from './product_creation_form/ProductCreationForm.jsx';

const ProductManagement = () => {
  const { 
    showProductManagement,
    isUpdatingProduct,
    selectedShop
  } = useContext(AppContext);

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log("ProductManagement rendering with states:", {
      showProductManagement,
      isUpdatingProduct,
      hasSelectedShop: !!selectedShop
    });
  }, [showProductManagement, isUpdatingProduct, selectedShop]);

  // CLEAR CONDITIONAL LOGIC: If showProductManagement is true, show the list,
  // otherwise show the creation/update form
  if (showProductManagement) {
    return <ShopProductsList />;
  } else {
    // When showProductManagement is false, show the product creation/update form
    return <ProductCreationForm />;
  }
};

export default ProductManagement;