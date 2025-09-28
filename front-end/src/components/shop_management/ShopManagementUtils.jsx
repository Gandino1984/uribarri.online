import { useRef, useCallback } from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const ShopManagementUtils = () => {
  const { currentUser } = useAuth();
  const { setInfo, setShowShopManagement } = useUI();
  const { setShops, setSelectedShop } = useShop();
  const { setShowProductManagement } = useProduct();
  
  const fetchInProgress = useRef(false);

  const fetchUserShops = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log('Shop fetch already in progress, skipping redundant call');
      return;
    }
    
    try {
      if (!currentUser?.id_user) {
        console.error('No hay usuarios activos');
        setShops([]);
        return;      
      }

      fetchInProgress.current = true;
      console.log('ShopManagementUtils - Fetching shops for user ID:', currentUser.id_user);

      //update: Only use the correct endpoint and properly handle empty results
      const response = await axiosInstance.post('/shop/by-user-id', {
        id_user: currentUser.id_user
      });
      
      console.log('Shop API response (by-user-id):', response.data);

      //update: Handle both error with empty data and successful empty data
      if (response.data) {
        // Check if there's an error message but also data (empty array case)
        if (response.data.error && response.data.data !== undefined) {
          // This is the case where no shops exist for the user
          console.log('No shops found for user (expected for new users)');
          setShops(response.data.data || []);
        } else if (!response.data.error && response.data.data) {
          // Successful response with shops
          const userShops = response.data.data;
          console.log('Fetched shops:', userShops);
          setShops(Array.isArray(userShops) ? userShops : []);
        } else {
          // Any other error case
          console.warn('Unexpected response format:', response.data);
          setShops([]);
        }
      } else {
        console.warn('No response data received');
        setShops([]);
      }
      
    } catch (err) {
      console.error('Error fetching shops:', err);
      //update: Always set empty array on error, never fall back to fetching all shops
      setShops([]);
    } finally {
      fetchInProgress.current = false;
    }
  }, [currentUser, setShops]);

  const handleBack = useCallback(() => {
    setShowShopManagement(false);
    setShowProductManagement(false);
    setSelectedShop(null);
  }, [setShowShopManagement, setShowProductManagement, setSelectedShop]);

  const handleSelectShop = useCallback((shop) => {
    console.log('Selecting shop:', shop);
    setSelectedShop(shop);
    setShowProductManagement(true);
  }, [setSelectedShop, setShowProductManagement]);

  return {
    fetchUserShops,
    handleSelectShop,
    handleBack
  };
};