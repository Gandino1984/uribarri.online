//update: Fixed routing logic to properly handle password reset pages
import { useEffect } from 'react';
import { UIProvider } from "./app_context/UIContext.jsx";
import { AuthProvider } from "./app_context/AuthContext.jsx";
import { ShopProvider } from "./app_context/ShopContext.jsx";
import { ProductProvider } from "./app_context/ProductContext.jsx";
import { PackageProvider } from "./app_context/PackageContext.jsx";
import { OrderProvider } from "./app_context/OrderContext.jsx";
import { OrganizationProvider } from "./app_context/OrganizationContext.jsx";
import { PublicationProvider } from "./app_context/PublicationContext.jsx";
import { ParticipantProvider } from "./app_context/ParticipantContext.jsx";
import styles from '../../front-end/css/App.module.css';
import '../css/App.css';
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
import RiderOrdersManagement from "../src/components/rider_order_management/RiderOrderManagement.jsx";
import EmailVerification from "../src/components/email_verification/EmailVerification.jsx";
import InfoManagement from "../src/components/info_management/InfoManagement.jsx";
//update: Import password reset components
import ForgotPassword from "./components/email_verification/ForgotPassword.jsx";
import ResetPassword from "./components/email_verification/ResetPassword.jsx";

const AppContent = () => {
  const {
    showTopBar,
    showLandingPage,
    showShopWindow,
    showShopStore,
    selectedShopForStore,
    showShopsListBySeller,
    showRiderManagement,
    setShowRiderManagement,
    setShowShopsListBySeller,
    setShowLandingPage,
    setShowTopBar,
    showOffersBoard,
    showInfoManagement,
    setShowInfoManagement,
    //update: Get password reset states
    showEmailVerification,
    showResetPassword,
    showForgotPassword,
    //update: Get edit mode state to prioritize edit form
    isEditMode
  } = useUI();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    //update: Don't run routing logic if on special pages
    if (showEmailVerification || showResetPassword || showForgotPassword) {
      console.log('On special page - skipping normal routing logic');
      return;
    }
    
    console.log('=== APP.JSX ROUTING EFFECT (MOUNT/USER CHANGE ONLY) ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser?.type_user:', currentUser?.type_user);
    
    if (currentUser || showShopWindow || showInfoManagement) {
      setShowTopBar(true);
      console.log('TopBar enabled');
    } else {
      console.log('No current user and not on public page');
    }
    
    console.log('=== END APP.JSX ROUTING EFFECT ===');
    console.log('Current navigation state:', {
      showInfoManagement,
      showShopWindow,
      showShopsListBySeller,
      showShopStore,
      showRiderManagement,
      showLandingPage
    });
  }, [
    currentUser?.id_user,
    showEmailVerification,
    showResetPassword,
    showForgotPassword,
    showShopWindow,
    showInfoManagement
  ]);
  
  const renderMainContent = () => {
    console.log('=== RENDER MAIN CONTENT ===');
    console.log('showResetPassword:', showResetPassword);
    console.log('showForgotPassword:', showForgotPassword);
    console.log('showEmailVerification:', showEmailVerification);
    console.log('isEditMode:', isEditMode);
    console.log('showShopsListBySeller:', showShopsListBySeller);
    console.log('showLandingPage:', showLandingPage);

    //update: PRIORITY 1 - Password reset pages (highest priority)
    if (showResetPassword) {
      console.log('✅ Rendering: ResetPassword');
      return <ResetPassword />;
    }

    if (showForgotPassword) {
      console.log('✅ Rendering: ForgotPassword');
      return <ForgotPassword />;
    }

    //update: PRIORITY 2 - Email verification
    if (showEmailVerification) {
      console.log('✅ Rendering: EmailVerification');
      return <EmailVerification />;
    }

    //update: PRIORITY 3 - Edit mode (must override all other views)
    if (isEditMode) {
      console.log('✅ Rendering: LoginRegisterForm (EDIT MODE)');
      return <LoginRegisterForm />;
    }

    //update: PRIORITY 4 - Regular app pages
    if (showInfoManagement) {
      console.log('Rendering: InfoManagement (public access allowed)');
      return <InfoManagement />;
    }
    
    if (showShopStore && selectedShopForStore) {
      console.log('Rendering: ShopStore');
      return <ShopStore />;
    }
    
    if (showRiderManagement && currentUser?.type_user === 'rider') {
      console.log('Rendering: RiderOrdersManagement');
      return <RiderOrdersManagement />;
    }
    
    if (showShopsListBySeller) {
      console.log('Rendering: ShopManagement');
      return <ShopManagement />;
    }
    
    if (showShopWindow) {
      console.log('Rendering: ShopWindow (public access allowed)');
      return <ShopWindow />;
    }
    
    if (showLandingPage) {
      console.log('Rendering: LandingPage');
      return <LandingPage />;
    }
    
    console.log('Rendering: LoginRegisterForm (default)');
    return <LoginRegisterForm />;
  };
  
  return (
    <div className={styles.mainContainer}>
      <ConfirmationModal />
      <ImageModal />
      {showTopBar && !showOffersBoard && !showEmailVerification && !showResetPassword && !showForgotPassword && <TopBar />} 
      <CardDisplay />
      {renderMainContent()}
    </div>
  );
};

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <OrganizationProvider>
          <ParticipantProvider>
            <ShopProvider>
              <ProductProvider>
                <PackageProvider>
                  <OrderProvider>
                    <PublicationProvider>
                      <AppContent />
                    </PublicationProvider>
                  </OrderProvider>
                </PackageProvider>
              </ProductProvider>
            </ShopProvider>
          </ParticipantProvider>
        </OrganizationProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;