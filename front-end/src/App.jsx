// import React from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx";
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
//update: Import ShopWindow component
import ShopWindow from "../src/components/shop_window/ShopWindow.jsx";

const AppContent = () => {
  //update: Add showShopWindow from UIContext
  const { showTopBar, showLandingPage, showShopWindow } = useUI();
  const { currentUser } = useAuth();
  
  return (
    <div className={styles.mainContainer}>
      <ConfirmationModal />
      <ImageModal />
      {showTopBar && <TopBar />} 
      {currentUser && <UserInfoCard />}
      <CardDisplay />
      {/*update: Add conditional rendering for ShopWindow*/}
      {showLandingPage ? (
        <LandingPage />
      ) : showShopWindow ? (
        <ShopWindow />
      ) : (
        <LoginRegisterForm />
      )}
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
              <AppContent />
            </PackageProvider>
          </ProductProvider>
        </ShopProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;