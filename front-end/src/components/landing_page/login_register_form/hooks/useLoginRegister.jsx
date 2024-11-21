import { useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { useUsernameValidation } from './useUsernameValidation.jsx';
import axiosInstance from '../../../../../utils/axiosConfig.js';

export const useLoginRegister = () => {
    const {
      isLoggingIn,
      setIsLoggingIn,
      username,
      setUsername,
      password,
      setPassword,
      passwordRepeat,
      showPasswordRepeat,
      setPasswordRepeat,
      setShowPasswordRepeat,
      setShowPasswordLabel,
      setKeyboardKey,
      setShowBusinessSelector,
      setDisplayedPassword,
      userType,
      setUserType,
      currentUser, 
      login, 
      logout 
    } = useContext(AppContext);

    const [usernameError, setUsernameError] = useState('');
    const { validateUsername, cleanupUsername } = useUsernameValidation();

    const handleUsernameChange = (e) => {
        const rawValue = e.target.value;
        const cleanedValue = cleanupUsername(rawValue);
        setUsername(cleanedValue);
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

    const handleClear = (isLogin) => () => {
        if (!isLogin) {
            if (showPasswordRepeat) {
                setPassword('');
                setPasswordRepeat('');
                setDisplayedPassword('');
                setShowPasswordRepeat(false);
                setShowPasswordLabel(true);
                setKeyboardKey((prev) => prev + 1);
            } else {
                setPassword('');
                setDisplayedPassword('');
            }
        } else {
            setPassword('');
            setDisplayedPassword('');
            setShowPasswordLabel(true);
        }
    };

    const handlePasswordChange = (isLogin, newPassword) => {
        if (!isLogin && showPasswordRepeat) {
            setPasswordRepeat(newPassword);
            // Update displayed password to show masks
            setDisplayedPassword('*'.repeat(newPassword.length));
        } else {
            setPassword(newPassword);
            // Update displayed password to show masks
            setDisplayedPassword('*'.repeat(newPassword.length));
        }   
        if (isLogin && newPassword.length !== 4) {
            setShowPasswordLabel(true);
        }
    };

    const handleRepeatPasswordChange = (newPassword) => {
        setPasswordRepeat(newPassword);
        // Update displayed password to show masks
        setDisplayedPassword('*'.repeat(newPassword.length));
    };

    const toggleForm = () => {
        setIsLoggingIn((prevState) => !prevState);
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setDisplayedPassword('');
        setShowPasswordRepeat(false);
        setShowPasswordLabel(true);
        setKeyboardKey((prev) => prev + 1);
    };

    const isButtonDisabled = () => {
        const { isValid } = validateUsername(username);
        if (!isValid) return true;

        if (isLoggingIn) {
            return password.length !== 4;
        } else {
            return password.length !== 4 || passwordRepeat.length !== 4 || password !== passwordRepeat;
        }
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { isValid, cleanedUsername, errors } = validateUsername(username);
        
        if (!isValid) {
            setUsernameError(errors[0]);
            return;
        }

        setUsername(cleanedUsername);
        
        if (!isButtonDisabled()) {
            // Login scenario
            if (isLoggingIn) {
                if (currentUser && currentUser.username.toLowerCase() === cleanedUsername.toLowerCase()) {
                    if (currentUser.password === password) {
                        setShowBusinessSelector(true);
                        return;
                    }
                }
                try {
                    const response = await axiosInstance.post('/login/check', {
                        name_user: cleanedUsername,
                        pass_user: password // Send actual password, not masked version
                    });

                    // console.log('Login response:', response.data);

                    if (response.data.error) {
                        setUsernameError(response.data.error);
                        return;
                    }

                    const userData = {
                        username: response.data.data.name_user,
                        password: password, // Store actual password
                        userType: response.data.data.type_user,
                        id: response.data.data.id_user
                    };

                    login(userData);
                    setShowBusinessSelector(true);
                } catch (error) {
                    console.error('Login error:', error);
                    setUsernameError('Error de inicio de sesión');
                }
            } 
            // Registration scenario
            else {
                if (currentUser) {
                    setUsernameError('Ya existe un usuario registrado. Cierre sesión primero.');
                    return;
                }
                try {
                    // Make sure all required fields are present
                    const registrationData = {
                        name_user: cleanedUsername,
                        pass_user: password,
                        type_user: userType,
                        location_user: '' // You might want to add this as a field in your form
                    };
                    console.log('Sending registration data:', registrationData);
                    const response = await axiosInstance.post('/register/new', registrationData);
                    console.log('Registration response:', response.data);
                    if (response.data.error) {
                        setUsernameError(response.data.error);
                        return;
                    }
                    // Make sure the response contains the expected data
                    if (!response.data.data || !response.data.data.id_user) {
                        throw new Error('Invalid response from server');
                    }
                    const userData = {
                        username: cleanedUsername,
                        password: password,
                        userType: userType,
                        id: response.data.data.id_user
                    };
                    // Log the user in automatically after successful registration
                    login(userData);
                    setShowBusinessSelector(true);
                } catch (error) {
                    console.error('Registration error:', error);
                    setUsernameError(
                        error.response?.data?.error || 
                        'Error en el registro. Por favor intente nuevamente.'
                    );
                }
            }
        }
    };

    const handleBusinessSelect = (businessType) => {
        console.log('Selected business:', businessType);
    };

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };

    return {
        handlePasswordComplete,
        handleClear,
        handlePasswordChange,
        handleRepeatPasswordChange,
        isButtonDisabled,
        toggleForm,
        handleBusinessSelect,
        handleFormSubmit,
        handleUserTypeChange,
        handleUsernameChange,
        usernameError
    };
};