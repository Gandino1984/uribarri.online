//update: Enhanced with public navigation support and clearNavigationState
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import { usePackage } from '../../app_context/PackageContext.jsx';

export const TopBarUtils = () => {
    const {
        setIsLoggingIn, setNameUser, 
        setPassword, setPasswordRepeat,
        setShowPasswordLabel, setKeyboardKey, 
        setDisplayedPassword, 
        setUserType, logout,
        currentUser, setCurrentUser,
        clearUserSession: authClearUserSession
    } = useAuth();

    const {
        setShowErrorCard, setShowSuccessCard, setShowInfoCard,
        clearError, clearSuccess, clearInfo,
        setShowShopManagement,
        setShowProductManagement,
        setShowLandingPage,
        setShowImageModal,
        setShowShopsListBySeller,
        showShopWindow,
        setShowShopWindow,
        showShopsListBySeller,
        showProductManagement,
        showShopStore,
        setShowShopStore,
        selectedShopForStore,
        setSelectedShopForStore,
        showInfoManagement,
        setShowInfoManagement,
        clearNavigationState
    } = useUI();

    const {
        showShopManagement,
        setShowShopCreationForm,
        showShopCreationForm, 
        selectedShop, setSelectedShop,
        setShops, setSelectedShopType,
        closeShopFormWithAnimation
    } = useShop();

    const {
        isUpdatingProduct, 
        setIsUpdatingProduct, 
        setSelectedProductToUpdate,
        setProducts
    } = useProduct();
    
    const {
        showPackageCreationForm,
        setShowPackageCreationForm,
        closePackageFormWithAnimation
    } = usePackage();

    const handleBack = async () => {
        //update: Enhanced back navigation for public pages
        
        // From InfoManagement - check if user is logged in
        if (showInfoManagement) {
            console.log('Navigating from InfoManagement');
            if (currentUser) {
                // Logged in users can go to ShopWindow or LandingPage
                console.log('-> Logged in user going to ShopWindow');
                setShowInfoManagement(false);
                setShowShopWindow(true);
            } else {
                // Anonymous users go to LandingPage
                console.log('-> Anonymous user going to LandingPage');
                setShowInfoManagement(false);
                setShowLandingPage(true);
            }
            return;
        }
        
        // From ShopWindow - check if user is logged in
        if (showShopWindow && !showShopStore) {
            console.log('Navigating from ShopWindow');
            if (currentUser && currentUser.type_user === 'seller') {
                // Sellers might have come from ShopsListBySeller
                console.log('-> Seller going to ShopsListBySeller');
                setShowShopWindow(false);
                setShowShopsListBySeller(true);
            } else {
                // Everyone else goes to LandingPage
                console.log('-> Going to LandingPage');
                setShowShopWindow(false);
                setShowLandingPage(true);
            }
            return;
        }
        
        // From ShopStore back to ShopWindow
        if (showShopStore) {
            console.log('Navigating from ShopStore back to ShopWindow');
            setShowShopStore(false);
            setSelectedShopForStore(null);
            setShowShopWindow(true);
            return;
        }
        
        // From PackageCreationForm back to ShopProductsList
        if (selectedShop && showProductManagement && showPackageCreationForm) {
            console.log('Navigating from PackageCreationForm back to ShopProductsList');
            await closePackageFormWithAnimation();
            return;
        }
        
        // From ProductCreationForm back to ShopProductsList
        if (selectedShop && showProductManagement && isUpdatingProduct) {
            console.log('Navigating from ProductCreationForm back to ShopProductsList');
            setIsUpdatingProduct(false);
            setSelectedProductToUpdate(null);
            return;
        }
        
        // From ShopProductsList back to ShopsListBySeller
        if (showProductManagement && selectedShop && !isUpdatingProduct && !showPackageCreationForm) {
            console.log('Navigating from ShopProductsList back to ShopsListBySeller');
            setShowProductManagement(false);
            return;
        }
        
        // From ShopCreationForm back to ShopsListBySeller
        if (showShopCreationForm) {
            console.log('Navigating from ShopCreationForm back to ShopsListBySeller');
            await closeShopFormWithAnimation();
            return;
        }
        
        // From ShopsListBySeller - sellers go to ShopWindow
        if (showShopsListBySeller && !showProductManagement && !showShopCreationForm && currentUser?.type_user === 'seller') {
            console.log('Navigating from ShopsListBySeller back to ShopWindow');
            setShowShopsListBySeller(false);
            setShowShopWindow(true);
            setSelectedShop(null);
            return;
        }
        
        // From ShopsListBySeller (generic fallback)
        if (showShopsListBySeller && !showProductManagement && !showShopCreationForm) {
            console.log('Navigating from ShopsListBySeller back to LandingPage');
            setShowShopsListBySeller(false);
            setShowLandingPage(true);
            setSelectedShop(null);
            return;
        }
    };

    const clearUserSession = () => {
        console.log('=== CLEARING USER SESSION ===');
        
        // Handle Auth context cleanup
        if (currentUser) {
            setCurrentUser(null);
            setNameUser('');
            setPassword('');
            setPasswordRepeat('');
            setDisplayedPassword('');
            setShowPasswordLabel(true);
            setUserType('');
        }
        
        // Handle Shop context cleanup
        setSelectedShop(null);
        setShowShopCreationForm(false);
        setShowShopManagement(false);
        setShops([]);
        setSelectedShopType(null);
        
        // Handle Product context cleanup
        setShowProductManagement(false);
        setProducts([]);
        
        // Handle Package context cleanup
        setShowPackageCreationForm(false);
        
        // Handle UI context cleanup
        setIsLoggingIn(true);
        setKeyboardKey((prev) => prev + 1);
        setShowLandingPage(true);
        setShowImageModal(false);
        setShowShopsListBySeller(false);
        setShowShopWindow(false);
        setShowShopStore(false);
        setSelectedShopForStore(null);
        setShowInfoManagement(false);
        
        // Also use Auth context's clearUserSession function
        authClearUserSession();
        
        //update: Clear navigation state from UIContext and localStorage
        clearNavigationState();
        
        // Clear localStorage
        localStorage.removeItem('currentUser');

        // Clear all notification states
        clearError();
        clearSuccess();
        clearInfo();
        
        setShowErrorCard(false);
        setShowSuccessCard(false);
        setShowInfoCard(false);
        
        // Complete logout
        logout();
        
        console.log('User session cleared - redirected to LandingPage');
    };

    return {
        handleBack,
        clearUserSession
    };
};