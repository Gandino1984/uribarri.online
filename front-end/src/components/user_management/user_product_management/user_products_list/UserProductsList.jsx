import React, { useEffect, useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
// import styles from '../../../../../../public/css/';
import UserProductManagementFunctions from './UserProductManagementFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';

const UserProductsList = () => {
  const {
    products,
    error,
    selectedShop,
    filters,
    setFilters,
    filteredProducts,
    setFilteredProducts,
    filterOptions,
    setFilterOptions
  } = useContext(AppContext);

  const { filterProducts, fetchProductsByShop, fetchProductTypes } = UserProductManagementFunctions();

  const [filteredProductsCount, setFilteredProductsCount] = useState(0);

  useEffect(() => {
    // Reset filters when a new shop is selected
    setFilters({
      temporada: null,
      tipo: null,
      oferta: null,
      calificacion: null,
    });

    // Ensure shop is selected before fetching products
    if (selectedShop && selectedShop.id_shop) {
      console.log("Fetching products for shop:", selectedShop.name_shop);
      fetchProductsByShop();
    } else {
      console.warn("No shop selected or invalid shop ID");
      setFilteredProducts([]); 
    }
  }, [selectedShop]);

  useEffect(() => {
    // Filter products whenever products or filters change
    if (Array.isArray(products) && products.length > 0) {
      const filtered = filterProducts(products, filters);
      console.log("Filtered Products:", filtered);
      setFilteredProducts(filtered); 
      setFilteredProductsCount(filtered.length);
    } else {
      console.log("No products to filter");
      setFilteredProducts([]); 
      setFilteredProductsCount(0);
    }
  }, [products, filters]);

  useEffect(() => {
    const fetchTypes = async () => {
      const productTypes = await fetchProductTypes();
      console.log('Product Types:', productTypes);
      setFilterOptions((prevFilterOptions) => ({
        ...prevFilterOptions,
        tipo: {
          label: 'Tipo de producto',
          options: productTypes
        }
      }));
    };
    fetchTypes();
  }, [setFilterOptions]);

  return (
    <div className={styles.container}>
        {selectedShop && (
          <div className={styles.shop}>
              <h2 className="text-2xl font-bold text-center flex-1 pr-10">
                  {selectedShop.name_shop}
              </h2>
              <p>
                  Ubicación: {selectedShop.location_shop}</p>
              <p>
                  Calificación: {selectedShop.calification_shop || 'No disponible'}/5
              </p>
          </div>
        )}

        <div className={styles.productsListHeader}>
            <h2 className="text-2xl font-bold text-center flex-1 pr-10">
                Productos del comercio
            </h2>
            <p>
                Productos mostrados: {filteredProductsCount}
            </p>
        </div>
        <div className={styles.filters}>
            <FiltersForProducts />
        </div>
        {filteredProducts.length === 0 ? (
        <p className="text-center">
            No hay productos disponibles
        </p>
        ) : (
        <div className={styles.list}>
            {filteredProducts.map((product) => (
              <div key={product.id_product} className={styles.product}>
                <h3 className={styles.productName}>
                  {product.name_product}
                </h3>
                <p className={styles.productDescription}>
                  {product.info_product}
                </p>
                <p className={styles.productPrice}>
                  Precio: {product.price_product}
                </p>
              </div>
            ))}
        </div>
        )}
    </div>
  );
};

export default UserProductsList;