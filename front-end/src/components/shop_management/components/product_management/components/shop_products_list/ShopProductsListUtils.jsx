import { useContext } from 'react';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';
import AppContext from '../../../../../../app_context/AppContext.js';
import ProductCreationFormUtils from '../product_creation_form/ProductCreationFormUtils.jsx';
import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';

const ShopProductsListUtils = () => {
  const { 
    setProducts, 
    setError,
    selectedShop, 
    setFilteredProducts,
    filters,
    setShowErrorCard,
    selectedProducts,
    setSelectedProducts,
    setModalMessage,
    setIsModalOpen,
    setSelectedProductForImageUpload,
    products,
    setShowProductManagement,
    setProductToDelete,
    setSelectedProductToUpdate,
    setIsAccepted,
    setIsDeclined,
    setIsImageModalOpen,
    productToDelete,
    selectedImageForModal, setSelectedImageForModal,
    setIsUpdatingProduct,
    refreshProductList,
    // Add the missing context values
    setIsAddingShop,
    newProductData, setNewProductData,
    setSuccess, // For showing success messages
    setShowSuccessCard
  } = useContext(AppContext);

  const { resetNewProductData } = ProductCreationFormUtils();

  // Check if a product is near expiration (within 7 days)
  const isNearExpiration = (expirationDate) => {
    if (!expirationDate) return false;
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  // UPDATE: Format date strings
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

  // UPDATE: Format boolean values for second hand
  const formatSecondHand = (value) => {
    return value ? 'Sí' : 'No';
  };

  // UPDATE: Handle product row click to show product card
  const handleProductRowClick = (product, setSelectedProductDetails, setShowProductCard) => {
    setSelectedProductDetails(product);
    setShowProductCard(true);
  };

  // UPDATE: Toggle filters visibility
  const toggleFilters = (setShowFilters) => {
    setShowFilters(prevState => !prevState);
  };

  // UPDATE: Toggle actions menu for a product
  const toggleActionsMenu = (productId, activeActionsMenu, setActiveActionsMenu, e) => {
    e.stopPropagation();
    if (activeActionsMenu === productId) {
      setActiveActionsMenu(null);
    } else {
      setActiveActionsMenu(productId);
    }
  };

  // UPDATE: Handle search input change
  const handleSearchChange = (e, setSearchTerm) => {
    setSearchTerm(e.target.value);
  };

  // UPDATE: Reset all filters and search term
  const handleResetAllFilters = (handleResetFilters, setSearchTerm) => {
    handleResetFilters();
    setSearchTerm('');
  };

  // UPDATE: Select product for image upload
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

  // UPDATE: Handle bulk update of products
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
        productError: "Solo puedes actualizar un producto a la vez. Por favor selecciona solo un producto."
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

  const filterProducts = (products, filters) => {
    if (!products || !filters) return products;
    return products.filter((product) => {
      // Season match - case insensitive and handles "Todo el Año"
      const seasonMatch = !filters.temporada || 
        product.season_product.toLowerCase() === filters.temporada.toLowerCase() ||
        (filters.temporada.toLowerCase() === 'todo el año' && 
         product.season_product.toLowerCase().includes('todo'));
  
      // Type match - exact match required
      const typeMatch = !filters.tipo || 
        product.type_product === filters.tipo;
  
      // Subtype match - only apply if type matches
      const subtypeMatch = !filters.subtipo || 
        (typeMatch && product.subtype_product === filters.subtipo);
  
      // Discount match
      const onSaleMatch = !filters.oferta || 
        (filters.oferta === 'Sí' && product.discount_product > 0);
  
      // Rating match - parse as number for comparison
      const calificationMatch = !filters.calificacion || 
        product.calification_product >= Number(filters.calificacion);
      
      // Surplus match - added to fix filter inconsistency
      const surplusMatch = !filters.excedente || 
        (filters.excedente === 'Sí' && product.surplus_product > 0);
      
      // Near expiration match
      const expirationMatch = !filters.proxima_caducidad || 
        (filters.proxima_caducidad === 'Sí' && isNearExpiration(product.expiration_product));
  
      return seasonMatch && typeMatch && subtypeMatch && 
             onSaleMatch && calificationMatch && 
             surplusMatch && expirationMatch;
    });
  };

  const fetchProductsByShop = async () => {
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
  };

  // New function for bulk deletion
  const bulkDeleteProducts = async () => {
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
      const message = `${successCount} productos eliminados exitosamente${failCount > 0 ? `, ${failCount} fallos` : ''}`;
      
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
  };

  // Function to confirm bulk deletion
  const confirmBulkDelete = () => {
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
  };

  const handleSelectProduct = (id_product) => {
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
  };

  const deleteProduct = async (id_product) => {
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
              deleteSuccess: "Producto eliminado exitosamente",
              // Clear other product-related messages to avoid confusion
              productSuccess: '',
              createSuccess: '',
              updateSuccess: ''
            }));
            setShowSuccessCard(true);
            
            return { 
              success: true, 
              message: response.data.success || "Producto eliminado exitosamente" 
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
  };

  const handleDeleteProduct = async (id_product) => {
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
    setIsDeclined(false);
  };

  const handleBulkDelete = () => {
    // Clear success messages before starting the deletion process
    setSuccess(prev => ({
      ...prev,
      deleteSuccess: '',
      productSuccess: '',
      createSuccess: '',
      updateSuccess: ''
    }));
    
    confirmBulkDelete();
  };

  const handleAddProduct = () => {
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
    
    // 5. Make sure we're not adding a shop
    setIsAddingShop(false);
    
    // 6. Set the mode flag to trigger ProductCreationForm display
    setIsUpdatingProduct(true);
    
    console.log('Product creation mode activated');
  };

  const handleUpdateProduct = (id_product) => {
    const productToUpdate = products.find(p => p.id_product === id_product);
    if (productToUpdate) {
      setSelectedProductToUpdate(productToUpdate);
      setIsUpdatingProduct(true);
    }
  };

  // Use the formatImageUrl function from imageUploadService.js for consistency
  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  const handleProductImageDoubleClick = (product) => {
    if (product?.image_product) {
      const imageUrl = getImageUrl(product.image_product);
      // Set both the selected image and open the modal
      setSelectedImageForModal(imageUrl);
      setIsImageModalOpen(true);
    }
  };

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
    getImageUrl,
    handleProductImageDoubleClick,
    // UPDATE: Add the new Utils to the return object
    formatDate,
    formatSecondHand,
    handleProductRowClick,
    toggleFilters,
    toggleActionsMenu,
    handleSearchChange,
    handleResetAllFilters,
    handleSelectForImageUpload,
    handleBulkUpdate
  };
};

export default ShopProductsListUtils;