import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import { usePackage } from '../../app_context/PackageContext.jsx';

export const TopBarUtils = () => {
    // Auth context values
    const {
        setIsLoggingIn, setNameUser, 
        setPassword, setPasswordRepeat,
        setShowPasswordLabel, setKeyboardKey, 
        setDisplayedPassword, 
        setUserType, logout,
        currentUser, setCurrentUser,
        clearUserSession: authClearUserSession
    } = useAuth();

    // UI context values
    const {
        setError, setSuccess, setInfo,
        setShowErrorCard, setShowSuccessCard, setShowInfoCard,
        clearError, clearSuccess, clearInfo,
        setShowShopManagement,
        setShowProductManagement,
        setShowLandingPage,
        setShowImageModal
    } = useUI();

    // Shop context values
    const {
        showShopManagement,
        setShowShopCreationForm,
        showShopCreationForm, 
        selectedShop, setSelectedShop,
        setShops, setSelectedShopType,
        closeShopFormWithAnimation
    } = useShop();

    // Product context values
    const {
        showProductManagement,
        isUpdatingProduct, 
        setIsUpdatingProduct, 
        setSelectedProductToUpdate
    } = useProduct();
    
    // Package context values
    const {
        showPackageCreationForm,
        setShowPackageCreationForm,
        closePackageFormWithAnimation
    } = usePackage();

    // 🔍 UPDATE: Enhanced handleBack with better navigation flow including package creation
    const handleBack = async () => {
        // If creating packages within product management, go back to products list
        if (selectedShop && showProductManagement && showPackageCreationForm) {
            console.log('Navigating from PackageCreationForm back to ShopProductsList');
            await closePackageFormWithAnimation();
            return;
        }
        
        // When in ShopProductsList, go back to shop list
        if (selectedShop && showProductManagement && !isUpdatingProduct) {
            console.log('Navigating from ShopProductsList back to ShopsListBySeller');
            setShowProductManagement(false);
            setSelectedShop(null);
            return;
        }
        
        // Handle product creation/update form navigation
        if (selectedShop && !showShopCreationForm && isUpdatingProduct) {
            console.log('Navigating from ProductCreationForm back to ShopProductsList');
            setIsUpdatingProduct(false);
            setSelectedProductToUpdate(null);
            setShowProductManagement(true);
            return;
        }
        
        // If we're creating a shop, go back to shop management with animation
        if (showShopCreationForm) {
            console.log('Navigating from ShopCreationForm back to shop management');
            await closeShopFormWithAnimation();
            setShowShopManagement(true);
            return;
        }
        
        // Selected shop without product management
        if (selectedShop && !showProductManagement) {
            console.log('Navigating from shop details back to shop list');
            setSelectedShop(null);
            setShowShopManagement(true);
            return;
        }
        
        // If we're in shop management, go back to login
        if (showShopManagement) {
            console.log('Navigating from shop management back to login screen');
            setShowShopManagement(false);
            setIsLoggingIn(true);
            return;
        }
    };

    // 🧹 UPDATE: Enhanced clearUserSession with more cleanup across all contexts
    const clearUserSession = () => {
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
        
        // Handle Package context cleanup
        setShowPackageCreationForm(false);
        
        // Handle UI context cleanup
        setIsLoggingIn(true);
        setKeyboardKey((prev) => prev + 1);
        setShowLandingPage(true);
        setShowImageModal(false);
        
        // Also use Auth context's clearUserSession function
        authClearUserSession();
        
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
    };

    return {
        handleBack,
        clearUserSession
    };
};