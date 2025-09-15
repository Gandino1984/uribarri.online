import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => { 
    const storedUserData = localStorage.getItem('currentUser');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('AuthProvider - Parsed stored user data:', parsedData);
        
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
        
        // Include image_user and email_user in the state
        return {
          ...parsedData,
          image_user: parsedData.image_user || null,
          //update: Added email_user from stored data
          email_user: parsedData.email_user || null
        };
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        return null;
      }
    }
    return null;
  });
  
  const [isLoggingIn, setIsLoggingIn] = useState(() => !currentUser);
  const [name_user, setNameUser] = useState(() => currentUser?.name_user || '');
  //update: Added email_user state
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
    const storedUserData = localStorage.getItem('currentUser');
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        const currentTime = new Date().getTime();
        const NINE_DAYS_IN_MS = 9 * 24 * 60 * 60 * 1000;
  
        if (currentTime - parsedData.timestamp > NINE_DAYS_IN_MS) {
          // Clear both localStorage and state if 9 days have passed
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          // Set the parsed user data if not expired
          setCurrentUser(parsedData);
          // Also update other relevant user states
          setNameUser(parsedData.name_user || '');
          //update: Set email from stored data
          setEmailUser(parsedData.email_user || '');
          setUserType(parsedData.type_user || '');
          setLocationUser(parsedData.location_user || '');
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  const login = async (userData) => {
    console.log('Incoming userData for login:', userData);
  
    // First, ensure user type is set immediately for component routing decisions
    console.log('Setting user type in login function:', userData.type_user);
    setUserType(userData.type_user);

    // Remove the password field but keep all other original data
    const { pass_user, ...userWithoutPassword } = userData;
    
    // Create the user state object with correct property mappings
    const userStateData = {
      id_user: userData.id_user,            
      name_user: userData.name_user,
      //update: Added email_user to user state
      email_user: userData.email_user,   
      type_user: userData.type_user,   
      location: userData.location_user, 
      image_user: userData.image_user, 
      contributor_user: userData.contributor_user, 
    };
    
    // Create timestamp data for localStorage
    const userDataWithTimestamp = {
      ...userWithoutPassword, // Keep all original fields
      timestamp: new Date().getTime()
    };
  
    // Store complete user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userDataWithTimestamp));
    
    // Update state with verified data
    console.log('Setting currentUser to:', userStateData);
    setCurrentUser(userStateData);
    setNameUser(userData.name_user);
    //update: Set email after login
    setEmailUser(userData.email_user);
    setIsLoggingIn(false);
    
    // Return a promise to ensure state updates are completed
    return new Promise(resolve => {
      setTimeout(() => {
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
    //update: Clear email
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
    checkAndClearUserData();
  }, []);

  const value = {
    currentUser, setCurrentUser,
    isLoggingIn, setIsLoggingIn,
    name_user, setNameUser,
    //update: Added email_user to context value
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