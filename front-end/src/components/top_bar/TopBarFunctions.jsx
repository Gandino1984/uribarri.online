import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';

export const TopBarFunctions = () => {
    const {
        setIsLoggingIn, setNameUser, 
        setPassword, setPasswordRepeat,
        setShowPasswordLabel, setKeyboardKey, 
        setshowShopManagement, setDisplayedPassword, 
        setUserType, logout,
        showShopManagement, setShowShopCreationForm,
        showShopCreationForm, selectedShop, setSelectedShop,
        setCurrentUser, setShops, setSelectedShopType, 
        setError, setSuccess, setShowProductManagement, currentUser
    } = useContext(AppContext);

    const handleBack = () => {
        if (showShopCreationForm) {
            setShowShopCreationForm(false);
            setshowShopManagement(true);
        } else if (selectedShop) {
            setSelectedShop(null);
            setshowShopManagement(true);
        } else if (showShopManagement) {
            setshowShopManagement(false);
            setIsLoggingIn(true);
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