import React, { useContext, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import ProductManagementFunctions from './ProductManagementFunctions.jsx';
import ProductCreationForm from './product_creation_form/ProductCreationForm.jsx';
import ShopProductList from './shop_products_list/ShopProductsList.jsx';
import styles from '../../../../../public/css/ProductManagement.module.css';

function ProductManagement() {
  const { 
    selectedShop, 
    showProductManagement,
    setIsUpdatingProduct,
    setSelectedProductToUpdate,
    setNewProductData
  } = useContext(AppContext);
  
  const { fetchProductsByShop } = ProductManagementFunctions();

  useEffect(() => {
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
        stock_product: 0,
        info_product: '',
        id_shop: selectedShop.id_shop
      });
    }
  }, [selectedShop]);

  return (
    <div className={styles.container}>
      {showProductManagement ? (
        <ShopProductList />
      ) : (
        <ProductCreationForm />
      )}
    </div>
  );
}

export default ProductManagement;