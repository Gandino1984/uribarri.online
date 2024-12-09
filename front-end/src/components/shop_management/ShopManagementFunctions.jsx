import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import axiosInstance from '../../../utils/axiosConfig.js';

export const ShopManagementFunctions = () => {
  console.log('ShopManagement component is being rendered');
  const {
      setShops,
      setLoading,
      setError,
      setIsAddingShop,
      setSelectedShop,
      setshowShopManagement
    } = useContext(AppContext);

  const fetchUserShops = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const response = await axiosInstance.post('/shop/by-user-id', {
          id_user: currentUser.id
        });
        const userShops = response.data.data?.filter(shop => 
          shop.id_user === currentUser.id
        ) || [];

        setShops(userShops);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching shops');
        setLoading(false);
      }
    };

  const handleCancel = () => {
  setshowShopManagement(false);
  };
  const handleSelectShop = (shop) => {
      setSelectedShop(shop);
  };
  const handleRegistration = async (newShop) => {
    try {
      const response = await axiosInstance.post('/seller/create', {
        userData: {
          name_user: currentUser.username,
          pass_user: currentUser.password,
          location_user: currentUser.location,
          type_user: 'seller'
        },
        shopData: newShop
      });
      // Handle the registration response
      console.log(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating seller');
    }
  };
  const handleShopCreated = async (newShop) => {
    setIsAddingShop(false);
    await handleRegistration(newShop);
  };
  return {
      fetchUserShops,
      handleShopCreated,
      handleSelectShop,
      handleCancel
    };
}