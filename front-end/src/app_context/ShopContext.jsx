import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import axiosInstance from '../utils/app/axiosConfig.js';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setShowShopManagement } = useUI();
  
  // Shop state
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [showShopCreationForm, setShowShopCreationForm] = useState(false);
  
  //update: Removed static shopTypes and now will store from database
  const [shopTypes, setShopTypes] = useState([]);
  const [shopType, setShopType] = useState('');
  const [selectedShopType, setSelectedShopType] = useState(null);
  
  const [shouldExitShopForm, setShouldExitShopForm] = useState(false);
  
  const [newShop, setNewShop] = useState({
    name_shop: '',
    //update: Changed to use id_type and id_subtype instead of strings
    id_type: '',
    id_subtype: '',
    location_shop: '',
    id_user: '',
    calification_shop: 0, 
    image_shop: '',
    morning_open: '00:00',
    morning_close: '00:00',
    afternoon_open: '00:00',
    afternoon_close: '00:00',
    has_delivery: false,
    open_monday: true,
    open_tuesday: true,
    open_wednesday: true,
    open_thursday: true,
    open_friday: true,
    open_saturday: true,
    open_sunday: false
  });
  
  //update: Now will be populated from database
  const [shopTypesAndSubtypes, setShopTypesAndSubtypes] = useState({});
  
  //update: Add loading state for types
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(null);

  //update: Fetch types and subtypes from API when component mounts
  useEffect(() => {
    fetchTypesAndSubtypes();
  }, []);

  //update: Function to fetch types and subtypes from API
  const fetchTypesAndSubtypes = async () => {
    try {
      setTypesLoading(true);
      setTypesError(null);
      
      // Fetch types with their subtypes
      const response = await axiosInstance.get('/type/with-subtypes');
      
      if (response.data && !response.data.error) {
        const typesData = response.data.data;
        
        // Transform the data into the format expected by the frontend
        // The API returns an object like: { "Artesanía": ["Accesorios", "Cuero", ...], ... }
        setShopTypesAndSubtypes(typesData);
        
        // Extract just the type names for the shopTypes array
        const typeNames = Object.keys(typesData);
        setShopTypes(typeNames);
        
        console.log('Types and subtypes loaded:', typesData);
      } else {
        console.error('Error loading types:', response.data.error);
        setTypesError(response.data.error);
      }
    } catch (error) {
      console.error('Error fetching types and subtypes:', error);
      setTypesError('Error al cargar los tipos de comercio');
    } finally {
      setTypesLoading(false);
    }
  };

  // Update shop management visibility based on user type
  const updateShopManagementVisibility = () => {
    if (currentUser?.type_user === 'seller') {
      console.log('User is seller, showing shop management UI');
      setShowShopManagement(true);
    } else {
      console.log('User is not seller, showing regular UI');
      setShowShopManagement(false);
    }
  };

  // Add animation control functions
  const startFormExitAnimation = () => {
    // Set the flag to start exit animation
    setShouldExitShopForm(true);
    
    // Return a promise that resolves when animation should be complete
    return new Promise(resolve => {
      setTimeout(() => {
        // Reset flag after animation duration
        setShouldExitShopForm(false);
        resolve();
      }, 500); // Duration should match animation time in component
    });
  };
  
  // Function to close shop form with animation
  const closeShopFormWithAnimation = async () => {
    await startFormExitAnimation();
    setShowShopCreationForm(false);
    setSelectedShop(null);
  };

  const value = {
    shops, setShops,
    selectedShop, setSelectedShop,
    isAddingShop, setIsAddingShop,
    showShopCreationForm, setShowShopCreationForm,
    shopTypes, setShopTypes,
    shopType, setShopType,
    selectedShopType, setSelectedShopType,
    newShop, setNewShop,
    shopTypesAndSubtypes, setShopTypesAndSubtypes,
    updateShopManagementVisibility,
    shouldExitShopForm,
    startFormExitAnimation,
    closeShopFormWithAnimation,
    //update: Add new properties for types loading state
    typesLoading,
    typesError,
    fetchTypesAndSubtypes
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export default ShopContext;