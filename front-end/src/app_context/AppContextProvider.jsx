import { useState, useEffect } from 'react';
import AppContext from '../app_context/AppContext.js';

export const AppContextProvider = ({ children }) => {

  const [currentUser, setCurrentUser] = useState(() => { 
    const storedUserData = localStorage.getItem('currentUser');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('AppContextProvider - Parsed stored user data:', parsedData);
        
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
        
        // Include image_user in the state
        return {
          ...parsedData,
          image_user: parsedData.image_user || null // Ensure image_user is included
        };
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        return null;
      }
    }
    return null;
  });

  //initializes isLoggingIn with the negation of currentUser, 
  const [isLoggingIn, setIsLoggingIn] = useState(() => !currentUser);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // initializes showShopManagement with the boolean value of currentUser.
  const [showShopManagement, setshowShopManagement] = useState(() => !!currentUser);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [showShopCreationForm, setShowShopCreationForm] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [name_user, setNameUser] = useState(() => currentUser?.name_user || '');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [passwordIcons, setPasswordIcons] = useState([]);
  const [type_user, setUserType] = useState(() => currentUser?.type_user || '');
  const [location_user, setLocationUser] = useState(() => currentUser?.location_user || '');

  const [showErrorCard, setShowErrorCard] = useState(false);

  const [error, setError] = useState({
    userError: '',
    passwordError: '',
    passwordRepeatError: '',
    ipError: '',
    userlocationError: '',
    userTypeError: '',
    databaseResponseError: '',
    shopError: '',
    productError: '',
    imageError: ''
  });

  const [imageError, setImageError] = useState(false);


  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const [success, setSuccess] = useState({
  loginSuccess: '',
  shopSuccess: '',
  productSuccess: '',
  updateSuccess: '',
  deleteSuccess: '',
  imageSuccess: ''
  });


  const [showInfoCard, setShowInfoCard] = useState(false);

  const [info, setInfo] = useState({
    loginInfo: '',
    shopInfo: '',
    productInfo: '',
    updateInfo: '',
    deleteInfo: '',
    imageInfo: ''
  });

  const clearInfo = () => {
    setInfo({
      loginInfo: '',
      shopInfo: '',
      productInfo: '',
      updateInfo: '',
      deleteInfo: '',
      imageInfo: ''
    });
    setShowInfoCard(false);
  };

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

  const clearError = () => {
    setError({
      userError: '',
      passwordError: '',
      passwordRepeatError: '',
      ipError: '',
      userlocationError: '',
      userTypeError: '',
      databaseResponseError: '',
      shopError: '',
      productError: '',
      imageError: ''
    });
    setShowErrorCard(false);
  };

  const clearSuccess = () => {
    setSuccess({
      loginSuccess: '',
      shopSuccess: '',
      productSuccess: '',
      updateSuccess: '',
      deleteSuccess: '',
      imageSuccess: ''
    });
    setShowSuccessCard(false);
  };

  const login = (userData) => {
    // Remove only the password field
    const { pass_user, ...userWithoutPassword } = userData;
    
    // Preserve all other user data including image_user
    const userDataWithTimestamp = {
      ...userWithoutPassword,
      timestamp: new Date().getTime()
    };
    
    // Store complete user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userDataWithTimestamp));
    
    // Update state with complete user data
    setCurrentUser(userWithoutPassword);
    setNameUser(userWithoutPassword.name_user);
    setIsLoggingIn(false);
    setshowShopManagement(true);
    clearError();
  };

  const logout = () => {
    //to-do: show modal to ask later if the user wants to log out
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggingIn(true);
    setshowShopManagement(false);
  };

  const clearUserSession = () => {
    setNameUser('');
    setPassword('');
    setPasswordRepeat('');
    setLocationUser('');
    setDisplayedPassword('');
    setShowPasswordLabel(true);
    setKeyboardKey((prev) => prev + 1);
    setshowShopManagement(false);
    setUserType('');
    setShowPasswordRepeat(false);
    setShowRepeatPasswordMessage(false);
    // Clear errors
    setError({
      userError: '',
      passwordError: '',
      passwordRepeatError: '',
      ipError: '',
      userlocationError: '',
      userTypeError: '',
      databaseResponseError: '',
      shopError: '',
      productError: '',
      imageError: ''
    });
    setShowErrorCard(false);
  };

  const MAX_PASSWORD_LENGTH = 4;

  const [databaseResponse, setDatabaseResponse] = useState(true);
  const [displayedPassword, setDisplayedPassword] = useState('');
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [showPasswordLabel, setShowPasswordLabel] = useState(true);
  const [keyboardKey, setKeyboardKey] = useState(0);
  const [onPasswordComplete, setOnPasswordComplete] = useState(null);
  const [onClear, setOnClear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRepeatPasswordMessage, setShowRepeatPasswordMessage] = useState(false);
 
  const [selectedShopType, setSelectedShopType] = useState(null);
  
  const [ip, setIp] = useState('');
  
  const [newShop, setNewShop] = useState({
    name_shop: '',
    type_shop: '',
    subtype_shop: '',
    location_shop: '',
    id_user: '',
    calification_shop: 0, 
    image_shop: '',
    opening_time: '09:00',
    closing_time: '17:00',
    has_delivery: false,
  })

  const [selectedShop, setSelectedShop] = useState(null);
  const [shopType, setShopType] = useState('');
  const [shops, setShops] = useState([]);
  const [shopTypes, setShopTypes] = useState([]);

  const [shopTypesAndSubtypes, setShopTypesAndSubtypes] = useState({
    'Artesanía': ['Accesorios','Cuero', 'Decoración', 'Madera', 'Cerámica', 'Textil', 'Varios'],
    'Alimentación': [
        'Asador', 'Carnicería', 'Charcutería', 'Ecológica','Frutas, verduras y conservas', 'Local', 'Panadería', 'Pescadería', 'Peruana', 'China', 'Japonesa', 
        'Italiana', 'Turca', 'Ultra marinos', 'Kebab', 'Restaurante', 'Varios'
    ],
    'Consultoría': [
         'Digital', 'Formativa', 'Gestión Cultural', 'Inmobiliaria', 'Jurídica', 'Seguros', 'Técnica', 'Varios'
    ],
    'Educativa': ['Asesoría', 'Charla', 'Clases de cocina', 'Clases de fotografía', 'Clases de música', 'Clases de pintura', 'Clases de yoga', 'Conferencias', 'Curso', 'Investigación', 'Librería', 'Presentación', 'Talleres', 'Varios', 'Clases de baile', 'Clases de idiomas', 'Clases de teatro', 'Clases de deportes', 'Clases de arte', 'Clases de manualidades', 'Clases de cocina infantiles', 'Clases de música infantiles', 'Clases de teatro', 'Clases de teatro infantiles', 'Clases de deportes', 'Clases de deportes infantiles', 'Clases de arte infantiles', 'Clases de manualidades para adultos', 'Clases de manualidades infantiles', 'Clases de manualidades', 'Varios'
    ],
    'Entretenimiento': ['Baile', 'Danza', 'Escape Room', 'Infantil', 'Juvenil', 'Tercera edad', 'Txiki park', 'Juguetería', 'Música', 'Teatro', 'Viajes', 'Varios'
    ],
    'Especializado': [
        'Arte', 'Autoescuela', 'Bodega', 'Concept Store', 'Desarrollo web', 'Dietética y nutrición', 'Diseño gráfico', 'Electrodoméstico', 
        'Estanco', 'Estudio de arte', 'Golosinas', 'Ilustración', 'Joyería', 'Locutorio', 'Peluquería canina', 
        'Prensa', 'Programación', 'Tattoo shop', 'Vinoteca', 'Zapatería', 'Varios'
    ],
    'Ropa': [
        'Abrigo', 'Accesorio', 'Calcetine', 'Calzado', 'Chaqueta', 'Camiseta', 'Chaqueta', 'Falda', 'Infantil', 'Lencería', 
        'Pantaloneta', 'Pantalón', 'Pijama', 'Ropa de deporte', 'Ropa interior', 'Ropa de maternidad', 'Ropa de trabajo', 'Segunda mano',  'Vestido', 'Vintage', 'Varios'
    ],
    'Salud y Bienestar': [
        'Baile', 'Dietética', 'Imagen personal', 'Fisioterapia', 'Gimnasio', 'Manicura y pedicura', 'Odontología', 'Osteopatía', 'Parafarmacia', 
        'Peluquería', 'Surf', 'Txoko', 'Varios', 'Yoga'
    ],
    'Servicios': [
        'Arte', 'Catering', 'Construcción', 'Dibujo', 'Electricidad', 'Fotografía', 
        'Fontanería', 'Interiorismo', 'Limpieza', 'Pintura', 'Cuidado geriátrico', 'Paseo de mascotas', 
        'Limpieza de coches', 'Voluntariado', 'Varios'
    ],
    'Taller': ['Diseño', 'Escultura', 'Ilustración', 'Mecánico', 'Pintura', 'Varios'],
    'Técnico': [
        'Albañilería', 'Reparación de vehículo', 'Accesorios de coche', 'Accesorios de moto', 'Carpintería', 'Calefacción', 
        'Cerrajería', 'Electricidad', 'Electrónica', 'Fontanería', 'Repuestos', 'Repuestos de coche', 'Repuestos de moto', 'Varios'
    ],
});

  const [newProductData, setNewProductData] = useState({
    name_product: '',
    price_product: '',
    discount_product: 0,
    season_product: '',
    calification_product: 0,
    type_product: '',
    subtype_product: '',
    stock_product: 0,
    info_product: '',
    id_shop: ''
  });
  
  const [selectedProductForImageUpload, setSelectedProductForImageUpload] = useState(null);

  const [products, setProducts] = useState([]);

  const [productTypesAndSubtypes, setProductTypesAndSubtypes] = useState({
    'Accesorios': ['Bolso', 'Gafas', 'Joyería', 'Reloj', 'Cinturón', 'Varios'],
    'Artesanía': ['Anillo', 'Collar', 'Pendientes', 'Pulsera', 'Varios'],
    'Belleza': ['Productos de Belleza', 'Productos para Cabello', 'Maquillaje', 'Perfume', 'Productos para Piel', 'Skincare'],
    'Bebida': ['Alcohol', 'Café', 'Refresco', 'Té', 'Zumo', 'Agua', 'Varios'],
    'Calzado': ['Bailarinas', 'Botas', 'Deportivas', 'Zapatillas', 'Sandalias',  'Varios'],
    'Comida': ['Bebida', 'Entrante', 'Plato Principal', 'Postre', 'Snack', 'Panadería', 'Varios'],
    'Educativo': ['Asesoría', 'Charla', "Clases privadas", 'Clases de música', 'Clases de pintura', 'Curso', 'Investigación', 'Librería', 'Presentación', 'Varios'],
    'Electrónica': ['Accesorios', 'Audio', 'Móvil', 'Ordenador', 'Tablet', 'Varios'],
    'Joyería': ['Anillo', 'Collar', 'Pendientes', 'Pulsera', 'Varios'],
    'Muebles': ['Baño', 'Cocina', 'Dormitorio', 'Jardín', 'Salón', 'Varios'],
    'Sesión': ['Escape room', 'Hall game', 'Juegos pórtatiles', 'Escape de ciudad', 'Varios'],
    'Ropa': ['Abrigo', 'Accesorios', 'Calcetines', 'Calzado', 'Camiseta', 'Chaqueta', 'Falda', 'Lencería', 'Pantalón', 'Pantaloneta', 'Pijama', 'Ropa de deporte', 'Ropa de maternidad', 'Ropa de trabajo', 'Vestido', 'Varios'],
    'Salud': ['Cuidado Personal', 'Higiene', 'Medicina', 'Suplementos'],
    'Servicio': ['Asesoría', 'Informático', 'Instalación', 'Limpieza', 'Mantenimiento', 'Reparación'],
    'Varios': ['General', 'Otros']
  });

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductToUpdate, setSelectedProductToUpdate] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [filters, setFilters] = useState({
    temporada: '',
    tipo: '',
    subtipo: '',
    oferta: '',
    calificacion: 0,
  });

  const [filterOptions, setFilterOptions] = useState({
    temporada: {
      label: 'Temporada',
      options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el Año'],
    },
    tipo: {
      label: 'Tipo',
      options: ['Ropa', 'Comida', 'Bebida', 'Electrónica', 'Accesorio', 'Joyería', 'Muebles', 'Salud', 'Belleza', 'Complemento', 'Servicio', 'No Clasificado', 'Regular', 'Vegetariano', 'Vegano', 'Sin gluten', 'Kosher', 'Sin lactosa', 'Varios'],
    },
    oferta: {
      label: 'Oferta',
      options: ['Descuento', 'Sin Descuento'], 
    },
    calificacion: {
      label: 'Calificación',
      options: ['0', '1', '2', '3', '4', '5'], 
    },
  });


  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  // Check for expired user data on component mount
  useEffect(() => {
    checkAndClearUserData();
  }, []);



  const value = {
    isLoggingIn, setIsLoggingIn,
    name_user, setNameUser,
    password, setPassword,
    passwordRepeat, setPasswordRepeat,
    MAX_PASSWORD_LENGTH,
    databaseResponse, setDatabaseResponse,
    type_user, setUserType,
    shopType, setShopType,
    showShopManagement, setshowShopManagement,
    showPasswordRepeat, setShowPasswordRepeat,
    showPasswordLabel, setShowPasswordLabel,
    keyboardKey, setKeyboardKey,
    onPasswordComplete, setOnPasswordComplete,
    onClear, setOnClear,
    displayedPassword, setDisplayedPassword,
    currentUser, setCurrentUser,
    login, logout,
    shops, setShops,
    loading, setLoading,
    selectedShop, setSelectedShop,
    isAddingShop, setIsAddingShop,
    selectedShopType, setSelectedShopType,
    showShopCreationForm, setShowShopCreationForm,
    products, setProducts,
    error, setError,
    filterOptions, setFilterOptions,
    filters, setFilters,
    filteredProducts, setFilteredProducts,
    shopTypes, setShopTypes,
    ip, setIp,
    checkAndClearUserData,
    location_user, setLocationUser,
    newShop, setNewShop,
    shopTypesAndSubtypes, setShopTypesAndSubtypes,
    showErrorCard, setShowErrorCard,
    showRepeatPasswordMessage,
    setShowRepeatPasswordMessage, clearError,
    showProductManagement, setShowProductManagement,
    newProductData, setNewProductData,
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    modalMessage, setModalMessage,
    selectedProducts, setSelectedProducts,
    isUpdatingProduct, setIsUpdatingProduct,
    selectedProductToUpdate, setSelectedProductToUpdate,
    imageError, setImageError,
    uploading, setUploading,
    productTypesAndSubtypes, setProductTypesAndSubtypes,
    isImageModalOpen, setIsImageModalOpen,
    selectedProductForImageUpload, setSelectedProductForImageUpload,
    passwordIcons, setPasswordIcons,
    clearUserSession,
    productToDelete, setProductToDelete,
    selectedImageForModal, setSelectedImageForModal,
    showSuccessCard, setShowSuccessCard,
    success, setSuccess,
    clearSuccess, info, setInfo,
    showInfoCard, setShowInfoCard,
    clearInfo
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
