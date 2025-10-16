//update: Added React Router setup to handle /verify-email route
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app_context/AuthContext.jsx';
import { UIProvider } from './app_context/UIContext.jsx';
import { ShopProvider } from './app_context/ShopContext.jsx';
import { ProductProvider } from './app_context/ProductContext.jsx';
import { PackageProvider } from './app_context/PackageContext.jsx';
import { OrderProvider } from './app_context/OrderContext.jsx';
import { OrganizationProvider } from './app_context/OrganizationContext.jsx';
import { PublicationProvider } from './app_context/PublicationContext.jsx';

import LandingPage from './components/landing_page/LandingPage.jsx';
import LoginRegisterForm from './components/login_register/LoginRegisterForm.jsx';
import ShopManagement from './components/shop_management/ShopManagement.jsx';
import ShopStore from './components/shop_store/ShopStore.jsx';
import ShopWindow from './components/shop_window/ShopWindow.jsx';
import InfoManagement from './components/info_management/InfoManagement.jsx';
import TopBar from './components/top_bar/TopBar.jsx';
//update: Import EmailVerification component
import EmailVerification from './components/email_verification/EmailVerification.jsx';

import '../css/App.css';

//update: Create a main component that handles the state-based navigation
const MainApp = () => {
  return (
    <>
      <TopBar />
      <LandingPage />
      <LoginRegisterForm />
      <ShopManagement />
      <ShopStore />
      <ShopWindow />
      <InfoManagement />
    </>
  );
};

const App = () => {
  useEffect(() => {
    console.log('App component mounted with React Router');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <ShopProvider>
            <ProductProvider>
              <PackageProvider>
                <OrderProvider>
                  <OrganizationProvider>
                    <PublicationProvider>
                      <div className="App">
                        <Routes>
                          {/*update: Add route for email verification - CRITICAL for production*/}
                          <Route path="/verify-email" element={<EmailVerification />} />
                          
                          {/*update: All other routes handled by state-based navigation*/}
                          <Route path="*" element={<MainApp />} />
                        </Routes>
                      </div>
                    </PublicationProvider>
                  </OrganizationProvider>
                </OrderProvider>
              </PackageProvider>
            </ProductProvider>
          </ShopProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;