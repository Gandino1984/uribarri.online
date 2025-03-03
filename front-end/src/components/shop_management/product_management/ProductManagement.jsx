import React, { useContext, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import ProductManagementFunctions from './ProductManagementFunctions.jsx';
import ProductCreationForm from './product_creation_form/ProductCreationForm.jsx';
import ShopProductsList from './shop_products_list/ShopProductsList.jsx';
import styles from '../../../../../public/css/ProductManagement.module.css';


function ProductManagement() {
  const { 
    selectedShop, 
    isUpdatingProduct,
    setIsUpdatingProduct,
    setSelectedProductToUpdate,
    setNewProductData
  } = useContext(AppContext);
  
  const { fetchProductsByShop } = ProductManagementFunctions();

  useEffect(() => {
    console.log('ProductManagement rendered with selected shop:', selectedShop?.id_shop);
    
    // Reset product management state when changing shops
    if (selectedShop) {
      setIsUpdatingProduct(false);
      setSelectedProductToUpdate(null);
      setNewProductData({
        name_product: '',
        price_product: '',
        discount_product: 0,
        season_product: '',
        calification_product: 0,
        type_product: '',
        subtype_product: '',
        sold_product: 0,
        info_product: '',
        id_shop: selectedShop.id_shop,
        second_hand: false,
        surplus_product: 0,
        expiration_product: null
      });
      
      // Fetch products for this shop
      fetchProductsByShop();
    }
  }, [selectedShop]);

  // Safety check
  if (!selectedShop) {
    console.log('No shop selected in ProductManagement');
    return null;
  }

  // Render either the product creation/update form or the products list
  return (
    <div className={styles.container}>  
      {isUpdatingProduct ? (
        <ProductCreationForm />
      ) : (
        <ShopProductsList />
      )}
    </div>
  );
}

export default ProductManagement;