import { useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { useUsernameValidation } from './useUsernameValidation.jsx';
import { useIPValidation } from './useIpValidation.jsx';
import axiosInstance from '../../../../../utils/axiosConfig.js';

export const LoginRegisterFunctions = () => {
    const {
        isLoggingIn, setIsLoggingIn,
        username, setUsername,
        password, setPassword,
        passwordRepeat, showPasswordRepeat,
        setPasswordRepeat,
        setShowPasswordRepeat,
        setShowPasswordLabel,
        setKeyboardKey,
        showShopManagement, setshowShopManagement,
        setDisplayedPassword,
        userType, setUserType,
        currentUser, 
        login, logout,
        setIsAddingShop,
        setShops,
        usernameError, setUsernameError,
        passwordError, setPasswordError,
        locationUser, setLocationUser,
        shopName, setShopName,
        shopLocation, setShopLocation,
        shopType, setShopType,
        shopSubtype, setShopSubtype
    } = useContext(AppContext);

    // Custom hooks for validation
    const { validateUsername, cleanupUsername } = useUsernameValidation();
    const { ipError, validateIPRegistration } = useIPValidation();


    const handleUsernameChange = (e) => {
        const rawValue = e.target.value;
        console.log('!!! LOGIN: Username rawValue= ', rawValue);
        setUsername(rawValue);
        setUsernameError('');
      };

    const handlePasswordComplete = (isLogin) => () => {
        if (!isLogin) {
            setDisplayedPassword('');
            setShowPasswordRepeat(true);
            setKeyboardKey((prev) => prev + 1);
        } else {
            setShowPasswordLabel(false);
        }
    };

    const handlePasswordChange = (isLogin, newPassword) => {
        if (!isLogin && showPasswordRepeat) {
            setPasswordRepeat(newPassword);
            setDisplayedPassword('*'.repeat(newPassword.length));
        } else {
            setPassword(newPassword);
            setDisplayedPassword('*'.repeat(newPassword.length));
        }   
        if (isLogin && newPassword.length !== 4) {
            setShowPasswordLabel(true);
        }
    };


    const handleRepeatPasswordChange = (newPassword) => {
        setPasswordRepeat(newPassword);
        setDisplayedPassword('*'.repeat(newPassword.length));
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setDisplayedPassword('');
        setShowPasswordRepeat(false);
        setShowPasswordLabel(true);
        setKeyboardKey((prev) => prev + 1);
        setUsernameError('');
        setUserType('');
    };


    const toggleForm = () => {
        clearUserSession();
        setIsLoggingIn((prevState) => !prevState);
        resetForm();
    };

    const handleLoginResponse = async (response) => {
        if (!response.data) {
            throw new Error('No se recibió respuesta del servidor');
        }
        if (response.data.error) {
            throw new Error(response.data.error);
        }
        const userData = response.data.data;
        if (!userData || !userData.id_user || !userData.name_user || !userData.type_user) {
            throw new Error('Datos de usuario incompletos o inválidos');
        }
         // Ensure user type is set in context
        setUserType(userData.type_user);
        // Normalize user data structure using the server-provided user type
        const normalizedUserData = {
            username: userData.name_user,
            password: password,
            userType: userData.type_user, 
            id: userData.id_user
        };
        login(normalizedUserData);
        // Special handling for seller type
        if (userData.type_user === 'seller') {
            try {
                // Fetch shops specifically for the logged-in seller
                const shopsResponse = await axiosInstance.post('/shop/user', {
                    id_user: userData.id_user
                });
                
                const userShops = shopsResponse.data.data || [];
                
                // If no shops exist, open the shop creation form
                if (userShops.length === 0) {
                    setIsAddingShop(true);
                    setshowShopManagement(false);
                } else {
                    // Set the shops owned by this specific seller
                    setShops(userShops);
                    setshowShopManagement(true);
                    setIsAddingShop(false);
                }
            } catch (error) {
                console.error('Error fetching seller shops:', error);
                setIsAddingShop(true);
                setshowShopManagement(false);
            }
        }else {
            // For other user types (client, provider), show business selector
            setshowShopManagement(true);
        }
    };

    const handleRegistrationResponse = async (response) => {
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      const userData = response.data.data;
      if (!userData || !userData.id_user) {
        throw new Error('Error en el registro: datos de usuario incompletos');
      }
      const normalizedUserData = {
        username: userData.name_user,
        password: password,
        userType: userType,
        id: userData.id_user,
        shopData: response.data.shop // Include shop data if available
      };
      login(normalizedUserData);
      if (userType === 'seller') {
        // For sellers, show business selector
        setshowShopManagement(true);
      }
    };

    // /**
    //  * Validates form inputs
    //  * @param {string} cleanedUsername - Sanitized username
    //  * @returns {Object} Validation result and error message if any
    //  */
    // const validateForm = (cleanedUsername) => {
    //     if (!cleanedUsername || cleanedUsername.trim() === '') {
    //         return { isValid: false, error: 'El nombre de usuario es requerido' };
    //     }
    //     if (!password || password.length !== 4) {
    //         return { isValid: false, error: 'La contraseña debe tener 4 dígitos' };
    //     }
    //     if (!isLoggingIn) {
    //         if (!passwordRepeat || passwordRepeat.length !== 4) {
    //             return { isValid: false, error: 'La confirmación de contraseña debe tener 4 dígitos' };
    //         }
    //         if (password !== passwordRepeat) {
    //             return { isValid: false, error: 'Las contraseñas no coinciden' };
    //         }
    //         if (!userType) {
    //             return { isValid: false, error: 'Debe seleccionar un tipo de usuario' };
    //         }
    //     }
    //     return { isValid: true, error: null };
    // };


    const handleLogin = async (cleanedUsername, password) => {
        try {
          // Fetch user details first
          const userDetailsResponse = await axiosInstance.post('/user/details', {
            name_user: cleanedUsername
          });
          // Enhanced type extraction and validation
          const type = userDetailsResponse.data.data.type_user;
          console.log('User type retrieved from DB = ', type);
          if (!userDetailsResponse.data.data) {
            setUsernameError('Sorry, we couldn\'t find a user with that username');
            return;
          }
          if (!type) {
            setUsernameError('Sorry, we couldn\'t find a user with that username');
            console.error('User type not found for username:', cleanedUsername);
            return;
          }
          // Explicitly set user type in context before login
          setUserType(type);
          // Proceed with login using the obtained user type
          const loginResponse = await axiosInstance.post('/user/login', {
            name_user: cleanedUsername,
            pass_user: password,
            type_user: type
          });
          await handleLoginResponse(loginResponse);
          // Check if user type is 'seller' and show ShopManagement component
          if (type === 'seller') {
            setshowShopManagement(true);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message;
          if (errorMessage.includes('username')) {
            setUsernameError('Nombre de usuario incorrecto');
          } else {
            setUsernameError('Nombre de usuario o contraseña incorrectos');
          }
        }
      };
  
      const handleRegistration = async (cleanedUsername, password, userType, locationUser, shopName, shopLocation, shopType, shopSubtype) => {
        console.log('Calling handleRegistration...');
        if (userType === 'seller') {
          const registrationData = {
            name_user: cleanedUsername,
            pass_user: password,
            location_user: locationUser || '', // User location
            name_shop: shopName,
            location_shop: shopLocation,
            type_shop: shopType,
            subtype_shop: shopSubtype
          };
    
          console.log('!!! handleRegistration() - Registration data:', registrationData);
    
          // Log the values of shopType and shopSubtype
          console.log('shopType:', shopType);
          console.log('shopSubtype:', shopSubtype);
    
          try {
            const response = await axiosInstance.post('/user/seller/create', registrationData, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
            console.log('Full response - sellerCreate', response);
    
            // Ensure we handle the registration response
            await handleRegistrationResponse(response);
    
            // For sellers, explicitly set shop management to true
            setshowShopManagement(true);
            setIsLoggingIn(false); // Ensure we're not in login mode
          } catch (error) {
            console.error('Full error details:', {
              response: error.response,
              request: error.request,
              message: error.message,
              config: error.config
            });
    
            // detailed error handling
            setUsernameError(
              error.response?.data?.error ||
              error.message ||
              'Registration failed'
            );
          }
        }
      };

    const clearUserSession = () => {
        logout();
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setDisplayedPassword('');
        setShowPasswordLabel(true);
        setKeyboardKey((prev) => prev + 1);
        // setshowShopManagement(false);
    };
      
    const handleFormSubmit = async (e) => {
      console.log('-> LoginRegisterFunctions - handleFormSubmit - Form submitted.');
      e.preventDefault();
      try {
        // IP validation for registration only
        console.log('-> isLoggingIn state = ', isLoggingIn);
        if (!isLoggingIn) {
          console.log('-> handleFormSubmit - Validación de IP para registro iniciada');

          const canRegister = await validateIPRegistration();
          
          if (!canRegister) {
            console.log('IP validation failed');
            return;
          }
        }
        // Username validation
        const { isValid, cleanedUsername, errors } = validateUsername(username);
        if (!isValid) {
          setUsernameError(errors[0]);
          return;
        }
        // Form validation
        if (isButtonDisabled()) {
          return;
        }
        // Check for existing session
        if (!isLoggingIn && currentUser?.id) {
          setUsernameError('Ya existe un usuario registrado con ese nombre.');
          return;
        }
        // Handle login or registration
        if (isLoggingIn) {
          await handleLogin(cleanedUsername, password);
        } else {
          // For seller registration, ensure shop management is set to true
          console.log('User type:', userType);
          if (userType === 'seller') {
            console.log('Seller registration initiated');
            setshowShopManagement(true);

            
            // Slight delay to ensure state update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Attempt registration with shop details
            await handleRegistration(
              cleanedUsername, 
              password, 
              userType,
              locationUser, 
              shopName, 
              shopLocation, 
              shopType, 
              shopSubtype
            );
          } else {
            // Handle registration for other user types
            await handleRegistration(cleanedUsername, password, userType);
          }
        }
      } catch (error) {
        console.error('Error during registration:', error);
        const errorMessage = error.response?.data?.error || error.message;
        if (errorMessage.includes('username')) {
          setUsernameError(errorMessage);
        } else {
          setPasswordError(errorMessage);
        } 
        // Reset password fields on error
        setPassword('');
        setPasswordRepeat('');
        setDisplayedPassword('');
        setShowPasswordLabel(true);
        setKeyboardKey((prev) => prev + 1);
      }
    };


    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setUsernameError('');
    };


    const isButtonDisabled = () => {
        // Check if the username is valid
        const { isValid } = validateUsername(username);
        // If the username is not valid, disable the button
        if (!isValid) return true;
        // Check password fields based on whether we're logging in or registering
        if (isLoggingIn) {
        // For login, only require a 4-digit password
        return password.length !== 4;
        } else {
        // For registration, require a 4-digit password, matching password repeat, and a selected user type
        return password.length !== 4 || 
                passwordRepeat.length !== 4 || 
                password !== passwordRepeat || 
                !userType === '';
        }
    };

    return {
        handlePasswordComplete,
        handlePasswordChange,
        handleRepeatPasswordChange,
        isButtonDisabled,
        toggleForm,
        handleFormSubmit,
        handleUserTypeChange,
        handleUsernameChange,
        // validateForm,
        usernameError,
        passwordError,
        ipError
    };
};