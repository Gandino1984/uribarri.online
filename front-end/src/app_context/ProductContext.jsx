import { createContext, useContext, useState } from 'react';
import { useShop } from './ShopContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { selectedShop } = useShop();
  
  // Product state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductToUpdate, setSelectedProductToUpdate] = useState(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [selectedProductForImageUpload, setSelectedProductForImageUpload] = useState(null);
  
  // Product creation/editing
  const [newProductData, setNewProductData] = useState({
    name_product: '',
    price_product: '',
    discount_product: 0,
    season_product: '',
    calification_product: 0,
    type_product: '',
    subtype_product: '',
    sold_product: 0,
    info_product: '',
    id_shop: '',
    second_hand: false,
    surplus_product: 0,
    expiration_product: null
  });
  
  // Refresh control
  const [productListKey, setProductListKey] = useState(0);
  
  // Filter state
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
      label: 'Descuento',
      options: ['Descuento', 'Sin Descuento'], 
    },
    calificacion: {
      label: 'Calificación',
      options: ['0', '1', '2', '3', '4', '5'], 
    },
  });
  
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
  
  const [shopToProductTypesMap, setShopToProductTypesMap] = useState({
    'Artesanía': ['Artesanía', 'Accesorios', 'Joyería'],
    'Alimentación': ['Comida', 'Bebida'],
    'Consultoría': ['Servicio', 'Educativo'],
    'Educativa': ['Educativo', 'Servicio'],
    'Entretenimiento': ['Sesión', 'Varios'],
    'Especializado': ['Varios', 'Electrónica', 'Joyería', 'Muebles'], 
    'Ropa': ['Ropa', 'Calzado', 'Accesorios'],
    'Salud y Bienestar': ['Salud', 'Belleza', 'Servicio'],
    'Servicios': ['Servicio', 'Varios'],
    'Taller': ['Artesanía', 'Servicio'],
    'Técnico': ['Servicio', 'Electrónica', 'Muebles']
  });
  
  // Helper functions
  const refreshProductList = () => {
    setProductListKey(prevKey => prevKey + 1);
  };
  
  const getAvailableProductTypesForShop = (shopType) => {
    return shopToProductTypesMap[shopType] || [];
  };
  
  const resetProductTypeFields = () => {
    setNewProductData(prev => ({
      ...prev,
      type_product: '',
      subtype_product: ''
    }));
  };

  const value = {
    products, setProducts,
    filteredProducts, setFilteredProducts,
    selectedProducts, setSelectedProducts,
    selectedProductToUpdate, setSelectedProductToUpdate,
    isUpdatingProduct, setIsUpdatingProduct,
    productToDelete, setProductToDelete,
    selectedProductDetails, setSelectedProductDetails,
    selectedProductForImageUpload, setSelectedProductForImageUpload,
    newProductData, setNewProductData,
    productListKey, refreshProductList,
    filters, setFilters,
    filterOptions, setFilterOptions,
    productTypesAndSubtypes, setProductTypesAndSubtypes,
    shopToProductTypesMap, setShopToProductTypesMap,
    getAvailableProductTypesForShop,
    resetProductTypeFields,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;