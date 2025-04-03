import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../src/app_context/ProductContext.jsx';
import { usePackage } from '../../../../../src/app_context/PackageContext.jsx'; // ✨ UPDATE: Import Package context
import ProductCreationForm from './components/product_creation_form/ProductCreationForm.jsx';
import ShopProductsList from './components/shop_products_list/ShopProductsList.jsx';
import PackageCreationForm from './components/shop_products_list/components/package_creation_form/PackageCreationForm.jsx'; // ✨ UPDATE: Import PackageCreationForm
import ProductManagementUtils from './ProductManagementUtils.jsx';

const ProductManagement = () => {
  const { currentUser } = useAuth();
  const { selectedShop, setSelectedShop } = useShop();
  const { 
    isUpdatingProduct,
    selectedProductToUpdate,
    showProductManagement,
    setShowProductManagement,
    setIsUpdatingProduct,
    setSelectedProductToUpdate
  } = useProduct();
  
  // ✨ UPDATE: Added Package context
  const {
    isAddingPackage,
    showPackageCreationForm
  } = usePackage();

  const { fetchProductsByShop } = ProductManagementUtils();
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
    selectedProductToUpdate: selectedProductToUpdate?.id_product || null,
    isAddingPackage, // ✨ UPDATE: Log package state
    showPackageCreationForm // ✨ UPDATE: Log package form visibility
  });

  // If no shop is selected, we can't manage products
  if (!selectedShop) {
    console.log('ProductManagement - No shop selected, cannot manage products');
    return null;
  }

  // ✨ UPDATE: Enhanced conditional rendering to include package creation
  if (isUpdatingProduct === true) {
    console.log('ProductManagement - Showing ProductCreationForm');
    return <ProductCreationForm />;
  } else if (showPackageCreationForm === true) {
    console.log('ProductManagement - Showing PackageCreationForm');
    return <PackageCreationForm />;
  }

  console.log('ProductManagement - Showing ShopProductsList');
  return <ShopProductsList />;
};

export default ProductManagement;