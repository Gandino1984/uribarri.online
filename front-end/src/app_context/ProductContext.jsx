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

  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  

  
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
  
  //update: Fetch categories based on selected shop
  useEffect(() => {
    const fetchCategoriesForShop = async () => {
      if (!selectedShop?.id_shop) {
        console.log('No shop selected, skipping category fetch');
        setCategories([]);
        return;
      }
      
      console.log(`Fetching categories for shop ${selectedShop.id_shop} (${selectedShop.name_shop})`);
      setLoadingCategories(true);
      setCategoriesError(null);
      
      try {
        //update: Use the new endpoint to get categories filtered by shop
        const response = await axiosInstance.get(`/product-category/shop/${selectedShop.id_shop}`);
        console.log('Categories response for shop:', response.data);
        
        if (response.data && response.data.data) {
          setCategories(response.data.data);
          console.log(`Set ${response.data.data.length} categories for shop ${selectedShop.id_shop}`);
          
          // Build categoriesWithSubcategories for the filtered categories
          const filteredCategoriesWithSubs = {};
          for (const category of response.data.data) {
            try {
              const subResponse = await axiosInstance.get(`/product-subcategory/shop/${selectedShop.id_shop}/category/${category.id_category}`);
              if (subResponse.data && subResponse.data.data) {
                filteredCategoriesWithSubs[category.name_category] = subResponse.data.data.map(sub => sub.name_subcategory);
              }
            } catch (subError) {
              console.error(`Error fetching subcategories for category ${category.id_category}:`, subError);
              filteredCategoriesWithSubs[category.name_category] = [];
            }
          }
          
          setCategoriesWithSubcategories(filteredCategoriesWithSubs);
          setProductTypesAndSubtypes(filteredCategoriesWithSubs); // For backward compatibility
          
          // Extract category names for filter options
          const categoryNames = Object.keys(filteredCategoriesWithSubs);
          setFilterOptions(prev => ({
            ...prev,
            tipo: {
              ...prev.tipo,
              options: categoryNames
            }
          }));
        } else {
          console.error('No categories data in response');
          setCategories([]);
        }
        
      } catch (error) {
        console.error('Error fetching categories for shop:', error);
        console.error('Error details:', error.response || error);
        setCategoriesError('Error al cargar las categorías para este comercio');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategoriesForShop();
  }, [selectedShop]); // Re-fetch when selected shop changes
  
  
  //update: Modified to fetch subcategories filtered by shop type with enhanced logging
  const fetchSubcategoriesByCategory = async (categoryId) => {
    if (!categoryId) {
        setSubcategories([]);
        return;
    }
    
    try {
        setLoadingSubcategories(true);
        
        // If we have a selected shop, use the filtered endpoint
        if (selectedShop?.id_shop) {
            console.log(`Fetching subcategories for shop ${selectedShop.id_shop} and category ${categoryId}`);
            console.log(`Shop type: ${selectedShop.type_shop} (ID: ${selectedShop.id_type})`);
            
            const response = await axiosInstance.get(`/product-subcategory/shop/${selectedShop.id_shop}/category/${categoryId}`);
            
            console.log('Subcategories response:', response.data);
            
            if (response.data.error) {
                console.error('Error fetching subcategories:', response.data.error);
                setSubcategories([]);
            } else {
                const subcategoriesData = response.data.data || [];
                console.log(`Received ${subcategoriesData.length} subcategories:`, subcategoriesData.map(s => s.name_subcategory));
                setSubcategories(subcategoriesData);
            }
        } else {
            // Fallback to regular endpoint if no shop is selected
            console.log(`No shop selected, fetching all subcategories for category ${categoryId}`);
            const response = await axiosInstance.get(`/product-subcategory/by-category/${categoryId}`);
            
            if (response.data.error) {
                console.error('Error fetching subcategories:', response.data.error);
                setSubcategories([]);
            } else {
                setSubcategories(response.data.data || []);
            }
        }
    } catch (error) {
        console.error('Error in fetchSubcategoriesByCategory:', error);
        setSubcategories([]);
    } finally {
        setLoadingSubcategories(false);
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
    loadingSubcategories,
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