import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
// import { useSpring, animated } from '@react-spring/web';

export const TopBarUtils = () => {
    const {
        setIsLoggingIn, setNameUser, 
        setPassword, setPasswordRepeat,
        setShowPasswordLabel, setKeyboardKey, 
        setshowShopManagement, setDisplayedPassword, 
        setUserType, logout,
        showShopManagement, setShowShopCreationForm,
        showShopCreationForm, selectedShop, setSelectedShop,
        setCurrentUser, setShops, setSelectedShopType, 
        setError, setSuccess, setShowProductManagement, currentUser,
        isUpdatingProduct, setIsUpdatingProduct, setSelectedProductToUpdate,
        showProductManagement
    } = useContext(AppContext);

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
            setshowShopManagement(true);
            return;
        }
        
        // If we have a selected shop, go back to shop selection
        if (selectedShop) {
            setSelectedShop(null);
            setshowShopManagement(true);
            return;
        }
        
        // If we're in shop management, go back to login
        if (showShopManagement) {
            setshowShopManagement(false);
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
        setshowShopManagement(false);
        setShowProductManagement(false);
        setShops([]);
        setSelectedShopType(null);
        
        setIsLoggingIn(true);
        setKeyboardKey((prev) => prev + 1);
        
        localStorage.removeItem('currentUser');

        // Clear both error and success states
        setError({
            userError: '',
            passwordError: '',
            passwordRepeatError: '',
            ipError: '',
            userlocationError: '',
            userTypeError: '',
            databaseResponseError: ''
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