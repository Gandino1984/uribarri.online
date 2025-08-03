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
//update: Import ShopManagement instead of individual components
import ShopManagement from "../src/components/shop_management/ShopManagement.jsx";

const AppContent = () => {
  const { 
    showTopBar, 
    showLandingPage,
    showShopWindow,
    showShopStore,
    selectedShopForStore,
    showShopsListBySeller
  } = useUI();
  const { currentUser } = useAuth();
  
  //update: Simplified renderMainContent
  const renderMainContent = () => {
    // Priority order for displaying components
    if (showShopStore && selectedShopForStore) {
      return <ShopStore />;
    }
    
    //update: Show ShopManagement when ShopsListBySeller is true
    // ShopManagement will handle rendering ShopsListBySeller, ProductManagement, etc.
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