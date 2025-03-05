import React, { useContext, useEffect, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import ProductCreationForm from './product_creation_form/ProductCreationForm.jsx';
import ShopProductsList from './shop_products_list/ShopProductsList.jsx';
import ProductManagementFunctions from './ProductManagementFunctions.jsx';

const ProductManagement = () => {
  const { 
    currentUser,
    selectedShop,
    isUpdatingProduct,
    selectedProductToUpdate,
    showProductManagement,
    setShowProductManagement,
    setIsUpdatingProduct,
    setSelectedShop,
    setSelectedProductToUpdate
  } = useContext(AppContext);

  const { fetchProductsByShop } = ProductManagementFunctions();
  const initialFetchDone = useRef(false);

  // Fetch products once when the component mounts or when selectedShop changes
  useEffect(() => {
    if (selectedShop?.id_shop && !initialFetchDone.current) {
      console.log('ProductManagement - Fetching products for shop:', selectedShop.id_shop);
      fetchProductsByShop();
      initialFetchDone.current = true;
    }
  }, [selectedShop?.id_shop, fetchProductsByShop]);

  // Reset initialFetchDone when shop changes
  useEffect(() => {
    if (selectedShop?.id_shop) {
      initialFetchDone.current = false;
    }
  }, [selectedShop?.id_shop]);

  // Log the current state for debugging
  console.log('ProductManagement rendering with state:', {
    isUpdatingProduct,
    selectedProductToUpdate: selectedProductToUpdate?.id_product || null
  });

  // If no shop is selected, we can't manage products
  if (!selectedShop) {
    console.log('ProductManagement - No shop selected, cannot manage products');
    return null;
  }

  // Simple conditional rendering based on isUpdatingProduct flag
  // This flag now indicates both creation and update modes
  if (isUpdatingProduct === true) {
    console.log('ProductManagement - Showing ProductCreationForm');
    return <ProductCreationForm />;
  }

  console.log('ProductManagement - Showing ShopProductsList');
  return <ShopProductsList />;
};

export default ProductManagement;