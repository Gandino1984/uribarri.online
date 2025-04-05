import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';

export const TopBarUtils = () => {
    // Auth context values
    const {
        setIsLoggingIn, setNameUser, 
        setPassword, setPasswordRepeat,
        setShowPasswordLabel, setKeyboardKey, 
        setDisplayedPassword, 
        setUserType, logout,
        currentUser, setCurrentUser
    } = useAuth();

    // UI context values
    const {
        setError, setSuccess,
        setShowShopManagement,
        setShowProductManagement,
        setShowLandingPage
    } = useUI();

    // Shop context values
    const {
        showShopManagement,
        setShowShopCreationForm,
        showShopCreationForm, 
        selectedShop, setSelectedShop,
        setShops, setSelectedShopType
    } = useShop();

    // Product context values
    const {
        showProductManagement,
        isUpdatingProduct, 
        setIsUpdatingProduct, 
        setSelectedProductToUpdate
    } = useProduct();

    const handleBack = () => {
        // 🔄 UPDATE: Fixed navigation flow - when in ShopProductsList, go back to shop list
        if (selectedShop && showProductManagement && !isUpdatingProduct) {
            console.log('Navigating from ShopProductsList back to ShopsListBySeller');
            setShowProductManagement(false);
            setSelectedShop(null);
            return;
        }
        
        // 🔄 UPDATE: Improved condition for product creation/update form
        if (selectedShop && !showShopCreationForm && isUpdatingProduct) {
            console.log('Navigating from ProductCreationForm back to ShopProductsList');
            setIsUpdatingProduct(false);
            setSelectedProductToUpdate(null);
            setShowProductManagement(true);
            return;
        }
        
        // If we're creating a shop, go back to shop management
        if (showShopCreationForm) {
            setShowShopCreationForm(false);
            setShowShopManagement(true);
            return;
        }
        
        // 🔄 UPDATE: Clarified condition for selected shop without product management
        if (selectedShop && !showProductManagement) {
            setSelectedShop(null);
            setShowShopManagement(true);
            return;
        }
        
        // If we're in shop management, go back to login
        if (showShopManagement) {
            setShowShopManagement(false);
            setIsLoggingIn(true);
            return;
        }
    };

    const clearUserSession = () => {
        if (currentUser) {
            setCurrentUser(null);
            setNameUser('');
            setPassword('');
            setPasswordRepeat('');
            setDisplayedPassword('');
            setShowPasswordLabel(true);
            setUserType('');
        }
        
        setSelectedShop(null);
        setShowShopCreationForm(false);
        setShowShopManagement(false);
        setShowProductManagement(false);
        setShops([]);
        setSelectedShopType(null);
        
        setIsLoggingIn(true);
        setKeyboardKey((prev) => prev + 1);
        
        // Set showLandingPage to true when logging out
        setShowLandingPage(true);
        
        localStorage.removeItem('currentUser');

        // Clear both error and success states
        setError({
            userError: '',
            passwordError: '',
            passwordRepeatError: '',
            ipError: '',
            userlocationError: '',
            userTypeError: '',
            databaseResponseError: '',
            shopError: '',
            productError: '',
            imageError: ''
        });

        setSuccess({
            loginSuccess: '',
            shopSuccess: '',
            productSuccess: '',
            updateSuccess: '',
            deleteSuccess: '',
            imageSuccess: ''
        });
        
        logout();
    };

    return {
        handleBack,
        clearUserSession
    };
};