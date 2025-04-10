import React from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx";
import styles from '../../public/css/App.module.css';
import '../../public/css/App.css'; // Keep this for global styles
import LoginRegisterForm from "../src/components/login_register/LoginRegisterForm.jsx";
import TopBar from "../src/components/top_bar/TopBar.jsx";
import ConfirmationModal from "../src/components/confirmation_modal/ConfirmationModal.jsx";
import { useUI } from "./app_context/UIContext.jsx"; // 🌟 UPDATE: Added useUI import

// 🌟 UPDATE: Created AppContent component to use hooks within the component tree
const AppContent = () => {
  const { showTopBar } = useUI(); // Get TopBar visibility state from context
  
  return (
    <div className={styles.mainContainer}>
      <ConfirmationModal />
      {showTopBar && <TopBar />} {/* 🌟 UPDATE: Show TopBar conditionally */}
      <LoginRegisterForm />
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
              <AppContent /> {/* 🌟 UPDATE: Using AppContent component */}
            </PackageProvider>
          </ProductProvider>
        </ShopProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;