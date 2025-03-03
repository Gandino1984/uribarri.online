import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const ShopManagementFunctions = () => {
  const {
    currentUser,
    setShops,
    setInfo,
    setSelectedShop,
    setshowShopManagement, 
    setShowProductManagement
  } = useContext(AppContext);

  const fetchUserShops = async () => {
    try {
      if (!currentUser?.id_user) {
        console.error('No hay usuarios activos');
        setShops([]);
        return;      
      }

      console.log('ShopManagementFunctions - Fetching shops for user ID:', currentUser.id_user);

      // Try both endpoints for better compatibility
      
      // First try with /shop/by-user-id endpoint (matches your Postman response)
      try {
        const response = await axiosInstance.post('/shop/by-user-id', {
          id_user: currentUser.id_user
        });
        
        console.log('Shop API response (by-user-id):', response.data);

        if (!response.data.error) {
          const userShops = response.data.data || [];
          
          console.log('Fetched shops (by-user-id):', userShops);
          
          if (Array.isArray(userShops) && userShops.length > 0) {
            setShops(userShops);
            return;
          }
        }
      } catch (err) {
        console.warn('Error with by-user-id endpoint:', err);
      }
      
      // If the first attempt fails, try with /shop/user endpoint
      try {
        const altResponse = await axiosInstance.post('/shop/user', {
          id_user: currentUser.id_user
        });
        
        console.log('Shop API response (shop/user):', altResponse.data);

        if (!altResponse.data.error) {
          const altShops = altResponse.data.data || [];
          
          console.log('Fetched shops (shop/user):', altShops);
          
          if (Array.isArray(altShops)) {
            setShops(altShops);
          }
        }
      } catch (err) {
        console.warn('Error with shop/user endpoint:', err);
      }
      
    } catch (err) {
      console.warn('Fetching shops error:', err);
      setShops([]);
    } 
  };

  const handleBack = () => {
    setshowShopManagement(false);
    setShowProductManagement(false);
    setSelectedShop(null);
  };

  const handleSelectShop = (shop) => {
    console.log('Selecting shop:', shop);
    setSelectedShop(shop);
    setShowProductManagement(true);
  };

  return {
    fetchUserShops,
    handleSelectShop,
    handleBack
  };
};