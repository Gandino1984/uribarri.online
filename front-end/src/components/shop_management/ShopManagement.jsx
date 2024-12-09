import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../../app_context/AppContext.js';
import axiosInstance from '../../../utils/axiosConfig.js';
import ShopsListByUser from './shops_list_byUser/ShopsListByUser.jsx';
import ShopCreationForm from './shop_creation_form/ShopCreationForm.jsx';

const ShopManagement = ({ onBack }) => {
  const { 
    currentUser, 
    shops, setShops, 
    loading, setLoading, 
    error, setError,
    selectedShop, setSelectedShop,
    showShopCreationForm, setShowShopCreationForm,
    showShopManagement, setshowShopManagement,
    isAddingShop, setIsAddingShop
  } = useContext(AppContext);


  const handleCancel = () => {
    setshowShopManagement(false);
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
  };

  useEffect(() => {
    console.log('showShopManagement changed:', showShopManagement);
    console.log('showShopManagement changed again:', showShopManagement);
  }, [showShopManagement]);

  useEffect(() => {
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
    fetchUserShops();
  }, [currentUser]);

  const handleShopCreated = (newShop) => {
    setIsAddingShop(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (shops.length === 0) {
    // User has no shops, show ShopCreationForm
    return (
      <ShopCreationForm 
        onShopCreated={handleShopCreated}
        onCancel={handleCancel} 
      />
    );
  } else {
    if (showShopCreationForm) {
      return (
        <ShopCreationForm 
          onShopCreated={handleShopCreated}
          onCancel={() => setShowShopCreationForm(false)} 
        />
      );
    } else {
      return (
        <ShopsListByUser
          onBack={onBack}   
          onAddShop={() => setIsAddingShop(true)}
          onSelectShop={handleSelectShop}
        />
      );
    }
  }
};

export default ShopManagement;