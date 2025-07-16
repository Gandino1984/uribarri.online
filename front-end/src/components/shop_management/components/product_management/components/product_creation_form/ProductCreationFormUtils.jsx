import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../app_context/ProductContext.jsx';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';
// Import the required utilities for image upload
import { uploadProductImage } from '../../../../../../utils/image/imageUploadService.js';
import { validateImageFile } from '../../../../../../utils/image/imageValidation.js';
import { optimizeImage } from '../../../../../../utils/image/imageOptimizer.js';

const ProductCreationFormUtils = () => {
  // Auth context
  const { currentUser } = useAuth();
  
  // UI context
  const { 
    setError, 
    setShowErrorCard, 
    setIsModalOpen, 
    setModalMessage, 
    isAccepted, 
    setIsAccepted, 
    isDeclined, 
    setIsDeclined, 
    setUploading,
    setSuccess,
    setShowSuccessCard,
    setShowProductManagement
  } = useUI();
  
  // Shop context
  const { selectedShop } = useShop();
  
  // Product context
  const { 
    newProductData, 
    setNewProductData,
    products, 
    setProducts,
    selectedProductToUpdate,
    setIsUpdatingProduct,
    setSelectedProductToUpdate,
    shopToProductTypesMap,
    refreshProductList,
    categories //update: Add categories to get the actual category name
  } = useProduct();


  const [productCount, setProductCount] = useState(0);
  
  const [productLimit, setProductLimit] = useState(7);

  const [currentOperation, setCurrentOperation] = useState(null); // can be 'create', 'update', or null

  // Función para obtener productos por tienda
  const fetchProductsByShop = useCallback(async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No hay comercio seleccionado');
        setError(prevError => ({ ...prevError, shopError: "No hay comercio seleccionado" }));
        setProducts([]);
        return [];
      }
      
      // UPDATE: Added logging to track the fetch process
      console.log(`ProductCreationFormUtils - Fetching products for shop ID: ${selectedShop.id_shop}`);
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
      setProductCount(sortedProducts.length);
      
      return sortedProducts;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => ({ 
        ...prevError, 
        databaseResponseError: "Hubo un error al buscar los productos del comercio" 
      }));
      setProducts([]);
      return [];
    } 
  }, [selectedShop, setProducts, setError]);

  // Determinar el límite de productos basado en la categoría del usuario
  useEffect(() => {
    if (currentUser?.contributor_user) {
      setProductLimit(200); // Límite para usuarios sponsor
    } else {
      setProductLimit(7); // Límite para usuarios no sponsor
    }
  }, [currentUser]);

  // Establecer el conteo de productos cada vez que cambian los productos
  useEffect(() => {
    if (Array.isArray(products)) {
      setProductCount(products.length);
    }
  }, [products]);

  useEffect(() => {
    if (selectedShop) {
      setNewProductData(prev => ({
        ...prev,
        id_shop: selectedShop.id_shop
      }));
      
      // Utilizar la función existente para obtener los productos de la tienda
      fetchProductsByShop();
    }
  }, [selectedShop, setNewProductData, fetchProductsByShop]);


  // Completely revised effect to handle modal responses with operation type tracking
  useEffect(() => {
    const handleModalResponse = async () => {
      // Only proceed if we have a modal response (accepted or declined) AND an active operation
      if (isAccepted && currentOperation) {
        console.log(`Handling confirmed ${currentOperation} operation`);
        
        try {
          if (currentOperation === 'update' && selectedProductToUpdate) {
            // Update case
            const updateData = {
              ...newProductData,
              id_product: selectedProductToUpdate.id_product,
              price_product: Number(newProductData.price_product).toFixed(2)
            };
            await updateProductInDB(updateData);
          } else if (currentOperation === 'create') {
            // Create case
            await createProduct();
          }
        } catch (error) {
          console.error(`Error in ${currentOperation} operation:`, error);
          setError(prevError => ({
            ...prevError,
            productError: `Error en la operación de ${currentOperation === 'update' ? 'actualización' : 'creación'}: ${error.message}`
          }));
          setShowErrorCard(true);
        } finally {
          // Reset operation and modal state
          setCurrentOperation(null);
          setIsAccepted(false);
        }
      } else if (isDeclined) {
        // User canceled, reset operation and modal state
        setCurrentOperation(null);
        setIsDeclined(false);
      }
    };

    handleModalResponse();
  }, [isAccepted, isDeclined, currentOperation, selectedProductToUpdate, newProductData, setError, setShowErrorCard, setIsAccepted, setIsDeclined]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'info_product') {
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount <= 7) {
        setNewProductData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        setError(prevError => ({ ...prevError, productError: "El número de palabras no puede superar los 7"}));
        throw new Error("El número de palabras no puede superar los 7");
      }
    } else {
      setNewProductData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, [setNewProductData, setError]);

  const handleNumericInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'price_product') {
      // Handle empty input
      if (value === '') {
        setNewProductData(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }

      // Convert to number and validate
      let numValue = parseFloat(value);
      
      if (!isNaN(numValue)) {
        // Format to exactly 2 decimal places
        const formattedValue = Number(numValue.toFixed(2));
        
        // Ensure the value doesn't exceed 2 decimal places
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces <= 2) {
          setNewProductData(prev => ({
            ...prev,
            [name]: formattedValue
          }));
        }
      }
    } else {
      // Handle other numeric inputs (sold, discount, etc.)
      const processedValue = value === '' ? '' : Number(value);
      
      if (!isNaN(processedValue)) {
        setNewProductData(prev => ({
          ...prev,
          [name]: processedValue
        }));
      }
    }
  }, [setNewProductData]);

  // Function to check if product type is valid for the shop type
  const isValidProductTypeForShop = useCallback((productType, shopType) => {
    // If we're updating a product, allow the existing type
    if (selectedProductToUpdate && productType === selectedProductToUpdate.type_product) {
      return true;
    }
    
    // Get allowed product types for this shop type
    const allowedTypes = shopToProductTypesMap[shopType] || [];
    
    // Check if the product type is in the allowed types
    return allowedTypes.includes(productType);
  }, [selectedProductToUpdate, shopToProductTypesMap]);

  const validateProductData = useCallback((productData) => {
    try {
      if (!productData.id_shop) {
        setError(prevError => ({ ...prevError, productError: "Debe seleccionar una comercio"}));
        throw new Error("Debe seleccionar una comercio");
      }
      if (!productData.name_product) {
        setError(prevError => ({ ...prevError, productError: "El nombre de producto es requerido"}));
        throw new Error("El nombre de producto es requerido");
      }
      //update: Check for category and subcategory IDs instead of type/subtype
      if (!productData.id_category) {
        setError(prevError => ({ ...prevError, productError: "La categoría es requerida"}));
        throw new Error("La categoría es requerida");
      }
      if (!productData.id_subcategory) {
        setError(prevError => ({ ...prevError, productError: "La subcategoría es requerida"}));
        throw new Error("La subcategoría es requerida");
      }
      
      //update: Remove the type_product validation since we're using categories now
      // The backend will handle the type_product based on the selected category
      
      if (productData.discount_product < 0 || productData.discount_product > 100) {
        setError(prevError => ({ ...prevError, productError: "Valor de descuento fuera del rango permitido"}));
        throw new Error("Valor de descuento fuera del rango permitido");
      }
      if (productData.sold_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El sold no puede ser negativo"}));
        throw new Error("El sold no puede ser negativo");
      }
      // Validate price format
      if (productData.price_product.toString().split('.')[1]?.length > 2) {
        setError(prevError => ({ ...prevError, productError: "El precio debe tener máximo 2 decimales"}));
        throw new Error("El precio debe tener máximo 2 decimales");
      }

      if (productData.surplus_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El excedente no puede ser negativo"}));
        throw new Error("El excedente no puede ser negativo");
      }
      if (productData.expiration_product) {
        const expirationDate = new Date(productData.expiration_product);
        if (isNaN(expirationDate.getTime())) {
          setError(prevError => ({ ...prevError, productError: "Fecha de caducidad inválida"}));
          throw new Error("Fecha de caducidad inválida");
        }
      }

      // Verificar límite de productos
      if (!selectedProductToUpdate && productCount >= productLimit) {
        setError(prevError => ({ 
          ...prevError, 
          productError: `Has alcanzado el límite de ${productLimit} productos. ${!currentUser?.contributor_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
        }));
        throw new Error(`Has alcanzado el límite de ${productLimit} productos`);
      }

      return true;
    } catch (err) {
      console.error('Error validating product data:', err);
      setError(prevError => ({ ...prevError, productError: err.message || "Error al validar los datos del producto" }));
      return false;
    }
  }, [selectedShop, selectedProductToUpdate, productCount, productLimit, currentUser, setError]);

  const resetNewProductData = useCallback(() => {
    setNewProductData({
      name_product: '',
      price_product: '',
      discount_product: 0,
      season_product: 'Todo el Año',
      calification_product: 0,
      type_product: '',
      sold_product: 0,
      info_product: '',
      id_shop: selectedShop?.id_shop || '',
      subtype_product: '',
      second_hand: 0,
      surplus_product: 0,
      expiration_product: null,
      country_product: '',
      locality_product: '',
      active_product: true,  // Ensure new product has active_product set to true by default
      id_category: '',
      id_subcategory: ''
    });
    
    setError(prevError => ({
      ...prevError,
      productError: '',
    }));
    
    // IMPORTANT: We no longer reset isUpdatingProduct here
    // This prevents the conflict with handleAddProduct
    setSelectedProductToUpdate(null);
  }, [selectedShop, setNewProductData, setError, setSelectedProductToUpdate]);

  // Function to check if a product with the same name exists
  const verifyProductName = async (name_product, id_shop) => {
    try {
      const response = await axiosInstance.post(`/product/verify-product-name`, 
        {
          name_product: name_product,
          id_shop: id_shop
        }
      );
      
      return response.data.exists;
    } catch (err) {
      console.error('Error checking product name:', err);
      return false;
    }
  };

  // Function to handle image upload
  const handleImageUpload = useCallback(async (file, productId, onProgress) => {
    if (!file || !productId) {
      setError(prevError => ({
        ...prevError,
        imageError: "No hay archivo de imagen o producto seleccionado"
      }));
      return false;
    }

    if (!selectedShop?.id_shop) {
      setError(prevError => ({
        ...prevError,
        imageError: "No hay comercio seleccionado"
      }));
      return false;
    }

    try {
      // First validate the image
      await validateImageFile(file);
      
      // Always optimize and convert to WebP
      let optimizedFile = file;
      try {
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          format: 'image/webp',
          maxSizeKB: 1024 // 1MB limit
        });
        console.log('Image optimized:', {
          originalSize: Math.round(file.size / 1024) + 'KB',
          optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
        });
      } catch (optimizeError) {
        console.warn('Image optimization failed, using original file:', optimizeError);
      }

      setUploading(true);
      
      // Use the uploadProductImage function from your existing utilities
      const imagePath = await uploadProductImage({
        file: optimizedFile,
        shopId: selectedShop.id_shop,
        shopName: selectedShop.name_shop,
        productId: productId,
        onProgress: onProgress,
        onError: (errorMsg) => {
          setError(prevError => ({ ...prevError, imageError: errorMsg }));
        }
      });

      if (imagePath) {
        // Update the product in the products array with the new image
        const updatedProducts = products.map(product => {
          if (product.id_product === productId) {
            return { ...product, image_product: imagePath };
          }
          return product;
        });
        
        setProducts(updatedProducts);
        
        // Force refresh the product list in other components
        refreshProductList();
        
        setSuccess(prevSuccess => ({
          ...prevSuccess,
          imageSuccess: "Imagen subida ."
        }));
        setShowSuccessCard(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(prevError => ({
        ...prevError,
        imageError: error.message || "Error al subir la imagen"
      }));
      setShowErrorCard(true);
      return false;
    } finally {
      setUploading(false);
    }
  }, [selectedShop, products, setUploading, setError, setProducts, refreshProductList, setSuccess, setShowSuccessCard, setShowErrorCard]);

  // UPDATE: Enhanced createProduct function with better error handling, logging, and state management
  const createProduct = useCallback(async () => {
    try {
      console.log('Starting product creation process...');
      
      // Verificar que no se haya alcanzado el límite
      if (productCount >= productLimit) {
        setError(prevError => ({
          ...prevError,
          productError: `Has alcanzado el límite de ${productLimit} productos. ${!currentUser?.contributor_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
        }));
        setShowErrorCard(true);
        return false;
      }

      //update: Ensure type_product is set from the selected category
      const selectedCategory = categories.find(cat => cat.id_category === parseInt(newProductData.id_category));
      
      // Ensure price has exactly 2 decimal places before submitting
      const formattedData = {
        ...newProductData,
        price_product: Number(newProductData.price_product).toFixed(2),
        active_product: true,  // Explicitly set active_product to true for new products
        type_product: selectedCategory ? selectedCategory.name_category : newProductData.type_product // Use actual category name
      };

      console.log('Creating product with data:', formattedData);
      const response = await axiosInstance.post('/product/create', formattedData);

      if (response.data.error) {
        console.error('Error from server during product creation:', response.data.error);
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return false;
      }

      if (response.data.data) {
        const createdProduct = response.data.data;
        console.log('Product created successfully:', createdProduct);
        
        // UPDATE: Add the newly created product to the products array with proper active_product value
        const newProduct = {
          ...formattedData,
          id_product: createdProduct.id_product || createdProduct,
          image_product: null, // Initial state with no image
          active_product: true, // Ensure active_product is boolean true for frontend filtering
          creation_product: new Date().toISOString() // Add creation date
        };
        
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        
        // After adding to local state, fetch fresh product list from the server
        await fetchProductsByShop();
        
        // Force refresh the product list in other components
        refreshProductList();
        
        // Use createSuccess for creation operations
        setSuccess(prevSuccess => ({
          ...prevSuccess,
          createSuccess: "Producto creado.",
          // Clear other operations to avoid confusion
          productSuccess: '',
          updateSuccess: '',
          deleteSuccess: ''
        }));
        setShowSuccessCard(true);
        
        // Reset form and navigation
        resetNewProductData();
        
        // Ensure we're in product management view
        setIsUpdatingProduct(false);
        setShowProductManagement(true);
        
        // Return the created product so we can access its ID
        return createdProduct;
      }
      
      console.warn('Product creation returned no data');
      return false;
    } catch (err) {
      console.error('Error creating product:', err);
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al crear el producto'
      }));
      setShowErrorCard(true);
      console.error('ProductCreationFormUtils - createProduct() - Error request details:', {
        request: err.request,
        config: err.config,
        message: err.message
      });
      return false;
    }
  }, [productCount, productLimit, currentUser, newProductData, setError, setShowErrorCard, fetchProductsByShop, refreshProductList, setSuccess, setShowSuccessCard, resetNewProductData, setShowProductManagement, setIsUpdatingProduct, setProducts, categories]);

  // Updated handleSubmit with operation tracking
  const handleSubmit = useCallback(async (e, imageFile = null) => {
    e.preventDefault();
    try {
      if (!validateProductData(newProductData)) return false;

      // Check if a product with the same name already exists
      const nameExists = await verifyProductName(newProductData.name_product, newProductData.id_shop);
      
      if (nameExists) {
        // Show confirmation modal if product with same name exists
        setModalMessage(
          `Ya existe un producto con el nombre "${newProductData.name_product}" en tu tienda. ¿Deseas continuar con la creación de este producto?`
        );
        
        // Set current operation type before showing modal
        setCurrentOperation('create');
        setIsModalOpen(true);
        
        // Store the image file for later use
        if (imageFile) {
          sessionStorage.setItem('pendingProductImage', JSON.stringify({
            pending: true,
            timestamp: Date.now()
          }));
        }
        
        return false; // Wait for confirmation
      } else {
        // If no duplicate, proceed with creation directly
        const result = await createProduct();
        
        // If product was created successfully and we have an image to upload
        if (result && imageFile && result.id_product) {
          await handleImageUpload(imageFile, result.id_product, (progress) => {
            console.log(`Upload progress: ${progress}%`);
          });
        }
        
        return result ? true : false;
      }
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al crear el producto'
      }));
      setShowErrorCard(true);
      console.error('ProductCreationFormUtils - handleSubmit() - Error al crear el producto =', err);
      return false;
    }
  }, [newProductData, validateProductData, setModalMessage, setCurrentOperation, setIsModalOpen, createProduct, handleImageUpload, setError, setShowErrorCard]);

  // Updated handleUpdate with operation tracking
  const handleUpdate = useCallback(async (e, imageFile = null) => {
    e.preventDefault();
    try {
      if (!validateProductData(newProductData)) return false;

      const id_product = selectedProductToUpdate.id_product;
      
      if (!id_product) {
        throw new Error('No product ID found for update');
      }

      // Check if the updated name already exists for another product
      if (newProductData.name_product !== selectedProductToUpdate.name_product) {
        const nameExists = await verifyProductName(newProductData.name_product, selectedProductToUpdate.id_shop);
        
        if (nameExists) {
          // Show confirmation modal if product with same name exists
          setModalMessage(
            `Ya existe un producto con el nombre "${newProductData.name_product}" en tu tienda. ¿Deseas continuar con la actualización de este producto?`
          );
          
          // Set current operation type before showing modal
          setCurrentOperation('update');
          setIsModalOpen(true);
          return false; // Exit and wait for modal response in useEffect
        }
      }
      
      // If name is unique or unchanged, proceed with update
      const updateData = {
        ...newProductData,
        id_product,
        price_product: Number(newProductData.price_product).toFixed(2)
      };
      
      const result = await updateProductInDB(updateData);
      
      // Handle image upload if provided
      if (result && imageFile) {
        await handleImageUpload(imageFile, id_product, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
      }
      
      return result ? true : false;
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al actualizar el producto'
      }));
      setShowErrorCard(true);
      console.error('ProductCreationFormUtils - handleUpdate() - Error al actualizar el producto =', err);
      return false;
    }
  }, [newProductData, selectedProductToUpdate, validateProductData, setModalMessage, setCurrentOperation, setIsModalOpen, handleImageUpload, setError, setShowErrorCard]);
  
  // UPDATE: Improved updateProductInDB with better state management
  const updateProductInDB = useCallback(async (updateData) => {
    try {
      //update: Ensure type_product is set from the selected category
      const selectedCategory = categories.find(cat => cat.id_category === parseInt(updateData.id_category));
      
      const dataWithType = {
        ...updateData,
        type_product: selectedCategory ? selectedCategory.name_category : updateData.type_product
      };
      
      console.log('Starting product update with data:', dataWithType);
      const response = await axiosInstance.patch('/product/update', dataWithType);
    
      if (!response.data) {
        throw new Error('No response data received');
      }
    
      if (response.data.error) {
        console.error('Error from server during product update:', response.data.error);
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return false;
      }
    
      if (response.data.data) {
        console.log('Product updated successfully:', response.data.data);
        
        // Update the product in local state first
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            if (product.id_product === updateData.id_product) {
              return { ...product, ...dataWithType };
            }
            return product;
          });
        });
        
        // After updating local state, fetch fresh product list from the server
        await fetchProductsByShop();
        
        // Force refresh the product list in other components
        refreshProductList();
        
        resetNewProductData();
        setShowProductManagement(true);
        setIsUpdatingProduct(false);
        setSelectedProductToUpdate(null);
        
        // Use updateSuccess for update operations
        setSuccess(prevSuccess => ({
          ...prevSuccess,
          updateSuccess: "Producto actualizado .",
          // Clear other operations to avoid confusion
          productSuccess: '',
          createSuccess: '',
          deleteSuccess: ''
        }));
        setShowSuccessCard(true);
        
        return true;
      }
      
      console.warn('Product update returned no data');
      return false;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }, [fetchProductsByShop, refreshProductList, resetNewProductData, setShowProductManagement, setIsUpdatingProduct, setSelectedProductToUpdate, setError, setShowErrorCard, setSuccess, setShowSuccessCard, setProducts, categories]);

  // Function to get available product types for the selected shop
  const getAvailableProductTypesForShop = useCallback(() => {
    if (!selectedShop || !selectedShop.type_shop) {
      return Object.keys({ });
    }
    
    return shopToProductTypesMap[selectedShop.type_shop] || [];
  }, [selectedShop, shopToProductTypesMap]);
  
  // Added Utils for handling image selection in the UI
  const handleImageSelect = useCallback((file, setSelectedImage, setImagePreview, setShowImageUploadButton, setError) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(prevError => ({
        ...prevError,
        imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
      }));
      setShowErrorCard(true);
      return;
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 10MB antes de la optimización."
      }));
      setShowErrorCard(true);
      return;
    }
    
    // Inform user if image will be optimized
    if (file.size > 1024 * 1024 || file.type !== 'image/webp') {
      console.log(`Image will be optimized: ${Math.round(file.size/1024)}KB, type: ${file.type}`);
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Hide the upload button after selection
    setShowImageUploadButton(false);
  }, [setShowErrorCard]);

  // Added function to clear image
  const clearImage = useCallback((fileInputRef, setSelectedImage, setImagePreview) => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // UPDATE: Improved handling of navigation back to product list
  const handleViewProductList = useCallback((setIsUpdatingProduct, setSelectedProductToUpdate, setShowProductManagement) => {
    console.log('Returning to product list from ProductCreationForm');
    
    // First reset product-related states
    setIsUpdatingProduct(false);
    setSelectedProductToUpdate(null);
    
    // Ensure products are refreshed
    refreshProductList();
    
    // Then set showProductManagement to ensure ProductManagement renders ShopProductsList
    setShowProductManagement(true);
    
    console.log('Navigation back to product list complete');
  }, [refreshProductList]);

  return {
    handleChange,
    handleNumericInputChange,
    handleSubmit,
    handleUpdate,
    resetNewProductData,
    productCount,
    productLimit,
    fetchProductsByShop,
    getAvailableProductTypesForShop,
    handleImageUpload,
    handleImageSelect,
    clearImage,
    handleViewProductList
  };
};

export default ProductCreationFormUtils;