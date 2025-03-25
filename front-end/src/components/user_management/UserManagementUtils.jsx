import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const UserManagementUtils = () => {
  // UPDATE: Using specialized context hooks instead of AppContext
  const { setLoading, setError } = useUI();
  
  const {
    setSelectedShopType,
    setShopType,
    setShopTypes,
    setShops
  } = useShop();

  // Fetch shop types from the server
  const fetchShopTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/shop/types-of-shops');
      console.log('Fetched shop types:', response.data);
      
      if(response.data.error) {
        setError(prevError => ({ ...prevError, shopError: "Error al obtener los tipos de comercios" }));
        throw new Error(response.data.error);
      }
      
      // Aseguramos que recibimos un array y lo ordenamos alfabéticamente para mejor UX
      const types = response.data.data || [];
      types.sort(); // Ordenamos alfabéticamente
      
      setShopTypes(types);
      console.log('Shop types set:', types);
    } catch (error) {
      console.error('-> UserManagementUtils.jsx - fetchShopTypes() - Error = ', error);
      setShopTypes([]);
      setError(prevError => ({ ...prevError, shopError: 'Error al obtener los tipos de comercio' }));
    } finally {
      setLoading(false);
    }
  };

  // Handle business type selection
  const handleBusinessTypeSelect = async (type) => {
    console.log('-> UserManagementUtils.jsx - handleBusinessTypeSelect() - Tipo seleccionado:', type);
    
    // Primero actualizamos el estado para que la UI responda inmediatamente
    setShopType(type);
    setSelectedShopType(type);
    setLoading(true);
    
    try {
      // Luego hacemos la petición para obtener las tiendas de este tipo
      const response = await axiosInstance.post('/shop/by-type', { 
        type_shop: type 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        setError(prevError => ({ ...prevError, shopError: "Error al obtener las tiendas por tipo" }));
        throw new Error(response.data.error);
      }
      
      console.log('-> UserManagementUtils.jsx - handleBusinessTypeSelect() - shops:', response.data.data);
      
      const shopsData = response.data.data;
      if (!Array.isArray(shopsData)) {
        setError(prevError => ({ ...prevError, shopError: "La respuesta del servidor no contiene una lista válida de comercios" }));
        throw new Error('Invalid shops data received');
      }
      
      // Filtrar tiendas válidas
      const validShops = shopsData.filter(shop => 
        shop && 
        typeof shop === 'object' && 
        shop.id_shop && 
        shop.type_shop === type
      );
      
      setShops(validShops);
    } catch (error) {
      console.error('Error fetching shops by type:', error);
      setShops([]);
      setError(prevError => ({ ...prevError, shopError: "Error al obtener las tiendas" }));
    } finally {
      setLoading(false);
    }
  };

  return {
    handleBusinessTypeSelect,
    fetchShopTypes
  };
};