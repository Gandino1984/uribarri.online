import React from 'react';
import { useContext } from 'react';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import AppContext from '../../../app_context/AppContext.js';

const ProductManagementFunctions = () => {
  
  const { 
      setProducts, setError,
      selectedShop 
  } = useContext(AppContext);

  async function fetchProductsByShop() {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No shop selected');
        setProducts([]);
        return;
      }

      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);
      const fetchedProducts = response.data.data || [];
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => ({ 
        ...prevError, 
        databaseResponseError: "Error al obtener los productos del comercio" 
      }));
      setProducts([]);
    } 
  }  

  async function fetchProductTypes() {
    try {
      const response = await axiosInstance.get('/product/by-type');
      console.log('Response:', response);
      console.log('Response Data:', response.data);
      return response.data.data; // Return the data property of the response data
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  return {
    fetchProductsByShop, 
    fetchProductTypes
   };
};

export default ProductManagementFunctions;