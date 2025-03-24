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
        // If we're in the product creation/update form, go back to the products list
        if (selectedShop && !showShopCreationForm && !isUpdatingProduct && !showProductManagement) {
            // We're in the ProductCreationForm and need to go back to ShopProductsList
            setShowProductManagement(true);
            return;
        }
        
        // Handle the product update form case
        if (selectedShop && isUpdatingProduct) {
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
        
        // If we have a selected shop, go back to shop selection
        if (selectedShop) {
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