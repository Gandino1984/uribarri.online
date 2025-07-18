import { useCallback, useState } from 'react';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../app_context/ProductContext.jsx';
import ProductCreationFormUtils from '../product_creation_form/ProductCreationFormUtils.jsx';
import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';

const ShopProductsListUtils = () => {
  // Auth context
  const { currentUser } = useAuth();
  
  // UI context
  const { 
    setError,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    setSuccess,
    setShowSuccessCard,
    setShowErrorCard,
    setIsImageModalOpen,
    setSelectedImageForModal
  } = useUI();
  
  // Shop context
  const { 
    selectedShop
  } = useShop();
  
  // Product context
  const { 
    products, 
    setProducts,
    filters,
    setFilteredProducts,
    selectedProducts, 
    setSelectedProducts,
    productToDelete, 
    setProductToDelete,
    selectedProductToUpdate, 
    setSelectedProductToUpdate,
    setSelectedProductForImageUpload,
    setIsUpdatingProduct,
    refreshProductList,
    setNewProductData,
    //update: Get categories from context
    categories
  } = useProduct();

  //update: Local state for all subcategories
  const [allSubcategories, setAllSubcategories] = useState({});

  const { resetNewProductData } = ProductCreationFormUtils ? ProductCreationFormUtils() : { resetNewProductData: () => {} };

  // Check if a product is near expiration (within 7 days)
  const isNearExpiration = (expirationDate) => {
    if (!expirationDate) return false;
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  // UPDATE: Added helper function to check if a product is new based on creation date
  const isNewProduct = useCallback((creationDate, timeframe) => {
    if (!creationDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    let startDate = new Date(today);
    
    if (timeframe === 'last_month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (timeframe === 'last_week') {
      startDate.setDate(today.getDate() - 7);
    } // For 'today', startDate is already set to the start of today
    
    const productDate = new Date(creationDate);
    
    return productDate >= startDate;
  }, []);

  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  // Format boolean values for second hand
  const formatSecondHand = (value) => {
    return value ? 'Sí' : 'No';
  };

  // Handle product row click to show product card
  const handleProductRowClick = (product, setSelectedProductDetails, setShowProductCard) => {
    setSelectedProductDetails(product);
    setShowProductCard(true);
  };

  // Toggle filters visibility
  const toggleFilters = (setShowFilters) => {
    setShowFilters(prevState => !prevState);
  };

  // Toggle actions menu for a product
  const toggleActionsMenu = (productId, activeActionsMenu, setActiveActionsMenu, e) => {
    e.stopPropagation();
    if (activeActionsMenu === productId) {
      setActiveActionsMenu(null);
    } else {
      setActiveActionsMenu(productId);
    }
  };

  // Handle search input change
  const handleSearchChange = (e, setSearchTerm) => {
    setSearchTerm(e.target.value);
  };

  // Reset all filters and search term
  const handleResetAllFilters = (handleResetFilters, setSearchTerm) => {
    handleResetFilters();
    setSearchTerm('');
  };

  // Select product for image upload
  const handleSelectForImageUpload = (id_product, setSelectedProductForImageUpload, setSelectedProducts, setActiveActionsMenu, e) => {
    e.stopPropagation();
    setSelectedProductForImageUpload(id_product);
    
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (!newSelected.has(id_product)) {
        newSelected.add(id_product);
      }
      return newSelected;
    });
    
    // Close the action menu after selection
    setActiveActionsMenu(null);
  };

  // Handle bulk update of products
  const handleBulkUpdate = (selectedProducts, products, handleUpdateProduct, setError, setShowErrorCard) => {
    // Check if a product is selected
    if (selectedProducts.size === 1) {
      // Get the selected product ID (first item in the Set)
      const selectedProductId = Array.from(selectedProducts)[0];
      
      // Find the product in the products array
      const productToUpdate = products.find(product => product.id_product === selectedProductId);
      
      // If product found, call the update handler
      if (productToUpdate) {
        handleUpdateProduct(selectedProductId);
      } else {
        console.error('Selected product not found in products array');
        setError(prevError => ({
          ...prevError,
          productError: "No se encontró el producto seleccionado"
        }));
      }
    } else if (selectedProducts.size > 1) {
      // Multiple products selected
      setError(prevError => ({
        ...prevError,
        productError: "Puedes actualizar un producto a la vez."
      }));
      setShowErrorCard(true);
    } else {
      // No products selected
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para actualizar"
      }));
      setShowErrorCard(true);
    }
  };

  const filterProducts = useCallback((products, filters) => {
    if (!products || !filters) return products;
    return products.filter((product) => {
      // Season match - case insensitive and handles "Todo el Año"
      const seasonMatch = !filters.temporada || 
        product.season_product.toLowerCase() === filters.temporada.toLowerCase() ||
        (filters.temporada.toLowerCase() === 'todo el año' && 
         product.season_product.toLowerCase().includes('todo'));
  
      //update: Modified type match to check both category name and type_product
      const typeMatch = !filters.tipo || 
        product.type_product === filters.tipo ||
        (categories && categories.find(cat => 
          cat.id_category === product.id_category && 
          cat.name_category === filters.tipo
        ));
  
      // Subtype match - only apply if type matches
      const subtypeMatch = !filters.subtipo || 
        (typeMatch && product.subtype_product === filters.subtipo);
  
      // Discount match
      const onSaleMatch = !filters.oferta || 
        (filters.oferta === 'Sí' && product.discount_product > 0);
  
      // Rating match - parse as number for comparison
      const calificationMatch = !filters.calificacion || 
        product.calification_product >= Number(filters.calificacion);
      
      // Surplus match
      const surplusMatch = !filters.excedente || 
        (filters.excedente === 'Sí' && product.surplus_product > 0);
      
      // Near expiration match
      const expirationMatch = !filters.proxima_caducidad || 
        (filters.proxima_caducidad === 'Sí' && isNearExpiration(product.expiration_product));
      
      // UPDATE: Added second hand match
      const secondHandMatch = !filters.second_hand || 
        (filters.second_hand === 'Sí' && (product.second_hand === true || product.second_hand === 1));
      
      // UPDATE: Added new products match based on creation date
      const newProductsMatch = !filters.nuevos_productos || isNewProduct(product.creation_product, filters.nuevos_productos);
      
      // Note: Active product filtering is handled in ShopProductsList.jsx
  
      return seasonMatch && typeMatch && subtypeMatch && 
             onSaleMatch && calificationMatch && 
             surplusMatch && expirationMatch &&
             secondHandMatch && newProductsMatch;
    });
  }, [isNewProduct, categories]);

  //update: Function to fetch all subcategories for the products
  const fetchAllSubcategories = useCallback(async (products) => {
    if (!products || products.length === 0) return {};
    
    try {
      // Get unique category IDs from products
      const uniqueCategoryIds = [...new Set(products
        .filter(p => p.id_category)
        .map(p => p.id_category))];
      
      const subcategoriesMap = {};
      
      // Fetch subcategories for each category
      for (const categoryId of uniqueCategoryIds) {
        try {
          const response = await axiosInstance.get(`/product-subcategory/by-category/${categoryId}`);
          if (response.data && response.data.data) {
            // Store subcategories indexed by subcategory ID for easy lookup
            response.data.data.forEach(subcategory => {
              subcategoriesMap[subcategory.id_subcategory] = subcategory;
            });
          }
        } catch (error) {
          console.error(`Error fetching subcategories for category ${categoryId}:`, error);
        }
      }
      
      return subcategoriesMap;
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      return {};
    }
  }, []);

  const fetchProductsByShop = useCallback(async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('-> ShopProductsListUtils.jsx - fetchProductsByShop - No hay comercio seleccionado');
        setError(prevError => ({ ...prevError, shopError: "No hay comercio seleccionado" }));
        setProducts([]);
        return [];
      }
      
      console.log(`Fetching products for shop ID: ${selectedShop.id_shop}`);
      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);

      const fetchedProducts = response.data.data || [];
      
      // Additional validation - skip empty products
      const validProducts = fetchedProducts.filter(product => 
        product.name_product && product.name_product.trim() !== ''
      );
      
      if (validProducts.length !== fetchedProducts.length) {
        console.warn(`Filtered out ${fetchedProducts.length - validProducts.length} empty products`);
      }
      
      console.log(`Successfully fetched ${validProducts.length} valid products for shop ${selectedShop.name_shop}`);
      
      //update: Fetch all subcategories for the products
      const subcategoriesMap = await fetchAllSubcategories(validProducts);
      setAllSubcategories(subcategoriesMap);
      
      // Sort the products to maintain consistent order after updates
      // Most recent products first (assuming higher ID means more recent)
      const sortedProducts = [...validProducts].sort((a, b) => {
        return b.id_product - a.id_product;
      });
      
      setProducts(sortedProducts);
      
      // Clear any selections when refreshing the product list
      setSelectedProducts(new Set());
      
      return sortedProducts;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => ({ ...prevError, databaseResponseError: "Hubo un error al buscar los productos del comercio" }));
      setProducts([]);
      return [];
    } 
  }, [selectedShop, setProducts, setSelectedProducts, setError, fetchAllSubcategories]);

  // Define deleteProduct before it's used in bulkDeleteProducts
  const deleteProduct = useCallback(async (id_product) => {
    try {
      console.log(`Starting deletion of product with ID: ${id_product}`);
      
      // Input validation
      if (!id_product) {
        console.error('Invalid product ID for deletion');
        return { success: false, message: "ID de producto inválido" };
      }
      
      // Find the product in the current state
      const product = products.find(p => p.id_product === id_product);
      if (!product) {
        console.error(`Product with ID ${id_product} not found in current products list`);
        return { success: false, message: "Producto no encontrado" };
      }
      
      // If the product has an image, handle image deletion
      if (product.image_product) {
        try {
          // Parse image path information
          const imagePath = product.image_product;
          const folderPath = imagePath.split('/').slice(0, -1).join('/');
          
          console.log(`Deleting image for product ${id_product}:`, { imagePath, folderPath });
          
          // First delete the image via the dedicated endpoint
          const imageDeleteResponse = await axiosInstance.delete(`/product/delete-image/${id_product}`, {
            data: { imagePath, folderPath }
          });
          
          console.log('Image deletion response:', imageDeleteResponse.data);
        } catch (imageError) {
          // Log error but continue with product deletion
          console.error('Error deleting product image (continuing with deletion):', imageError);
        }
      }

      // Now delete the actual product from the database with error handling for race conditions
      try {
        console.log(`Sending API request to delete product with ID: ${id_product}`);
        const response = await axiosInstance.delete(`/product/remove-by-id/${id_product}`);
        
        // Verify deletion success
        if (response.data && response.data.success) {
          console.log('Product deletion API success response:', response.data);
          
          // Verify the ID returned matches what we sent
          if (response.data.data && response.data.data.toString() === id_product.toString()) {
            console.log('Deletion verified by matching IDs');
            
            // Apply proper success message for deletion
            setSuccess(prev => ({
              ...prev,
              deleteSuccess: "Producto eliminado.",
              // Clear other product-related messages to avoid confusion
              productSuccess: '',
              createSuccess: '',
              updateSuccess: ''
            }));
            setShowSuccessCard(true);
            
            return { 
              success: true, 
              message: response.data.success || "Producto eliminado." 
            };
          } else {
            console.warn('Product deletion API returned success but with unexpected data:', response.data);
            return { success: true, message: "Producto eliminado" };
          }
        } else {
          // This could be a race condition - check if product was already deleted
          if (response.data && response.data.error === "Producto no encontrado") {
            console.warn('Product not found in database. It may have been already deleted.');
            // We'll count this as a successful deletion since the product is gone
            return { success: true, message: "Producto eliminado (ya no existía)" };
          }
          
          console.error('API reported error during product deletion:', response.data);
          setError(prevError => ({
            ...prevError,
            productError: response.data.error || "Error al eliminar el producto"
          }));
          setShowErrorCard(true);
          return { success: false, message: response.data.error || "Error al eliminar el producto" };
        }
      } catch (apiError) {
        // Check if the error is a 404, which could mean the product was already deleted
        if (apiError.response && apiError.response.status === 404) {
          console.warn('Got 404 response - product may have been already deleted');
          // Even though we got an error, the product is gone, so technically this is a success
          return { success: true, message: "Producto eliminado (ya no existía)" };
        }
        
        throw apiError; // Re-throw for other errors
      }
    } catch (err) {
      console.error('Exception in deleteProduct function:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al eliminar el producto: " + (err.message || "Error desconocido")
      }));
      setShowErrorCard(true);
      return { success: false, message: "Error al eliminar el producto" };
    }
  }, [products, setError, setShowErrorCard, setSuccess, setShowSuccessCard]);

  // Now bulkDeleteProducts can use deleteProduct since it's already defined
  const bulkDeleteProducts = useCallback(async () => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para eliminar"
      }));
      setShowErrorCard(true);
      return { success: false, message: "No products selected" };
    }

    try {
      let successCount = 0;
      let failCount = 0;

      // Delete products one by one
      for (const id_product of selectedProducts) {
        const result = await deleteProduct(id_product);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      // Clear selected products after deletion
      setSelectedProducts(new Set());

      // Refresh the products list
      await fetchProductsByShop();
      
      // Force refresh of the product list in ShopProductsList component
      refreshProductList();

      // Show result message
      const message = `${successCount} productos eliminados ${failCount > 0 ? `, ${failCount} fallos` : ''}`;
      
      if (failCount > 0) {
        setError(prevError => ({
          ...prevError,
          productError: message
        }));
        setShowErrorCard(true);
      } else {
        // Set success message for the deletion
        setSuccess(prev => ({
          ...prev,
          deleteSuccess: message,
          // Clear any other product messages to avoid confusion
          productSuccess: '',
          createSuccess: '',
          updateSuccess: ''
        }));
        setShowSuccessCard(true);
      }

      return { 
        success: successCount > 0, 
        message, 
        successCount, 
        failCount 
      };
    } catch (err) {
      console.error('Error in bulk deletion:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al eliminar los productos seleccionados"
      }));
      setShowErrorCard(true);
      return { success: false, message: "Error in bulk deletion" };
    }
  }, [selectedProducts, setSelectedProducts, setError, setShowErrorCard, setSuccess, setShowSuccessCard, refreshProductList, fetchProductsByShop, deleteProduct]);

  // Function to confirm bulk deletion
  const confirmBulkDelete = useCallback(() => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para eliminar"
      }));
      setShowErrorCard(true);
      return;
    }

    setModalMessage(`¿Estás seguro que deseas eliminar ${selectedProducts.size} producto${selectedProducts.size > 1 ? 's' : ''}?`);
    setIsModalOpen(true);
  }, [selectedProducts, setError, setShowErrorCard, setModalMessage, setIsModalOpen]);

  const handleSelectProduct = useCallback((id_product) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id_product)) {
        // Deselect the product
        newSelected.delete(id_product);
        setSelectedProductForImageUpload(null); // Clear the selected product for image upload
      } else {
        // Select the product
        newSelected.add(id_product);
        setSelectedProductForImageUpload(id_product); // Set the selected product for image upload
      }
      return newSelected;
    });
  }, [setSelectedProducts, setSelectedProductForImageUpload]);

  const handleDeleteProduct = useCallback(async (id_product) => {
    console.log('Attempting to delete product:', id_product);
    
    // First clear any existing success or error messages
    setSuccess(prev => ({
      ...prev,
      deleteSuccess: '',
      productSuccess: '',
      createSuccess: '',
      updateSuccess: ''
    }));
    
    setProductToDelete(id_product);
    setModalMessage('¿Estás seguro que deseas eliminar este producto?');
    setIsModalOpen(true);
    setIsAccepted(false);
  }, [setSuccess, setProductToDelete, setModalMessage, setIsModalOpen, setIsAccepted]);

  const handleBulkDelete = useCallback(() => {
    // Clear success messages before starting the deletion process
    setSuccess(prev => ({
      ...prev,
      deleteSuccess: '',
      productSuccess: '',
      createSuccess: '',
      updateSuccess: ''
    }));
    
    confirmBulkDelete();
  }, [setSuccess, confirmBulkDelete]);

  const handleAddProduct = useCallback(() => {
    console.log('handleAddProduct clicked - Preparing to show product creation form');
    
    // 1. First prepare an empty product with defaults and shop ID
    const emptyProduct = {
      name_product: '',
      price_product: '',
      discount_product: 0,
      season_product: 'Todo el Año',
      calification_product: 0,
      type_product: '',
      subtype_product: '',
      //update: Add category fields
      id_category: '',
      id_subcategory: '',
      sold_product: 0,
      info_product: '',
      id_shop: selectedShop?.id_shop || '',
      second_hand: false,
      surplus_product: 0,
      expiration_product: null,
      country_product: '',
      locality_product: ''
    };
    
    // 2. Set the new product data
    setNewProductData(emptyProduct);
    
    // 3. Clear any product for update
    setSelectedProductToUpdate(null);
    
    // 4. Reset errors
    setError(prevError => ({
      ...prevError,
      productError: '',
      imageError: ''
    }));
    
    // 5. Set the mode flag to trigger ProductCreationForm display
    setIsUpdatingProduct(true);
    
    console.log('Product creation mode activated');
  }, [selectedShop, setNewProductData, setSelectedProductToUpdate, setError, setIsUpdatingProduct]);

  const handleUpdateProduct = useCallback((id_product) => {
    const productToUpdate = products.find(p => p.id_product === id_product);
    if (productToUpdate) {
      setSelectedProductToUpdate(productToUpdate);
      setIsUpdatingProduct(true);
    }
  }, [products, setSelectedProductToUpdate, setIsUpdatingProduct]);

  // UPDATE: Added function to toggle product active status
  const handleToggleActiveStatus = useCallback(async (id_product) => {
    try {
      console.log(`Toggling active status for product: ${id_product}`);
      
      // Call the API to toggle the product status
      const response = await axiosInstance.post('/product/toggle-active', {
        id_product
      });
      
      if (response.data && response.data.success) {
        // Success message
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success
        }));
        setShowSuccessCard(true);
        
        // Refresh the product list to update UI
        await fetchProductsByShop();
        refreshProductList();
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.success
        };
      } else {
        // Error handling
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || "Error al cambiar el estado del producto"
        }));
        setShowErrorCard(true);
        return {
          success: false,
          message: response.data.error
        };
      }
    } catch (err) {
      console.error('Error toggling product active status:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al cambiar el estado del producto"
      }));
      setShowErrorCard(true);
      return {
        success: false,
        message: "Error al cambiar el estado del producto"
      };
    }
  }, [setError, setShowErrorCard, setSuccess, setShowSuccessCard, fetchProductsByShop, refreshProductList]);

  // Use the formatImageUrl function from imageUploadService.js for consistency
  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  const handleProductImageDoubleClick = useCallback((product) => {
    if (product?.image_product) {
      const imageUrl = getImageUrl(product.image_product);
      // Set both the selected image and open the modal
      setSelectedImageForModal(imageUrl);
      setIsImageModalOpen(true);
    }
  }, [setSelectedImageForModal, setIsImageModalOpen]);

  return {
    filterProducts,
    fetchProductsByShop,
    deleteProduct,
    bulkDeleteProducts,
    confirmBulkDelete,
    handleSelectProduct,
    handleDeleteProduct,
    handleBulkDelete,
    handleAddProduct,
    handleUpdateProduct,
    handleToggleActiveStatus,
    getImageUrl,
    handleProductImageDoubleClick,
    formatDate,
    formatSecondHand,
    handleProductRowClick,
    toggleFilters,
    toggleActionsMenu,
    handleSearchChange,
    handleResetAllFilters,
    handleSelectForImageUpload,
    handleBulkUpdate,
    isNewProduct,
    //update: Export allSubcategories
    allSubcategories
  };
};

export default ShopProductsListUtils;