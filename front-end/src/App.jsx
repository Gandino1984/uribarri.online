import React from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx"; // 📦 UPDATE: Added import for PackageProvider
import styles from '../../public/css/App.module.css';
import '../../public/css/App.css'; // Keep this for global styles
import LoginRegisterForm from "../src/components/login_register/LoginRegisterForm.jsx";
import TopBar from "../src/components/top_bar/TopBar.jsx";
import ConfirmationModal from "../src/components/confirmation_modal/ConfirmationModal.jsx";

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <ShopProvider>
          <ProductProvider>
            <PackageProvider> {/* 📦 UPDATE: Added PackageProvider */}
              <div className={styles.mainContainer}>
                <ConfirmationModal />
                <TopBar />
                <LoginRegisterForm />
              </div>
            </PackageProvider>
          </ProductProvider>
        </ShopProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;