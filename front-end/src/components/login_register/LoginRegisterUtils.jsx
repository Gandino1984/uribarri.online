//update: Removed organization_manager/participant handling
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useUsernameValidation } from '../../utils/user/useUsernameValidation.jsx';
import { useIPValidation } from '../../utils/user/useIpValidation.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const LoginRegisterUtils = () => {
  // Authentication-related state and functions from AuthContext
  const {
    isLoggingIn, setIsLoggingIn,
    name_user, setNameUser,
    email_user, setEmailUser,
    password, setPassword,
    passwordRepeat, setPasswordRepeat,
    showPasswordRepeat, setShowPasswordRepeat,
    setShowPasswordLabel, setKeyboardKey,
    setDisplayedPassword, type_user, setUserType,
    currentUser, login, location_user, setLocationUser,
    setShowRepeatPasswordMessage, clearUserSession,
    setPasswordIcons,
  } = useAuth();

  // UI-related state and functions from UIContext
  const {
    setError,
    setSuccess,
    setShowInfoCard,
    setShowShopManagement,
    setShowShopStore,
    selectedShopForStore,
    setShowShopWindow,
    setInfo,
    setShowInfoManagement
  } = useUI();

  // Shop-related state and functions from ShopContext
  const {
    setIsAddingShop,
    setShops,
    setShopType,
    setSelectedShopType,
    setShowShopCreationForm,
  } = useShop();

  const { validateUsername } = useUsernameValidation();
  
  const { validateIPRegistration } = useIPValidation();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isButtonDisabled = () => {
    const { isValid } = validateUsername(name_user);

    if (!isValid) return true;

    if (isLoggingIn) {
      return password.length !== 4;
    } else {
      const isEmailValid = emailRegex.test(email_user);
      
      // For registration, require a valid email, 4-digit password, matching password repeat, and a selected user type
      return !isEmailValid ||
              password.length !== 4 || 
              passwordRepeat.length !== 4 || 
              password !== passwordRepeat || 
              type_user === '';
    }
  };

  const handleUsernameChange = (e) => {
    const rawUsername = e.target.value;
    setNameUser(rawUsername);
  };
  
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailUser(email);
  };
    
  const handleUserLocationChange = (e) => {
    const location = e.target.value;
    setLocationUser(location);
  };

  const handlePasswordComplete = (isLogin) => () => {
    if (!isLogin) {
      setDisplayedPassword('');
      setShowPasswordRepeat(true);
      setShowRepeatPasswordMessage(true);
      setShowInfoCard(true);
      setKeyboardKey((prev) => prev + 1);
    } else {
      setShowPasswordLabel(false);
    }
  };

  const handlePasswordChange = (isLogin, newPassword) => {
    const displayedPassword = '*'.repeat(newPassword.length);
    
    if (!isLogin && showPasswordRepeat) {
      setPasswordRepeat(newPassword);
      setShowRepeatPasswordMessage(newPassword.length < 4);
      setShowInfoCard(newPassword.length < 4);
    } else {
      setPassword(newPassword);
      if (isLogin && newPassword.length !== 4) {
        setShowPasswordLabel(true);
      }
    }
    
    setDisplayedPassword(displayedPassword);
  };

  const handleRepeatPasswordChange = (newPassword) => {
    setPasswordRepeat(newPassword);
    setDisplayedPassword('*'.repeat(newPassword.length));
    
    // Update message visibility based on password completion
    if (newPassword.length === 4) {
      setShowRepeatPasswordMessage(false);
      setShowInfoCard(false);
    } else {
      setShowRepeatPasswordMessage(true);
      setShowInfoCard(true);
    }
  };

  const toggleForm = () => {
    clearUserSession();
    setIsLoggingIn(prev => !prev);
    setPasswordIcons([]);    
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    if(type_user) {
      setIsLoggingIn(false);
    }
  };

  const handleLoginResponse = async (response) => {
    try {
      console.log('Login response:', response);
      if (!response.data) {
        console.error('No response data received');
        setError(prevError => ({ ...prevError, databaseResponseError: "No se recibió respuesta del servidor en el login" }));
        throw new Error('Login - No se recibió respuesta del servidor en el login');
      }
  
      if (response.data.error) {
        //update: Check if error is about email verification
        if (response.data.needsVerification) {
          setError(prevError => ({ 
            ...prevError, 
            userError: response.data.error 
          }));
          // Don't proceed with login
          return;
        }
        setError(prevError => ({ ...prevError, databaseResponseError: "Error en el login" }));
        throw new Error(response.data.error);
      }
  
      const userData = response.data.data;
      console.log('User data:', userData);
  
      console.log('-> handleLoginResponse() - userData = ', userData);
      //update: Log is_manager specifically
      console.log('-> handleLoginResponse() - is_manager from response = ', userData.is_manager);
  
      // check the database response in depth
      if (!userData || !userData.id_user || !userData.name_user || !userData.type_user) {
        setError(prevError => ({ ...prevError, userError: "Error en el login: datos de usuario incompletos o inválidos" }));
        clearUserSession();
        throw new Error('Datos de usuario incompletos o inválidos');
      }
  
      // Set user type first, before any other state updates
      setUserType(userData.type_user);
      console.log('Setting user type to:', userData.type_user);
  
      //update: Include ALL fields from userData including is_manager
      const normalizedUserData = {
        id_user: userData.id_user, 
        name_user: userData.name_user,
        email_user: userData.email_user,
        type_user: userData.type_user,
        location_user: userData.location_user,
        image_user: userData.image_user,
        contributor_user: userData.contributor_user,
        email_verified: userData.email_verified,
        is_manager: userData.is_manager, // CRITICAL: Include is_manager field
        age_user: userData.age_user,
        calification_user: userData.calification_user
      };
      
      //update: Log what we're passing to login
      console.log('-> handleLoginResponse() - normalizedUserData being passed to login:', normalizedUserData);
      console.log('-> handleLoginResponse() - is_manager in normalizedUserData:', normalizedUserData.is_manager);
  
      // Call login to setup user data
      await login(normalizedUserData);
  
      // Store the user type to avoid race conditions
      const userType = userData.type_user;
      
      //update: Simplified routing without organization_manager type
      if (userType === 'seller') {
        console.log('User is seller, loading shops list view');
        // For sellers, always show the shops list first
        setShowShopManagement(true);
        setShowInfoManagement(false);
        
        try {
          const shopsResponse = await axiosInstance.post('/shop/by-user-id', {
            id_user: userData.id_user
          });
          
          const userShops = shopsResponse.data.data || [];
          
          // Set shops regardless of count
          setShops(userShops);
          
          // Don't automatically show shop creation form
          setIsAddingShop(false);
          setShowShopCreationForm(false);
        } catch (err) {
          console.warn('-> handleLoginResponse() - Error fetching seller shops:', err);
          // Even on error, still show the shops list (which will be empty)
          setIsAddingShop(false);
          setShowShopCreationForm(false);
        }
      } else if (userType === 'user') {
        console.log('User is regular user type');
        
        // Check if there was a selected shop before login
        if (selectedShopForStore) {
          console.log('Redirecting to selected shop store:', selectedShopForStore.name_shop);
          setShowShopStore(true);
          setShowShopWindow(false);
          setShowShopManagement(false);
          setShowInfoManagement(false);
        } else {
          console.log('Showing shop window for user to browse shops');
          setShowShopWindow(true);
          setShowShopManagement(false);
          setShowInfoManagement(false);
        }
        
        setShowShopCreationForm(false);
      } else if (userType === 'rider') {
        console.log('User is rider type, showing rider management');
        setShowShopManagement(true);
        setShowShopWindow(false);
        setShowInfoManagement(false);
        setShowShopCreationForm(false);
      } else {
        console.log('User type not recognized, showing default view');
        // For other user types, show UserManagement
        setShowShopManagement(true);
        setShowInfoManagement(false);
        setShowShopCreationForm(false); // Ensure creation form is not shown
      }
    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleLoginResponse() - Error = ', err);
    }  
  };

