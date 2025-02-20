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
      if (!currentUser?.id) {
        setShops([]);
        throw new Error('No hay usuarios activos');      
      }

      const response = await axiosInstance.post('/shop/by-user-id', {
        id_user: currentUser.id
      });

      if (response.data.error) {
        setInfo(prevInfo => ({ ...prevInfo, shopInfo: response.data.error }));
        throw new Error(response.data.error);
      }

      const userShops = response.data.data || [];
      
      setShops(userShops);
    } catch (err) {
      console.warn('Fetching shops:', err);
    } 
  };

  const handleBack = () => {
    setshowShopManagement(false);
    setShowProductManagement(false);
    setSelectedShop(null);
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setShowProductManagement(true);
  };

  return {
    fetchUserShops,
    handleSelectShop,
    handleBack
  };
};