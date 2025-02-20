import React from 'react';
import { useContext } from 'react';
import axiosInstance from '../../../../utils/app/axiosConfig.js';
import AppContext from '../../../../app_context/AppContext.js';

const ProductManagementFunctions = () => {
  
  const { 
      setProducts, setError,
      selectedShop, setLoading,
  } = useContext(AppContext);

  const filterProducts = (products, filters) => {
    if (!products || !filters) return products;

    return products.filter((product) => {
      // Handle season matching with case-insensitive comparison and multiple variations
      const seasonMatch = filters.temporada === null || 
        ['Todo el Año', 'Todo el año', 'todo el año'].includes(filters.temporada) || 
        product.season_product.toLowerCase() === filters.temporada.toLowerCase() ||
        product.season_product === 'Todo el Año';
      
      const typeMatch = filters.tipo === null || 
        filters.tipo === 'Todos' || 
        product.type_product === filters.tipo;
      
      const onSaleMatch = filters.oferta === null || 
        filters.oferta === 'Todos' || 
        (filters.oferta === 'Sí' && product.discount_product > 0) ||
        (filters.oferta === 'No' && product.discount_product === 0);
      
      const calificationMatch = filters.calificacion === null || 
        // New calification filtering logic
        product.calification_product === parseInt(filters.calificacion) ||
        (filters.calificacion !== null && 
         product.calification_product <= parseInt(filters.calificacion));
  
      console.log('Filtering Debug:', {
        product: product.name_product,
        seasonFilter: filters.temporada,
        productSeason: product.season_product,
        seasonMatch,
        typeMatch,
        onSaleMatch,
        calificationMatch
      });
  
      return seasonMatch && typeMatch && onSaleMatch && calificationMatch;
    });
  };

  async function fetchProductsByShop(){
    try {
      if (!selectedShop || !selectedShop.id_shop) {
        console.warn('No shop selected');
        setProducts([]);
        return;
      }
      const response = await axiosInstance.post('/product/by-shop-id', { 
        id_shop: selectedShop.id_shop 
      });
      const fetchedProducts = response.data.data || [];
      console.log(`Fetched ${fetchedProducts.length} products for shop ${selectedShop.name_shop}`);
      setProducts(fetchedProducts);
    } catch (err) {
      // setError(err.message);
      console.error('Error fetching products:', err);
      setProducts([]);
    } 
  };

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

  return { filterProducts,
    fetchProductsByShop,
    fetchProductTypes
   };
};

export default ProductManagementFunctions;