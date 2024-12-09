import { useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { useUsernameValidation } from './useUsernameValidation.jsx';
import { useIPValidation } from './useIpValidation.jsx';
import axiosInstance from '../../../../../utils/axiosConfig.js';

/**
 * Custom hook for handling login and registration functionality
 * @returns {Object} Object containing methods and state for login/register operations
 */
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
        setShowBusinessSelector,
        setDisplayedPassword,
        userType, setUserType,
        currentUser, 
        login, logout,
        setIsAddingShop,
        setShops,
        usernameError, setUsernameError,
<<<<<<< HEAD
=======
        passwordError, setPasswordError
>>>>>>> dev
    } = useContext(AppContext);

    // Custom hooks for validation
    const { validateUsername, cleanupUsername } = useUsernameValidation();
    const { ipError, validateIPRegistration } = useIPValidation();

    /**
     * Handles username input changes with cleanup
     * @param {Event} e - The input change event
     */
    const handleUsernameChange = (e) => {
        const rawValue = e.target.value;
<<<<<<< HEAD
        console.log('Username input:', rawValue);
=======
        console.log('!!! LOGIN: Username rawValue= ', rawValue);
>>>>>>> dev
        setUsername(rawValue);
        setUsernameError('');
      };

    /**
     * Handles completion of password entry
     * @param {boolean} isLogin - Whether in login mode
     * @returns {Function} Callback function for password completion
     */
    const handlePasswordComplete = (isLogin) => () => {
        if (!isLogin) {
            setDisplayedPassword('');
            setShowPasswordRepeat(true);
            setKeyboardKey((prev) => prev + 1);
        } else {
            setShowPasswordLabel(false);
        }
    };



    /**
     * Handles password input changes
     * @param {boolean} isLogin - Whether in login mode
     * @param {string} newPassword - New password value
     */
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

    /**
     * Handles repeated password input changes
     * @param {string} newPassword - New password value
     */
    const handleRepeatPasswordChange = (newPassword) => {
        setPasswordRepeat(newPassword);
        setDisplayedPassword('*'.repeat(newPassword.length));
    };

    /**
     * Resets all form fields to their initial state
     */
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

    /**
     * Toggles between login and registration forms
     */
    const toggleForm = () => {
        clearUserSession();
        setIsLoggingIn((prevState) => !prevState);
        resetForm();
    };

    /**
     * Processes login response and updates user state
     * @param {Object} response - Server response
     * @throws {Error} If response is invalid
     */
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
                    setShowBusinessSelector(false);
                } else {
                    // Set the shops owned by this specific seller
                    setShops(userShops);
                    setShowBusinessSelector(true);
                    setIsAddingShop(false);
                }
            } catch (error) {
                console.error('Error fetching seller shops:', error);
                setIsAddingShop(true);
                setShowBusinessSelector(false);
            }
        }else {
            // For other user types (client, provider), show business selector
            setShowBusinessSelector(true);
        }
    };

    /**
     * Processes registration response and updates user state
     * @param {Object} response - Server response, comes from handleRegistration
     * @throws {Error} If response is invalid
     */
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
            id: userData.id_user
        };
        login(normalizedUserData);
        setShowBusinessSelector(true); //??
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

    /**
     * Handles login API request
     * @param {string} cleanedUsername - Sanitized username
     * @param {string} password - User password
     */
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
            setShowBusinessSelector(true);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.message;
          if (errorMessage.includes('username')) {
            setUsernameError('Sorry, we couldn\'t find a user with that username');
          } else {
            setUsernameError('Nombre de usuario o contraseña incorrectos');
          }
        }
      };
  
    /**
     * Handles registration API request
     * @param {string} cleanedUsername - Sanitized username
     * @param {string} password - User password
     * @param {string} userType - Type of user account
     */
    const handleRegistration = async (cleanedUsername, password, userType) => {
        const registrationData = {
            name_user: cleanedUsername,
            pass_user: password,
            type_user: userType,
            location_user: 'bilbao'
        };
        const response = await axiosInstance.post('/user/register', registrationData);
        await handleRegistrationResponse(response);
        toggleForm();
    };

    /**
     * Clears current user session and resets form
     */
    const clearUserSession = () => {
        logout();
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setDisplayedPassword('');
        setShowPasswordLabel(true);
        setKeyboardKey((prev) => prev + 1);
        setShowBusinessSelector(false);
    };
      
    /**
     * Handles form submission for both login and registration
     * @param {Event} e - Form submission event
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
          // IP validation for registration only
          if (!isLoggingIn) {
            const canRegister = await validateIPRegistration();
            if (!canRegister) {
              console.log('IP validation failed');
              return;
            }
          }
      
          // Username validation
          const { isValid, cleanedUsername, errors } = validateUsername(username);
          if (!isValid) {
            setError(errors[0]);
            return;
          }
      
          // Form validation
          if (isButtonDisabled()) {
            return;
          }
      
          // Check for existing session
          if (!isLoggingIn && currentUser?.id) {
            console.log('Existing user session');
            setUsernameError('Ya existe un usuario registrado con ese nombre.');
            return;
          }
      
          // Handle login or registration
          if (isLoggingIn) {
            console.log('Attempting login', { 
              username, 
              userType  // Log the current user type
            });
            await handleLogin(cleanedUsername, password);
          } else {
            console.log('Attempting registration');
            await handleRegistration(cleanedUsername, password, userType);
          }
        } catch (error) {
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

    /**
     * Handles user type selection changes
     * @param {Event} e - Change event from user type selector
     */
    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setUsernameError('');
    };

    /**
     * Determines whether the submit button should be disabled based on form input validity.
     * 
     * @returns {boolean} True if the button should be disabled, false otherwise.
     */
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