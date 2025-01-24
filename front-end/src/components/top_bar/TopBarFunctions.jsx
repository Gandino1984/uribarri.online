import React, { useContext } from 'react';
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
        setError, setShowProductManagement, currentUser
    } = useContext(AppContext);

    const handleBack = () => {
        if (showShopCreationForm) {
            // If on shop creation form, go back to shop management
            setShowShopCreationForm(false);
            setshowShopManagement(true);
        } else if (selectedShop) {
            // If a shop is selected, deselect it
            setSelectedShop(null);
            setshowShopManagement(true);
        } else if (showShopManagement) {
            // If on shop management, go back to login/initial state
            setshowShopManagement(false);
            setIsLoggingIn(true);
        }
    };

    const clearUserSession = () => {
        // Only clear the user session if currentUser is not already null
        if (currentUser) {
            setCurrentUser(null);
            setNameUser('');
            setPassword('');
            setPasswordRepeat('');
            setDisplayedPassword('');
            setShowPasswordLabel(true);
            setUserType('');
        }
        
        // Clear shop-related state
        setSelectedShop(null);
        setShowShopCreationForm(false);
        setshowShopManagement(false);
        setShowProductManagement(false);
        setShops([]);
        setSelectedShopType(null);
        
        // Reset to login state
        setIsLoggingIn(true);
        
        // Increment keyboard key to reset numeric keyboard
        setKeyboardKey((prev) => prev + 1);
        
        // Clear localStorage
        localStorage.removeItem('currentUser');

        setError({
            userError: '',
            passwordError: '',
            passwordRepeatError: '',
            ipError: '',
            userlocationError: '',
            userTypeError: '',
            databaseResponseError: ''
        });
        
        // Call logout function
        logout();
    };

    return {
        handleBack,
        clearUserSession
    };
};