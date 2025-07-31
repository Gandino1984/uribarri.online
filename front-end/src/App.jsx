// import React from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx";
//update: Import OrderProvider
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
//update: Import new components
import ShopWindow from "../src/components/shop_window/ShopWindow.jsx";
import ShopStore from "../src/components/shop_store/ShopStore.jsx";

const AppContent = () => {
  const { 
    showTopBar, 
    showLandingPage,
    //update: Add new UI states
    showShopWindow,
    showShopStore,
    selectedShopForStore
  } = useUI();
  const { currentUser } = useAuth();
  
  //update: Add function to determine which main component to render
  const renderMainContent = () => {
    // Priority order for displaying components
    if (showShopStore && selectedShopForStore) {
      return <ShopStore />;
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
      {/* update: Replace the conditional rendering with the new function */}
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