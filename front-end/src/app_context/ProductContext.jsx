// front-end/src/app_context/ProductContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useShop } from './ShopContext';
import axiosInstance from '../utils/app/axiosConfig';

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
    season_product: 'Todo el Año',
    calification_product: 0,
    //update: Added category and subcategory IDs
    id_category: '',
    id_subcategory: '',
    type_product: '', // Keep for backward compatibility
    subtype_product: '', // Keep for backward compatibility
    sold_product: 0,
    info_product: '',
    id_shop: '',
    second_hand: 0,
    surplus_product: 0,
    expiration_product: null,
    country_product: '',
    locality_product: '',
    active_product: true
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
      options: [], // Will be populated from database
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
  
  //update: Remove hardcoded categories and add dynamic ones
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesWithSubcategories, setCategoriesWithSubcategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  
  // Remove hardcoded productTypesAndSubtypes
  const [productTypesAndSubtypes, setProductTypesAndSubtypes] = useState({});
  
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
  
  //update: Fetch categories and subcategories from database
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      console.log('Starting to fetch categories...'); // Debug log
      setLoadingCategories(true);
      setCategoriesError(null);
      
      try {
        //update: Fetch verified categories
        console.log('Fetching from /product-category/verified...'); // Debug log
        const categoriesResponse = await axiosInstance.get('/product-category/verified');
        console.log('Categories response:', categoriesResponse.data); // Debug log
        
        if (categoriesResponse.data && categoriesResponse.data.data) {
          setCategories(categoriesResponse.data.data);
          console.log('Categories set in state:', categoriesResponse.data.data); // Debug log
        } else {
          console.error('No categories data in response'); // Debug log
          setCategories([]);
        }
        
        //update: Then fetch categories with their subcategories
        try {
          const response = await axiosInstance.get('/product-category/with-subcategories');
          console.log('Categories with subcategories response:', response.data); // Debug log
          
          if (response.data && response.data.data) {
            setCategoriesWithSubcategories(response.data.data);
            setProductTypesAndSubtypes(response.data.data); // For backward compatibility
            
            // Extract category names for filter options
            const categoryNames = Object.keys(response.data.data);
            setFilterOptions(prev => ({
              ...prev,
              tipo: {
                ...prev.tipo,
                options: categoryNames
              }
            }));
          }
        } catch (subError) {
          console.error('Error fetching categories with subcategories:', subError);
          // This is not critical, continue without it
        }
        
      } catch (error) {
        console.error('Error fetching categories:', error); // Debug log
        console.error('Error details:', error.response || error); // More detailed error
        setCategoriesError('Error al cargar las categorías');
        setCategories([]); // Set empty array on error
      } finally {
        setLoadingCategories(false);
        console.log('Loading categories finished'); // Debug log
      }
    };
    
    fetchCategoriesAndSubcategories();
  }, []);
  
  //update: Fetch subcategories when a category is selected
  const fetchSubcategoriesByCategory = async (categoryId) => {
    try {
      console.log('Fetching subcategories for category:', categoryId); // Debug log
      const response = await axiosInstance.get(`/product-subcategory/by-category/${categoryId}`);
      console.log('Subcategories response:', response.data); // Debug log
      
      if (response.data && response.data.data) {
        setSubcategories(response.data.data);
        return response.data.data;
      }
      setSubcategories([]);
      return [];
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
      return [];
    }
  };
  
  // Helper functions
  const refreshProductList = () => {
    setProductListKey(prevKey => prevKey + 1);
  };
  
  const getAvailableProductTypesForShop = (shopType) => {
    // Get the category names allowed for this shop type
    const allowedCategoryNames = shopToProductTypesMap[shopType] || [];
    
    // Filter categories based on the allowed names
    return categories.filter(cat => allowedCategoryNames.includes(cat.name_category));
  };
  
  const resetProductTypeFields = () => {
    setNewProductData(prev => ({
      ...prev,
      id_category: '',
      id_subcategory: '',
      type_product: '',
      subtype_product: ''
    }));
    setSubcategories([]);
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
    //update: Add new category-related state and functions
    categories,
    subcategories,
    categoriesWithSubcategories,
    loadingCategories,
    categoriesError,
    fetchSubcategoriesByCategory,
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