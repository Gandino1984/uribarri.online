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
        // setError, setSuccess, setInfo,
        setShowErrorCard, setShowSuccessCard, setShowInfoCard,
        clearError, clearSuccess, clearInfo,
        setShowShopManagement,
        setShowProductManagement,
        setShowLandingPage,
        setShowImageModal,
        setShowShopsListBySeller,
        //update: Added showShopWindow to destructuring
        showShopWindow,
        setShowShopWindow,
        showShopsListBySeller,
        showProductManagement,
        showShopStore,
        setShowShopStore,
        selectedShopForStore,
        setSelectedShopForStore
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
        isUpdatingProduct, 
        setIsUpdatingProduct, 
        setSelectedProductToUpdate,
        setProducts
    } = useProduct();
    
    // Package context values
    const {
        showPackageCreationForm,
        setShowPackageCreationForm,
        closePackageFormWithAnimation
    } = usePackage();

    const handleBack = async () => {
        //update: Check ShopWindow navigation first (higher priority)
        if (showShopWindow && !showShopStore) {
            console.log('Navigating from ShopWindow back to LandingPage');
            setShowShopWindow(false);
            setShowLandingPage(true);
            return;
        }
        
        if (showShopStore) {
            console.log('Navigating from ShopStore back to ShopWindow');
            setShowShopStore(false);
            setSelectedShopForStore(null);
            setShowShopWindow(true);
            return;
        }
        
        // If creating packages within product management, go back to products list
        if (selectedShop && showProductManagement && showPackageCreationForm) {
            console.log('Navigating from PackageCreationForm back to ShopProductsList');
            await closePackageFormWithAnimation();
            return;
        }
        
        // When in ProductCreationForm, go back to ShopProductsList
        if (selectedShop && showProductManagement && isUpdatingProduct) {
            console.log('Navigating from ProductCreationForm back to ShopProductsList');
            setIsUpdatingProduct(false);
            setSelectedProductToUpdate(null);
            return;
        }
        
        // When in ShopProductsList (ProductManagement), go back to ShopsListBySeller
        if (showProductManagement && selectedShop && !isUpdatingProduct && !showPackageCreationForm) {
            console.log('Navigating from ShopProductsList back to ShopsListBySeller');
            
            // Just toggle showProductManagement, ShopManagement will handle the rendering
            setShowProductManagement(false);
            // Don't clear selectedShop - ShopsListBySeller needs it to show the shop card
            
            return;
        }
        
        // If we're creating a shop, go back to shops list
        if (showShopCreationForm) {
            console.log('Navigating from ShopCreationForm back to ShopsListBySeller');
            await closeShopFormWithAnimation();
            // No need to set showShopsListBySeller - ShopManagement handles this
            return;
        }
        
        // If we're in ShopsListBySeller (no product management, no shop creation), go back to landing
        if (showShopsListBySeller && !showProductManagement && !showShopCreationForm) {
            console.log('Navigating from ShopsListBySeller back to LandingPage');
            setShowShopsListBySeller(false);
            setShowLandingPage(true);
            setSelectedShop(null);
            return;
        }
    };

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