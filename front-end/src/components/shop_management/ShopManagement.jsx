import { useEffect, useRef } from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopsListBySeller from './components/shops_list_by_seller/ShopsListBySeller.jsx';
import ShopCreationForm from './components/shop_creation_form/ShopCreationForm.jsx';
import ProductManagement from './components/product_management/ProductManagement.jsx';
import { ShopManagementUtils } from './ShopManagementUtils.jsx';
import styles from '../../../css/ShopManagement.module.css';

const ShopManagement = () => {
  const { currentUser, logout } = useAuth();
  
  const { 
    showShopCreationForm, 
    selectedShop
  } = useShop();
  
  const { 
    setShowShopManagement,
    showProductManagement,
    //update: Added setError to show verification error
    setError
  } = useUI();
  
  const hasInitiallyFetchedShops = useRef(false);
  
  const shopManagementUtils = ShopManagementUtils ? ShopManagementUtils() : {};
  
  //update: Check email verification status
  useEffect(() => {
    if (!currentUser) {
      console.log('No user in ShopManagement, redirecting');
      setShowShopManagement(false);
      return;
    }
    
    if (currentUser.type_user !== 'seller') {
      console.log('Non-seller user in ShopManagement, redirecting');
      setShowShopManagement(false);
      return;
    }
    
    //update: Check if email is verified
    if (currentUser && !currentUser.email_verified) {
      console.error('User email not verified - forcing logout');
      setError(prevError => ({ 
        ...prevError, 
        authError: "Tu cuenta no está verificada. Por favor verifica tu correo electrónico antes de acceder." 
      }));
      logout();
      setShowShopManagement(false);
      return;
    }
  }, [currentUser, setShowShopManagement, setError, logout]);
  
  useEffect(() => {
    if (
      !hasInitiallyFetchedShops.current && 
      shopManagementUtils.fetchUserShops && 
      currentUser?.id_user &&
      currentUser?.email_verified // Only fetch if verified
    ) {
      console.log('Initial fetch of shops (once only) for user:', currentUser.id_user);
      shopManagementUtils.fetchUserShops();
      hasInitiallyFetchedShops.current = true;
    }
  }, [currentUser?.id_user, currentUser?.email_verified, shopManagementUtils]);

  //update: Check verification before rendering
  if (!currentUser || currentUser.type_user !== 'seller' || !currentUser.email_verified) {
    return null;
  }
  
  let componentToRender;
  
  if (showProductManagement && selectedShop) {
    // Si estamos en gestión de productos y hay una tienda seleccionada, mostrar ProductManagement
    componentToRender = <ProductManagement />;
  } else if (showShopCreationForm) {
    // Si estamos en creación/edición de tienda, mostrar el formulario
    componentToRender = <ShopCreationForm />;
  } else {
    // Por defecto, mostrar la lista de tiendas
    componentToRender = <ShopsListBySeller />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {componentToRender}
      </div>
    </div>
  );
};

export default ShopManagement;