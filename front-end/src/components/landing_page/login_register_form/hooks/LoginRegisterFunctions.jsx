import { useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { useUsernameValidation } from './useUsernameValidation.jsx';
import { useIPValidation } from './useIpValidation.jsx';
import axiosInstance from '../../../../../utils/axiosConfig.js';

export const LoginRegisterFunctions = () => {
  const {
    isLoggingIn, setIsLoggingIn, username, 
    setUsername, password, setPassword,
    passwordRepeat, showPasswordRepeat, setPasswordRepeat,
    setShowPasswordRepeat, setShowPasswordLabel, 
    setKeyboardKey, setshowShopManagement, 
    setDisplayedPassword, userType, 
    setUserType, currentUser, 
    login, logout, setIsAddingShop, 
    setShops,
    userlocation, setUserlocation, setUserTypeError,
    setUsernameError,
    setIpError,
    setPasswordError,
    setUserlocationError,
    setShowRepeatPasswordMessage
  } = useContext(AppContext);


    const { validateUsername } = useUsernameValidation();

    const { validateIPRegistration } = useIPValidation();


    const handleUsernameChange = (e) => {
        const rawUsername = e.target.value;
        console.log('-> LOGIN: Username rawValue= ', rawUsername);
        setUsername(rawUsername);
        // setUsernameError('');
      };
    
      const handleUserLocationChange = (ev) => {
      const location = ev.target.value;
      console.log('-> REGISTER: userlocation value= ', location);
      setUserlocation(location);
      // setUserlocationError('');
    };

    const handlePasswordComplete = (isLogin) => () => {
      if (!isLogin) {
        setDisplayedPassword('');
        setShowPasswordRepeat(true);
        setShowRepeatPasswordMessage(true);
        setKeyboardKey((prev) => prev + 1);
      } else {
        setShowPasswordLabel(false);
      }
    };


    const handlePasswordChange = (isLogin, newPassword) => {
      if (!isLogin && showPasswordRepeat) {
        setPasswordRepeat(newPassword);
        setDisplayedPassword('*'.repeat(newPassword.length));
        setShowRepeatPasswordMessage(newPassword.length < 4);
      } else {
        setPassword(newPassword);
        setDisplayedPassword('*'.repeat(newPassword.length));
        if (isLogin && newPassword.length !== 4) {
          setShowPasswordLabel(true);
        }
      }
    };


    const handleRepeatPasswordChange = (newPassword) => {
      setPasswordRepeat(newPassword);
      setDisplayedPassword('*'.repeat(newPassword.length));
      
      // Update message visibility based on password completion
      if (newPassword.length === 4) {
        setShowRepeatPasswordMessage(false);
      } else {
        setShowRepeatPasswordMessage(true);
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
      setIsLoggingIn(true);
      setshowShopManagement(false);
      setUserType('');
      setUsernameError('');
      setIpError(''),
      setPasswordError(''),
      setUserlocationError(''),
      setShowPasswordRepeat(false);
  };


  const toggleForm = () => {
    setIsLoggingIn(prev => !prev);
    if (!isLoggingIn) {
      clearUserSession();
      setPassword('');
      setPasswordRepeat('');
      setShowPasswordRepeat(false);
      setShowRepeatPasswordMessage(false);
      setUserType('');
    }
  };

    const handleUserTypeChange = (e) => {
      setUserType(e.target.value);
      if(userType) {
          setIsLoggingIn(false);
      }else{
        setUserTypeError('Tipo de usuario no seleccionado');
      }
  };


  const handleLoginResponse = async (response) => {
      if (!response.data) {
          console.log('-> handleLoginResponse() - No se recibió respuesta del servidor en el login');
          throw new Error('Login - No se recibió respuesta del servidor en el login');
      }

      if (response.data.error) {
          console.log('-> handleLoginResponse() - Error en el login:', response.data.error);
          throw new Error(response.data.error);
      }

      const userData = response.data.data;

      console.log('-> handleLoginResponse() - userData = ', userData);

      // check the database response in depth
      if (!userData || !userData.id_user || !userData.name_user || !userData.type_user) {
          console.log('-> handleLoginResponse() - Datos de usuario incompletos o inválidos');
          clearUserSession();
          throw new Error('Datos de usuario incompletos o inválidos');
      }

      setUserType(userData.type_user);

      // Normalize user data structure using the server-provided user type
      const normalizedUserData = {
        id: userData.id_user, 
        username: userData.name_user,
        password: password,
        userType: userData.type_user 
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
              console.error('-> handleLoginResponse() - El usuario no tiene tiendas:', error);
              console.log('-> handleLoginResponse() - Renderizando el formulario para crear tienda');
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
          id: userData.id_user,
          username: userData.name_user,
          password: password,
          userType: userType,
      };

      login(normalizedUserData);
      
      setshowShopManagement(true); 
  };


  const handleLogin = async (cleanedUsername, password) => {
      try {
        // Fetch user details first
        const userDetailsResponse = await axiosInstance.post('/user/details', {
          name_user: cleanedUsername
        });

        if (!userDetailsResponse.data.data) {
          setUsernameError('Nombre de usuario no encontrado');
          return;
        }

        const type = userDetailsResponse.data.data.type_user;

       
        if (!type) {
          setUsernameError('Tipo de usuario no encontrado');
          console.error('User type not found for username:', cleanedUsername);
          return;
        }

        // Explicitly set user type in context before login
        console.log('Login: Tipo de usuario extraido de los detalles del usuario en la DB = ', type);
        
        setUserType(type);

        console.log( '-> UserType actualizado en el contexto de la App');

        // Proceed with login using the obtained user type
        const loginResponse = await axiosInstance.post('/user/login', {
          name_user: cleanedUsername,
          pass_user: password,
          type_user: type
        });

        console.log('-> handleLogin() - /user/login response = ', loginResponse);

        // Check if the login was successful
        if (loginResponse.data.error) {
          setPasswordError('Nombre de usuario o contraseña incorrectos');
          return;
        }

        await handleLoginResponse(loginResponse);

      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        if (errorMessage.includes('username')) {
          setUsernameError('Nombre de usuario no encontrado');
        } else {
          setUsernameError('Nombre de usuario o contraseña incorrectos');
        }
      }
    };

  const handleRegistration = async (cleanedUsername, password, userType, userLocation) => {
      const registrationData = {
          name_user: cleanedUsername,
          pass_user: password,
          type_user: userType,
          location_user: userLocation
      };

      const response = await axiosInstance.post('/user/register', registrationData);
      
      console.log('-> LoginRegisterFunctions.jsx - handleRegistration() - /user/register response = ', response);

      await handleRegistrationResponse(response);

      // Reset key states after successful registration
      setPassword('');
      setPasswordRepeat('');
      setDisplayedPassword('');
      setShowPasswordRepeat(false);
      setUserType('');

      toggleForm();
  };
    

  const handleFormSubmit = async (e) => {
      e.preventDefault();
      try {
      
        console.log('-> handleFormSubmit() - isLoggingIn:', isLoggingIn);
        // IP validation for registration only
        if (!isLoggingIn) {
          console.log('************************************');
          console.log('-> handleFormSubmit() - Validación de IP para registro');
          const canRegister = await validateIPRegistration();
          if (!canRegister) {
            console.log('Validación de IP fallida. No se permite el registro.');
            return;
          }
        }
    
        // Username validation
        const { isValid, cleanedUsername, errors } = validateUsername(username);

        if (!isValid) {
          console.log('Error en el nombre de usuario:', errors[0]);
          setError(errors[0]);
          return;
        }
    
        // Form validation
        if (isButtonDisabled()) {
          return;
        }
    
        // Check for existing session
        if (!isLoggingIn && currentUser?.id) {
          console.log('-> Ya existe un usuario registrado con ese nombre.');
          setUsernameError('Ya existe un usuario registrado con ese nombre.');
          return;
        }
    
        ///////// Handle login or registration /////////

        if (isLoggingIn) {
          console.log('-> Iniciando sesión', { cleanedUsername, userType });

          await handleLogin(cleanedUsername, password);
        
        } else {
          console.log('-> Registrando usuario', { cleanedUsername, userType });

          await handleRegistration(cleanedUsername, password, userType, userlocation);
          
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

    const isButtonDisabled = () => {
        const { isValid } = validateUsername(username);

        if (!isValid) return true;

        if (isLoggingIn) {
          return password.length !== 4;
        } else {
        // For registration, require a 4-digit password, matching password repeat, and a selected user type
        return password.length !== 4 || 
                passwordRepeat.length !== 4 || 
                password !== passwordRepeat || 
                userType === '';
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
        handleUserLocationChange,
        clearUserSession,
    };
};