// ... (keep the rest of the file the same)

  const handleLogin = async (cleanedUsername, password) => {
    try {
      // Fetch user details first
      const userDetailsResponse = await axiosInstance.post('/user/details', {
        name_user: cleanedUsername
      });

      console.log('User details response:', userDetailsResponse);

      if (userDetailsResponse.data.error || !userDetailsResponse.data.data) {
        setError(prevError => ({ ...prevError, databaseResponseError: "Error al iniciar sesión" }));
        throw new Error(userDetailsResponse.data.error);
      }

      const type = userDetailsResponse.data.data.type_user;

      if (!type) {
        console.error('-> LoginRegisterUtils.jsx - handleLogin() - User type not found for name_user = ', cleanedUsername);
        return;
      }

      // Explicitly set user type in context before login
      console.log('-> LoginRegisterUtils.jsx - handleLogin() - Tipo de usuari@ extraido de la DB = ', type);
      
      setUserType(type);

      // Proceed with login using the obtained user type
      const loginResponse = await axiosInstance.post('/user/login', {
        name_user: cleanedUsername,
        pass_user: password,
        type_user: type
      });

      console.log('-> handleLogin() - /user/login response = ', loginResponse);

      // Check if the login was successful
      if (loginResponse.data.error) {
        //update: Check if error is about email verification
        if (loginResponse.data.needsVerification) {
          setError(prevError => ({ 
            ...prevError, 
            userError: loginResponse.data.error 
          }));
          return; // Don't proceed with login
        }
        setError(prevError => ({ ...prevError, userError: "Error al iniciar sesión" }));
        return;
      } else {
        setSuccess(prevSuccess => ({ ...prevSuccess, loginSuccess: "Sesión iniciada" }));
      }

      await handleLoginResponse(loginResponse);

    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleLogin() - Error = ', err);
      setError(prevError => ({ 
        ...prevError, 
        databaseResponseError: "Error al iniciar sesión" 
      }));
    }
  };

  const handleRegistrationResponse = async (response) => {
    try {
      if (!response.data) {
        setError(prevError => ({ ...prevError, databaseResponseError: "No se recibió respuesta del servidor" }));
        throw new Error('No se recibió respuesta del servidor');
      }
      if (response.data.error) {
        setError(prevError => ({ ...prevError, databaseResponseError: "Error en el registro" }));
        throw new Error(response.data.error);
      }
  
      const userData = response.data.data;
      
      if (!userData || !userData.id_user) {
        setError(prevError => ({ ...prevError, userError: "Datos de usuario incompletos" }));
        throw new Error('Error en el registro: datos de usuario incompletos');
      }
  
      //update: DO NOT automatically log in the user after registration
      // Instead, show a message about email verification
      console.log('Registration successful. User must verify email before logging in.');
      
      // Clear the form but stay on the login screen
      clearUserSession();
      setIsLoggingIn(true); // Switch to login mode
      
      // Show success message with verification instructions
      setSuccess(prevSuccess => ({ 
        ...prevSuccess, 
        registrationSuccess: "Registro exitoso! Por favor revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión." 
      }));
      
      // Also set an info message that persists longer
      setInfo(prevInfo => ({
        ...prevInfo,
        verificationPending: `Hemos enviado un correo de verificación a ${userData.email_user}. Por favor verifica tu cuenta antes de iniciar sesión.`
      }));
      setShowInfoCard(true);
      
      // DO NOT call login() or set any user session data
      // DO NOT redirect to ShopManagement or any other authenticated view
      
    } catch (err) {
      console.error('-> handleRegistrationResponse() = ', err);
    }
  };

  const handleRegistration = async (cleanedUsername, password, type_user, userLocation, userEmail) => {
    try {    
      const registrationData = {
        name_user: cleanedUsername,
        pass_user: password,
        email_user: userEmail,
        type_user: type_user,
        location_user: userLocation,
        calification_user: 5 
      };
  
      const response = await axiosInstance.post('/user/register', registrationData);
      
      console.log('-> LoginRegisterUtils.jsx - handleRegistration() - /user/register response = ', response);
  
      await handleRegistrationResponse(response);
  
      // Reset key states after successful registration
      setPassword('');
      setPasswordRepeat('');
      setDisplayedPassword('');
      setShowPasswordRepeat(false);
      setUserType('');
  
    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleRegistration() - Error = ', err);
      setError(prevError => ({ ...prevError, userError: "Error al registrar el usuario" }));
    }     
  };
    
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('-> LoginRegisterUtils.jsx - handleFormSubmit() - isLoggingIn:', isLoggingIn);
      // IP validation for registration only
      if (!isLoggingIn) {
        console.log('************************************');
        console.log('-> LoginRegisterUtils.jsx - handleFormSubmit() - Validación de IP para registro');
        const canRegister = await validateIPRegistration();

        if (!canRegister) {
          setError(prevError => ({ ...prevError, ipError: "Demasiados registros." }));

          console.error('->LoginRegisterUtils.jsx - handleFormSubmit() - Validación de IP fallida. No se permite el registro.');
          return;
        }
        
        if (!emailRegex.test(email_user)) {
          setError(prevError => ({ ...prevError, emailError: "El formato del email no es válido" }));
          console.error('->LoginRegisterUtils.jsx - handleFormSubmit() - Email inválido');
          return;
        }
      }
  
      // Username validation
      const { isValid, cleanedUsername, errors } = validateUsername(name_user);

      if (!isValid) {
        console.error('-> LoginRegisterUtils.jsx - handleFormSubmit() - Error en el Nombre de usuari@');
        setError(prevError => ({ ...prevError, userError: "Error en el Nombre de usuari@" }));
        return;
      }
  
      // Form validation
      if (isButtonDisabled()) {
        return;
      }
  
      // Check for existing session
      if (!isLoggingIn && currentUser?.id_user) {
        console.error('LoginRegisterUtils.jsx - handleFormSubmit() -> Ya existe un usuario registrado con ese nombre.');
        setError(prevError => ({ ...prevError, userError: 'Ya existe un usuario registrado con ese nombre.' }));
        return;
      }
  
      ///////// Handle login or registration /////////

      if (isLoggingIn) {
        console.log('-> Iniciando sesión', { cleanedUsername, type_user });

        await handleLogin(cleanedUsername, password);
      
      } else {
        console.log('-> Registrando usuario', { cleanedUsername, type_user, email_user });

        await handleRegistration(cleanedUsername, password, type_user, location_user, email_user);
        
      }
    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleFormSubmit() - Error al registrar o iniciar sesión:', err);
      
      // Reset password fields on error
      setPassword('');
      setPasswordRepeat('');
      setDisplayedPassword('');
      setShowPasswordLabel(true);
      setKeyboardKey((prev) => prev + 1);
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
    handleEmailChange,
  };
};