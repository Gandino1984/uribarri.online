// import React from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx";
import { OrderProvider } from "./app_context/OrderContext.jsx";
import styles from '../../public/css/App.module.css';
import '../../public/css/App.css'; // Keep this for global styles
import LoginRegisterForm from "../src/components/login_register/LoginRegisterForm.jsx";
import TopBar from "../src/components/top_bar/TopBar.jsx";
import CardDisplay from "../src/components/card_display/CardDisplay.jsx";
import ConfirmationModal from "../src/components/confirmation_modal/ConfirmationModal.jsx";
import { useUI } from "./app_context/UIContext.jsx";
import LandingPage from "../src/components/landing_page/LandingPage.jsx";
import UserInfoCard from "../src/components/user_info_card/UserInfoCard.jsx";
import { useAuth } from "./app_context/AuthContext.jsx";
import ImageModal from "../src/components/image_modal/ImageModal.jsx";
import ShopWindow from "../src/components/shop_window/ShopWindow.jsx";
import ShopStore from "../src/components/shop_store/ShopStore.jsx";
import ShopManagement from "../src/components/shop_management/ShopManagement.jsx";
//update: Import RiderOrdersManagement
import RiderOrdersManagement from "../src/components/rider_order_management/RiderOrderManagement.jsx";
//update: Import useEffect from React
import { useEffect } from 'react';

const AppContent = () => {
  const { 
    showTopBar, 
    showLandingPage,
    showShopWindow,
    showShopStore,
    selectedShopForStore,
    showShopsListBySeller,
    //update: Add showRiderManagement from UI context
    showRiderManagement, 
    setShowRiderManagement,
    setShowShopsListBySeller,
    setShowLandingPage,
    setShowTopBar
  } = useUI();
  const { currentUser } = useAuth();
  
  //update: Add useEffect to handle rider user type
  useEffect(() => {
    if (currentUser?.type_user === 'rider') {
      console.log('User is rider, showing rider management UI');
      setShowRiderManagement(true);
      setShowShopsListBySeller(false);
      setShowLandingPage(false);
      setShowTopBar(true);
    } else if (currentUser?.type_user === 'seller') {
      console.log('User is seller, showing shop management UI');
      setShowRiderManagement(false);
      setShowShopsListBySeller(true);
      setShowLandingPage(false);
      setShowTopBar(true);
    } else {
      setShowRiderManagement(false);
    }
  }, [currentUser?.type_user, setShowRiderManagement, setShowShopsListBySeller, setShowLandingPage, setShowTopBar]);
  
  const renderMainContent = () => {
    // Priority order for displaying components
    if (showShopStore && selectedShopForStore) {
      return <ShopStore />;
    }
    
    //update: Show RiderOrdersManagement for rider users
    if (showRiderManagement && currentUser?.type_user === 'rider') {
      return <RiderOrdersManagement />;
    }
    
    // Show ShopManagement when ShopsListBySeller is true
    if (showShopsListBySeller) {
      return <ShopManagement />;
    }
    
    if (showShopWindow) {
      return <ShopWindow />;
    }
    
    if (showLandingPage) {
      return <LandingPage />;
    }
    
    return <LoginRegisterForm />;
  };
  
  return (
    <div className={styles.mainContainer}>
      <ConfirmationModal />
      <ImageModal />
      {showTopBar && <TopBar />} 
      {currentUser && <UserInfoCard />}
      <CardDisplay />
      {renderMainContent()}
    </div>
  );
};

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <ShopProvider>
          <ProductProvider>
            <PackageProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </PackageProvider>
          </ProductProvider>
        </ShopProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;