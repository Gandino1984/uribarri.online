import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useUsernameValidation } from '../../utils/user/useUsernameValidation.jsx';
import { useIPValidation } from '../../utils/user/useIpValidation.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

export const LoginRegisterUtils = () => {
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

  const {
    setError,
    setSuccess,
    setShowInfoCard,
    setShowShopManagement,
    setShowShopStore,
    selectedShopForStore,
    setShowShopWindow,
    setInfo,
    setShowInfoManagement,
    //update: Get navigation functions for better handling
    setShowShopsListBySeller,
    setShowRiderManagement,
    setShowLandingPage,
    navigationIntent,
    setNavigationIntent
  } = useUI();

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
      console.log('=== LOGIN RESPONSE HANDLER START ===');
      console.log('Login response:', response);
      
      if (!response.data) {
        console.error('No response data received');
        setError(prevError => ({ ...prevError, databaseResponseError: "No se recibió respuesta del servidor en el login" }));
        throw new Error('Login - No se recibió respuesta del servidor en el login');
      }
  
      if (response.data.error) {
        if (response.data.needsVerification) {
          setError(prevError => ({ 
            ...prevError, 
            userError: response.data.error 
          }));
          return;
        }
        setError(prevError => ({ ...prevError, databaseResponseError: "Error en el login" }));
        throw new Error(response.data.error);
      }
  
      const userData = response.data.data;
      console.log('User data:', userData);
      console.log('-> handleLoginResponse() - userData = ', userData);
      console.log('-> handleLoginResponse() - is_manager from response = ', userData.is_manager);
  
      if (!userData || !userData.id_user || !userData.name_user || !userData.type_user) {
        setError(prevError => ({ ...prevError, userError: "Error en el login: datos de usuario incompletos o inválidos" }));
        clearUserSession();
        throw new Error('Datos de usuario incompletos o inválidos');
      }
  
      setUserType(userData.type_user);
      console.log('Setting user type to:', userData.type_user);
  
      const normalizedUserData = {
        id_user: userData.id_user, 
        name_user: userData.name_user,
        email_user: userData.email_user,   
        type_user: userData.type_user,   
        location_user: userData.location_user, 
        image_user: userData.image_user, 
        contributor_user: userData.contributor_user,
        email_verified: userData.email_verified,
        is_manager: userData.is_manager,
        age_user: userData.age_user,
        calification_user: userData.calification_user
      };
      
      console.log('-> handleLoginResponse() - normalizedUserData being passed to login:', normalizedUserData);
  
      await login(normalizedUserData);
  
      const userType = userData.type_user;
      
      //update: Read navigation intent directly from localStorage
      const storedIntent = localStorage.getItem('navigationIntent');
      console.log('=== NAVIGATION INTENT DEBUG ===');
      console.log('navigationIntent from context:', navigationIntent);
      console.log('navigationIntent from localStorage:', storedIntent);
      console.log('userType:', userType);
      console.log('selectedShopForStore:', selectedShopForStore);
      console.log('=== END DEBUG ===');
      
      //update: PRIORITY 1 - Check if there's a selected shop for store (user was browsing publicly)
      if (selectedShopForStore && userType === 'user') {
        console.log('✓✓✓ SELECTED SHOP EXISTS - Redirecting to ShopStore for:', selectedShopForStore.name_shop);
        setShowShopStore(true);
        setShowShopWindow(false);
        setShowShopManagement(false);
        setShowInfoManagement(false);
        setShowShopsListBySeller(false);
        setShowRiderManagement(false);
        setShowLandingPage(false);
        
        // Clear navigation intent
        setNavigationIntent(null);
        localStorage.removeItem('navigationIntent');
        
        console.log('=== LOGIN RESPONSE HANDLER END (SHOP STORE route) ===');
        return;
      }
      
      //update: PRIORITY 2 - Handle 'info' navigation intent
      if (storedIntent === 'info') {
        console.log('✓✓✓ NAVIGATION INTENT IS INFO - Showing InfoManagement for all user types');
        
        setShowInfoManagement(true);
        setShowShopManagement(false);
        setShowShopWindow(false);
        setShowShopStore(false);
        setShowShopsListBySeller(false);
        setShowRiderManagement(false);
        setShowLandingPage(false);
        
        // Clear the navigation intent
        setNavigationIntent(null);
        localStorage.removeItem('navigationIntent');
        
        console.log('=== LOGIN RESPONSE HANDLER END (INFO route) ===');
        return;
      }
      
      //update: PRIORITY 3 - Handle 'shop' navigation intent OR default user-type routing
      if (storedIntent === 'shop' || !storedIntent) {
        console.log('✓✓✓ SHOP INTENT OR DEFAULT - Routing based on user type');
        
        if (userType === 'seller') {
          console.log('User is seller, loading shops list view');
          setShowShopManagement(true);
          setShowInfoManagement(false);
          setShowShopWindow(false);
          setShowShopsListBySeller(true);
          setShowRiderManagement(false);
          setShowLandingPage(false);
          
          try {
            const shopsResponse = await axiosInstance.post('/shop/by-user-id', {
              id_user: userData.id_user
            });
            
            const userShops = shopsResponse.data.data || [];
            setShops(userShops);
            setIsAddingShop(false);
            setShowShopCreationForm(false);
          } catch (err) {
            console.warn('-> handleLoginResponse() - Error fetching seller shops:', err);
            setIsAddingShop(false);
            setShowShopCreationForm(false);
          }
        } else if (userType === 'user') {
          console.log('User is regular user type - showing ShopWindow');
          setShowShopWindow(true);
          setShowShopManagement(false);
          setShowInfoManagement(false);
          setShowShopsListBySeller(false);
          setShowRiderManagement(false);
          setShowShopCreationForm(false);
          setShowLandingPage(false);
        } else if (userType === 'rider') {
          console.log('User is rider type, showing rider management');
          setShowShopManagement(true);
          setShowShopWindow(false);
          setShowInfoManagement(false);
          setShowShopsListBySeller(false);
          setShowShopCreationForm(false);
          setShowRiderManagement(true);
          setShowLandingPage(false);
        } else {
          console.log('User type not recognized, showing default view');
          setShowShopManagement(true);
          setShowInfoManagement(false);
          setShowShopCreationForm(false);
          setShowShopsListBySeller(false);
          setShowRiderManagement(false);
          setShowLandingPage(false);
        }
        
        // Clear the navigation intent
        setNavigationIntent(null);
        localStorage.removeItem('navigationIntent');
        
        console.log('=== LOGIN RESPONSE HANDLER END (SHOP/DEFAULT route) ===');
        return;
      }
      
      console.log('=== LOGIN RESPONSE HANDLER END ===');
    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleLoginResponse() - Error = ', err);
    }  
  };

  const handleLogin = async (cleanedUsername, password) => {
    try {
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

      console.log('-> LoginRegisterUtils.jsx - handleLogin() - Tipo de usuari@ extraido de la DB = ', type);
      
      setUserType(type);

      const loginResponse = await axiosInstance.post('/user/login', {
        name_user: cleanedUsername,
        pass_user: password,
        type_user: type
      });

      console.log('-> handleLogin() - /user/login response = ', loginResponse);

      if (loginResponse.data.error) {
        if (loginResponse.data.needsVerification) {
          setError(prevError => ({ 
            ...prevError, 
            userError: loginResponse.data.error 
          }));
          return;
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
  
      console.log('Registration successful. User must verify email before logging in.');
      
      clearUserSession();
      setIsLoggingIn(true);
      
      setSuccess(prevSuccess => ({ 
        ...prevSuccess, 
        registrationSuccess: "¡Registro exitoso! Por favor revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión." 
      }));
      
      setInfo(prevInfo => ({
        ...prevInfo,
        verificationPending: `Hemos enviado un correo de verificación a ${userData.email_user}. Por favor verifica tu cuenta antes de iniciar sesión.`
      }));
      setShowInfoCard(true);
      
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
  
      const { isValid, cleanedUsername, errors } = validateUsername(name_user);

      if (!isValid) {
        console.error('-> LoginRegisterUtils.jsx - handleFormSubmit() - Error en el Nombre de usuari@');
        setError(prevError => ({ ...prevError, userError: "Error en el Nombre de usuari@" }));
        return;
      }
  
      if (isButtonDisabled()) {
        return;
      }
  
      if (!isLoggingIn && currentUser?.id_user) {
        console.error('LoginRegisterUtils.jsx - handleFormSubmit() -> Ya existe un usuario registrado con ese nombre.');
        setError(prevError => ({ ...prevError, userError: 'Ya existe un usuario registrado con ese nombre.' }));
        return;
      }
  
      if (isLoggingIn) {
        console.log('-> Iniciando sesión', { cleanedUsername, type_user });
        await handleLogin(cleanedUsername, password);
      } else {
        console.log('-> Registrando usuario', { cleanedUsername, type_user, email_user });
        await handleRegistration(cleanedUsername, password, type_user, location_user, email_user);
      }
    } catch (err) {
      console.error('-> LoginRegisterUtils.jsx - handleFormSubmit() - Error al registrar o iniciar sesión:', err);
      
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