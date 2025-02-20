import { useContext } from 'react';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import AppContext from '../../../app_context/AppContext.js';

export const ShopsByTypeFunctions = () => {
  const {
    shopType, 
    setShops,
    setLoading,
    setError,
    setSelectedShop, 
    setshowShopManagement 
  } = useContext(AppContext);

  const handleShopSelect = (shop) => {
      setSelectedShop(shop);
  };

  const handleBack = () => {
    setSelectedShop(null);
    setshowShopManagement(true);
  };
  
  const fetchShopsByType = async () => {
    if (!shopType) {
      // warning card
      setShops([]);
      return;
    }

    console.log('-> ShopsByTypeFunctions.jsx - fetchShopsByType() - Buscando comercios del tipo = ', shopType);
    
    try {

      setError({
        userError: '',
        passwordError: '',
        passwordRepeatError: '',
        ipError: '',
        userlocationError: '',
        userTypeError: '',
        databaseResponseError: '',
      });

      const response = await axiosInstance.post('/shop/by-type', {
        type_shop: shopType
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.error) {
        setError(prevError => ({ ...prevError, shopError: "Error al obtener la lista de comercios por tipo" }));
        throw new Error(response.data.error);
      }

      const shopsData = response.data.data;
      if (!Array.isArray(shopsData)) {
        setError(prevError => ({ ...prevError, shopError: "La respuesta del servidor no contiene una lista válida de comercios por tipo" }));
        throw new Error('Invalid shops data received');
      }

      const validShops = shopsData.filter(shop => 
        shop && 
        typeof shop === 'object' && 
        shop.id_shop && 
        shop.type_shop === shopType
      );

      setShops(validShops);
      
    } catch (err) {
      console.error('-> ShopsByTypeFunctions.jsx - fetchShopsByType() - Error = ', err);
      setShops([]);
    } 
  };

  return {
    handleShopSelect,
    fetchShopsByType,
    handleBack
  };
};