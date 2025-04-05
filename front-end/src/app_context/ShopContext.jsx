import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // UPDATE: Using the standardized setter name
  const { setShowShopManagement } = useUI();
  
  // Shop state
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [showShopCreationForm, setShowShopCreationForm] = useState(false);
  const [shopTypes, setShopTypes] = useState([]);
  const [shopType, setShopType] = useState('');
  const [selectedShopType, setSelectedShopType] = useState(null);
  
  // ✨ UPDATE: Added state to control the exit animation of ShopCreationForm
  const [shouldExitShopForm, setShouldExitShopForm] = useState(false);
  
  const [newShop, setNewShop] = useState({
    name_shop: '',
    type_shop: '',
    subtype_shop: '',
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

  // ✨ UPDATE: Add animation control functions
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
  
  // ✨ UPDATE: Function to close shop form with animation
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
    // ✨ UPDATE: Add new animation-related properties
    shouldExitShopForm,
    startFormExitAnimation,
    closeShopFormWithAnimation
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