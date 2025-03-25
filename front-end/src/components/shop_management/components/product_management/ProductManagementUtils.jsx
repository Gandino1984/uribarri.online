import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import axiosInstance from '../../../../utils/app/axiosConfig.js';

const ProductManagementUtils = () => {
  const { selectedShop } = useShop();
  const { setProducts } = useProduct();
  const { setError } = useUI();

  async function fetchProductsByShop() {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No shop selected');
        setProducts([]);
        return [];
      }

      console.log('Fetching products for shop:', selectedShop.id_shop);
      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);
      
      console.log('Products API response:', response.data);
      const fetchedProducts = response.data.data || [];
      
      console.log('Fetched products:', fetchedProducts.length);
      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => ({ 
        ...prevError, 
        databaseResponseError: "Error al obtener los productos del comercio" 
      }));
      setProducts([]);
      return [];
    } 
  }  

  async function fetchProductTypes() {
    try {
      const response = await axiosInstance.get('/product/by-type');
      console.log('Product types response:', response.data);
      return response.data.data; // Return the data property of the response data
    } catch (error) {
      console.error('Error fetching product types:', error);
      return [];
    }
  }

  return {
    fetchProductsByShop, 
    fetchProductTypes
  };
};

export default ProductManagementUtils;