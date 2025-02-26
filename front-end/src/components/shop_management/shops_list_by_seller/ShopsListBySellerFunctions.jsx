import { useContext, useEffect, useState } from 'react';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import AppContext from '../../../app_context/AppContext.js';

export const ShopsListBySellerFunctions = () => {
  const {
    setSelectedShop,
    setShops,
    shops,
    setShowShopCreationForm,
    setShowProductManagement,
    setError,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    currentUser
  } = useContext(AppContext);

  // Estado para llevar la cuenta de tiendas y el límite
  const [shopCount, setShopCount] = useState(0);
  const [shopLimit, setShopLimit] = useState(1); // Valor por defecto para usuarios no sponsor

  // Determinar el límite de tiendas basado en la categoría del usuario
  useEffect(() => {
    if (currentUser?.category_user) {
      setShopLimit(2); // Límite para usuarios sponsor
    } else {
      setShopLimit(1); // Límite para usuarios no sponsor
    }
  }, [currentUser]);

  // Establecer el conteo de tiendas cada vez que cambian las tiendas
  useEffect(() => {
    if (Array.isArray(shops)) {
      setShopCount(shops.length);
    }
  }, [shops]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setShowProductManagement(true);
    setShowShopCreationForm(false);
  };

  const handleAddShop = () => {
    // Verificar si el usuario ha alcanzado el límite
    if (shopCount >= shopLimit) {
      setError(prevError => ({ 
        ...prevError, 
        shopError: `Has alcanzado el límite de ${shopLimit} comercios. ${!currentUser?.category_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
      }));
      return;
    }
    
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  };

  const handleUpdateShop = (shop) => {
    setSelectedShop(shop); // Set the selected shop to be updated
    setShowShopCreationForm(true); // Show the ShopCreationForm for updating
  };

  // Keep track of the shop to be deleted
  const [shopToDelete, setShopToDelete] = useState(null);

  const handleDeleteShop = (id_shop) => {
    setShopToDelete(id_shop);
    setModalMessage("Esta acción eliminará permanentemente el comercio y todos los productos asociados a él. ¿Deseas continuar?");
    setIsModalOpen(true);
  };

  // Watch for modal confirmation
  useEffect(() => {
    const deleteShop = async () => {
      if (isAccepted && shopToDelete) {
        try {
          const response = await axiosInstance.delete(`/shop/remove-by-id/with-products/${shopToDelete}`);
          
          if (response.data.error) {
            setError(prevError => ({ ...prevError, shopError: "Error al borrar el comercio" }));
            throw new Error(response.data.error);
          }
      
          setShops(existingShops => existingShops.filter(shop => shop.id_shop !== shopToDelete));
          setShopToDelete(null); // Clear the shop to delete
          setIsAccepted(false); // Reset the accepted state
        } catch (err) {
          console.error('Error deleting shop:', err);
        }
      }
    };

    deleteShop();
  }, [isAccepted, shopToDelete]);


  return {
    handleSelectShop,
    handleDeleteShop,
    handleAddShop,
    handleUpdateShop,
    shopCount,
    shopLimit
  };
};