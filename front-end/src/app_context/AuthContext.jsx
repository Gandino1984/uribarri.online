// front-end/src/app_context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

//update: Enhanced boolean converter with detailed logging
const convertToBoolean = (value) => {
  console.log('convertToBoolean called with:', value, 'type:', typeof value);
  // Handle all possible truthy values from database
  if (value === true || value === 1 || value === '1' || value === 'true') {
    console.log('convertToBoolean returning true');
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false' || value === null || value === undefined) {
    console.log('convertToBoolean returning false');
    return false;
  }
  // Log unexpected values
  console.warn('convertToBoolean received unexpected value:', value);
  return false;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => { 
    const storedUserData = localStorage.getItem('currentUser');
    console.log('=== INITIAL STATE SETUP ===');
    console.log('Raw localStorage data:', storedUserData);
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed localStorage data:', parsedData);
        console.log('is_manager from localStorage:', parsedData.is_manager);
        
        // Only remove if critically invalid
        if (!parsedData || typeof parsedData !== 'object') {
          console.error('Critical: Invalid user data structure');
          localStorage.removeItem('currentUser');
          return null;
        }
        
        // Log warning but don't remove if just missing name_user
        if (!parsedData.name_user) {
          console.warn('Warning: User data missing name_user field');
        }
        
        //update: Check if email is verified before allowing session restore
        if (parsedData.email_verified === false || parsedData.email_verified === 0) {
          console.warn('Stored user has unverified email, clearing session');
          localStorage.removeItem('currentUser');
          return null;
        }
        
        //update: Log is_manager conversion for debugging
        const convertedIsManager = convertToBoolean(parsedData.is_manager);
        console.log('Initial state - converted is_manager:', convertedIsManager);
        
        //update: Convert all boolean fields properly on initial load
        const initialUser = {
          ...parsedData,
          image_user: parsedData.image_user || null,
          email_user: parsedData.email_user || null,
          email_verified: convertToBoolean(parsedData.email_verified),
          is_manager: convertedIsManager,
          contributor_user: convertToBoolean(parsedData.contributor_user)
        };
        
        console.log('Initial user state:', initialUser);
        console.log('=== END INITIAL STATE SETUP ===');
        return initialUser;
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        return null;
      }
    }
    console.log('No stored user data found');
    console.log('=== END INITIAL STATE SETUP ===');
    return null;
  });
  
  const [isLoggingIn, setIsLoggingIn] = useState(() => !currentUser);
  const [name_user, setNameUser] = useState(() => currentUser?.name_user || '');
  const [email_user, setEmailUser] = useState(() => currentUser?.email_user || '');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordIcons, setPasswordIcons] = useState([]);
  const [type_user, setUserType] = useState(() => currentUser?.type_user || '');
  const [location_user, setLocationUser] = useState(() => currentUser?.location_user || '');
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [showPasswordLabel, setShowPasswordLabel] = useState(true);
  const [keyboardKey, setKeyboardKey] = useState(0);
  const [onPasswordComplete, setOnPasswordComplete] = useState(null);
  const [onClear, setOnClear] = useState(null);
  const [displayedPassword, setDisplayedPassword] = useState('');
  const [showRepeatPasswordMessage, setShowRepeatPasswordMessage] = useState(false);
  const MAX_PASSWORD_LENGTH = 4;

  const checkAndClearUserData = () => {
    console.log('=== checkAndClearUserData CALLED ===');
    const storedUserData = localStorage.getItem('currentUser');
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('checkAndClearUserData - parsed data:', parsedData);
        const currentTime = new Date().getTime();
        const NINE_DAYS_IN_MS = 9 * 24 * 60 * 60 * 1000;
  
        if (currentTime - parsedData.timestamp > NINE_DAYS_IN_MS) {
          // Clear both localStorage and state if 9 days have passed
          console.log('Session expired, clearing localStorage');
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          //update: Check email verification status before setting user
          if (parsedData.email_verified === false || parsedData.email_verified === 0) {
            console.log('User email not verified, clearing stored session');
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          } else {
            //update: Enhanced is_manager conversion logging
            console.log('checkAndClearUserData - is_manager from storage:', parsedData.is_manager);
            const convertedIsManager = convertToBoolean(parsedData.is_manager);
            console.log('checkAndClearUserData - converted is_manager:', convertedIsManager);
            
            //update: Convert boolean fields when checking stored data
            const updatedUser = {
              ...parsedData,
              email_verified: convertToBoolean(parsedData.email_verified),
              is_manager: convertedIsManager,
              contributor_user: convertToBoolean(parsedData.contributor_user)
            };
            
            console.log('checkAndClearUserData - setting currentUser to:', updatedUser);
            setCurrentUser(updatedUser);
            // Also update other relevant user states
            setNameUser(parsedData.name_user || '');
            setEmailUser(parsedData.email_user || '');
            setUserType(parsedData.type_user || '');
            setLocationUser(parsedData.location_user || '');
          }
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } else {
      console.log('No stored user data found');
      setCurrentUser(null);
    }
    console.log('=== checkAndClearUserData END ===');
  };

  const login = async (userData) => {
    console.log('=== LOGIN FUNCTION CALLED ===');
    console.log('Incoming userData for login:', userData);
    
    //update: Very detailed debugging for is_manager
    console.log('LOGIN DEBUG:');
    console.log('1. Full userData object:', JSON.stringify(userData));
    console.log('2. userData.is_manager raw:', userData.is_manager);
    console.log('3. typeof userData.is_manager:', typeof userData.is_manager);
    console.log('4. userData keys:', Object.keys(userData));
    
    //update: Check if is_manager exists in the userData
    if (!userData.hasOwnProperty('is_manager')) {
      console.error('WARNING: is_manager field is MISSING from userData!');
    }
    
    //update: Verify email is verified before allowing login
    if (userData.email_verified === false || userData.email_verified === 0) {
      console.error('Attempting to login with unverified email - blocking');
      return Promise.reject(new Error('Email not verified'));
    }
  
    // First, ensure user type is set immediately for component routing decisions
    console.log('Setting user type in login function:', userData.type_user);
    setUserType(userData.type_user);

    // Remove the password field but keep all other original data
    const { pass_user, ...userWithoutPassword } = userData;
    
    //update: Apply boolean conversion with enhanced logging
    const convertedIsManager = convertToBoolean(userData.is_manager);
    console.log('5. convertToBoolean(userData.is_manager) result:', convertedIsManager);
    
    //update: Convert database integer/boolean values properly for state
    const userStateData = {
      id_user: userData.id_user,            
      name_user: userData.name_user,
      email_user: userData.email_user,   
      type_user: userData.type_user,   
      location_user: userData.location_user, 
      image_user: userData.image_user, 
      contributor_user: convertToBoolean(userData.contributor_user),
      email_verified: convertToBoolean(userData.email_verified),
      is_manager: convertedIsManager,
      age_user: userData.age_user,
      calification_user: userData.calification_user
    };
    
    console.log('6. Final userStateData:', JSON.stringify(userStateData));
    console.log('7. userStateData.is_manager final:', userStateData.is_manager);
    
    //update: Store in localStorage with is_manager as boolean
    const userDataWithTimestamp = {
      ...userWithoutPassword,
      is_manager: convertedIsManager, // Store as boolean in localStorage
      timestamp: new Date().getTime()
    };
    
    console.log('8. Storing in localStorage:', JSON.stringify(userDataWithTimestamp));
  
    // Store complete user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userDataWithTimestamp));
    
    // Verify what was actually stored
    const verifyStored = localStorage.getItem('currentUser');
    console.log('9. Verification - actually stored in localStorage:', verifyStored);
    
    // Update state with converted boolean values
    console.log('10. Setting currentUser state to:', userStateData);
    setCurrentUser(userStateData);
    setNameUser(userData.name_user);
    setEmailUser(userData.email_user);
    setIsLoggingIn(false);
    
    console.log('=== LOGIN FUNCTION END ===');
    
    // Return a promise to ensure state updates are completed
    return new Promise(resolve => {
      setTimeout(() => {
        // Log the state after update
        console.log('=== POST-LOGIN STATE CHECK ===');
        console.log('After login, currentUser should be:', userStateData);
        resolve();
      }, 0);
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggingIn(true);
  };

  const clearUserSession = () => {
    setNameUser('');
    setEmailUser('');
    setPassword('');
    setPasswordRepeat('');
    setLocationUser('');
    setDisplayedPassword('');
    setShowPasswordLabel(true);
    setKeyboardKey((prev) => prev + 1);
    setUserType('');
    setShowPasswordRepeat(false);
    setShowRepeatPasswordMessage(false);
  };

  // Effect to check user data on mount
  useEffect(() => {
    console.log('=== AuthProvider useEffect - checking user data on mount ===');
    checkAndClearUserData();
  }, []);

  // Debug effect to monitor currentUser changes
  useEffect(() => {
    console.log('=== currentUser state changed ===');
    console.log('New currentUser value:', currentUser);
    if (currentUser) {
      console.log('currentUser.is_manager:', currentUser.is_manager);
      console.log('typeof currentUser.is_manager:', typeof currentUser.is_manager);
    }
  }, [currentUser]);

  const value = {
    currentUser, setCurrentUser,
    isLoggingIn, setIsLoggingIn,
    name_user, setNameUser,
    email_user, setEmailUser,
    password, setPassword,
    passwordRepeat, setPasswordRepeat,
    passwordIcons, setPasswordIcons,
    type_user, setUserType,
    location_user, setLocationUser,
    showPasswordRepeat, setShowPasswordRepeat,
    showPasswordLabel, setShowPasswordLabel,
    keyboardKey, setKeyboardKey,
    onPasswordComplete, setOnPasswordComplete,
    onClear, setOnClear,
    displayedPassword, setDisplayedPassword,
    showRepeatPasswordMessage, setShowRepeatPasswordMessage,
    MAX_PASSWORD_LENGTH,
    login, logout,
    checkAndClearUserData,
    clearUserSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;