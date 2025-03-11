import { useContext, useEffect, useState } from 'react';
import AppContext from '../../../../app_context/AppContext';
import axiosInstance from '../../../../utils/app/axiosConfig';
// Import the required utilities for image upload
import { uploadProductImage } from '../../../../utils/image/imageUploadService.js';
import { validateImageFile } from '../../../../utils/image/imageValidation.js';
import { optimizeImage } from '../../../../utils/image/imageOptimizer.js';

const ProductCreationFormFunctions = () => {
  const { 
    setNewProductData,
    selectedShop, setError, 
    setShowErrorCard, newProductData, 
    products, setProducts,
    setShowProductManagement,
    selectedProductToUpdate,
    setIsUpdatingProduct,
    setSelectedProductToUpdate,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    isDeclined,
    setIsDeclined,
    currentUser,
    shopToProductTypesMap,
    setUploading,
    setSuccess,
    setShowSuccessCard,
    refreshProductList
  } = useContext(AppContext);

  // Estado para llevar la cuenta de productos y el límite
  const [productCount, setProductCount] = useState(0);
  const [productLimit, setProductLimit] = useState(7); // Valor por defecto para usuarios no sponsor
  // Add state to track current operation type to prevent conflicts
  const [currentOperation, setCurrentOperation] = useState(null); // can be 'create', 'update', or null

  // Función para obtener productos por tienda
  const fetchProductsByShop = async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No hay comercio seleccionado');
        setError(prevError => ({ ...prevError, shopError: "No hay comercio seleccionado" }));
        setProducts([]);
        return;
      }
      
      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);
      const fetchedProducts = response.data.data || [];
      
      console.log(`Fetched ${fetchedProducts.length} products for shop ${selectedShop.name_shop}`);
      
      // Filter out invalid empty products
      const validProducts = fetchedProducts.filter(product => 
        product.name_product && product.name_product.trim() !== ''
      );
      
      if (validProducts.length !== fetchedProducts.length) {
        console.warn(`Filtered out ${fetchedProducts.length - validProducts.length} empty products`);
      }
      
      // Sort products by ID (most recent first)
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
  };

  // Determinar el límite de productos basado en la categoría del usuario
  useEffect(() => {
    if (currentUser?.category_user) {
      setProductLimit(25); // Límite para usuarios sponsor
    } else {
      setProductLimit(3); // Límite para usuarios no sponsor
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
  }, [selectedShop, setNewProductData]);


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
  }, [isAccepted, isDeclined]);

  const handleChange = (e) => {
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
  };

  const handleNumericInputChange = (e) => {
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
  };

  // Function to check if product type is valid for the shop type
  const isValidProductTypeForShop = (productType, shopType) => {
    // If we're updating a product, allow the existing type
    if (selectedProductToUpdate && productType === selectedProductToUpdate.type_product) {
      return true;
    }
    
    // Get allowed product types for this shop type
    const allowedTypes = shopToProductTypesMap[shopType] || [];
    
    // Check if the product type is in the allowed types
    return allowedTypes.includes(productType);
  };

  const validateProductData = (newProductData) => {
    try {
      if (!newProductData.id_shop) {
        setError(prevError => ({ ...prevError, productError: "Debe seleccionar una comercio"}));
        throw new Error("Debe seleccionar una comercio");
      }
      if (!newProductData.name_product) {
        setError(prevError => ({ ...prevError, productError: "El nombre de producto es requerido"}));
        throw new Error("El nombre de producto es requerido");
      }
      if (!newProductData.type_product) {
        setError(prevError => ({ ...prevError, productError: "El tipo de producto es requerido"}));
        throw new Error("El tipo de producto es requerido");
      }
      
      // Validate that product type is compatible with shop type
      if (selectedShop && !isValidProductTypeForShop(newProductData.type_product, selectedShop.type_shop)) {
        setError(prevError => ({ 
          ...prevError, 
          productError: `El tipo de producto "${newProductData.type_product}" no es válido para tiendas de tipo "${selectedShop.type_shop}"`
        }));
        throw new Error(`El tipo de producto "${newProductData.type_product}" no es válido para tiendas de tipo "${selectedShop.type_shop}"`);
      }
      
      if (newProductData.discount_product < 0 || newProductData.discount_product > 100) {
        setError(prevError => ({ ...prevError, productError: "Valor de descuento fuera del rango permitido"}));
        throw new Error("Valor de descuento fuera del rango permitido");
      }
      if (newProductData.sold_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El sold no puede ser negativo"}));
        throw new Error("El sold no puede ser negativo");
      }
      // Validate price format
      if (newProductData.price_product.toString().split('.')[1]?.length > 2) {
        setError(prevError => ({ ...prevError, productError: "El precio debe tener máximo 2 decimales"}));
        throw new Error("El precio debe tener máximo 2 decimales");
      }

      if (!newProductData.subtype_product) {
        setError(prevError => ({ ...prevError, productError: "El subtipo de producto es requerido"}));
        throw new Error("El subtipo de producto es requerido");
      }

      if (newProductData.surplus_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El excedente no puede ser negativo"}));
        throw new Error("El excedente no puede ser negativo");
      }
      if (newProductData.expiration_product) {
        const expirationDate = new Date(newProductData.expiration_product);
        if (isNaN(expirationDate.getTime())) {
          setError(prevError => ({ ...prevError, productError: "Fecha de caducidad inválida"}));
          throw new Error("Fecha de caducidad inválida");
        }
      }

      // Verificar límite de productos
      if (!selectedProductToUpdate && productCount >= productLimit) {
        setError(prevError => ({ 
          ...prevError, 
          productError: `Has alcanzado el límite de ${productLimit} productos. ${!currentUser?.category_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
        }));
        throw new Error(`Has alcanzado el límite de ${productLimit} productos`);
      }

      return true;
    } catch (err) {
      console.error('Error validating product data:', err);
      setError(prevError => ({ ...prevError, productError: err.message || "Error al validar los datos del producto" }));
      return false;
    }
  };

  const resetNewProductData = () => {
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
      locality_product: ''  
    });
    
    setError(prevError => ({
      ...prevError,
      productError: '',
    }));
    
    // IMPORTANT: We no longer reset isUpdatingProduct here
    // This prevents the conflict with handleAddProduct
    setSelectedProductToUpdate(null);
  };

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
  const handleImageUpload = async (file, productId, onProgress) => {
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
          imageSuccess: "Imagen subida correctamente"
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
  };

  // Updated createProduct with better success message handling
  const createProduct = async () => {
    try {
      // Verificar que no se haya alcanzado el límite
      if (productCount >= productLimit) {
        setError(prevError => ({
          ...prevError,
          productError: `Has alcanzado el límite de ${productLimit} productos. ${!currentUser?.category_user ? 'Conviértete en sponsor para aumentar tu límite.' : ''}`
        }));
        setShowErrorCard(true);
        return false;
      }

      // Ensure price has exactly 2 decimal places before submitting
      const formattedData = {
        ...newProductData,
        price_product: Number(newProductData.price_product).toFixed(2),
      };

      console.log('Creating product with data:', formattedData);
      const response = await axiosInstance.post('/product/create', formattedData);

      if (response.data.error) {
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return false;
      }

      if (response.data.data) {
        const createdProduct = response.data.data;
        
        // After successfully creating a product, fetch fresh product list from the server
        await fetchProductsByShop();
        
        // Force refresh the product list in other components
        refreshProductList();
        
        // Use createSuccess for creation operations
        setSuccess(prevSuccess => ({
          ...prevSuccess,
          createSuccess: "Producto creado exitosamente",
          // Clear other operations to avoid confusion
          productSuccess: '',
          updateSuccess: '',
          deleteSuccess: ''
        }));
        setShowSuccessCard(true);
        
        resetNewProductData();
        setShowProductManagement(true);
        
        // Return the created product so we can access its ID
        return createdProduct;
      }
      
      return false;
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al crear el producto'
      }));
      setShowErrorCard(true);
      console.error('ProductCreationFormFunctions - createProduct() - Error al crear el producto =', err);
      console.error('Error request:', err.request);
      console.error('Error config:', err.config);
      return false;
    }
  };

  // Updated handleSubmit with operation tracking
  const handleSubmit = async (e, imageFile = null) => {
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
      console.error('ProductCreationFormFunctions - handleSubmit() - Error al crear el producto =', err);
      return false;
    }
  };

  // Updated handleUpdate with operation tracking
  const handleUpdate = async (e, imageFile = null) => {
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
      console.error('ProductCreationFormFunctions - handleUpdate() - Error al actualizar el producto =', err);
      return false;
    }
  };
  
  // Updated updateProductInDB with improved success message handling
  const updateProductInDB = async (updateData) => {
    try {
      const response = await axiosInstance.patch('/product/update', updateData);
    
      if (!response.data) {
        throw new Error('No response data received');
      }
    
      if (response.data.error) {
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return false;
      }
    
      if (response.data.data) {
        // After successfully updating a product, fetch fresh product list
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
          updateSuccess: "Producto actualizado correctamente",
          // Clear other operations to avoid confusion
          productSuccess: '',
          createSuccess: '',
          deleteSuccess: ''
        }));
        setShowSuccessCard(true);
        
        return true;
      }
      
      return false;
    } catch (err) {
      throw err;
    }
  };

  // Function to get available product types for the selected shop
  const getAvailableProductTypesForShop = () => {
    if (!selectedShop || !selectedShop.type_shop) {
      return Object.keys(productTypesAndSubtypes);
    }
    
    return shopToProductTypesMap[selectedShop.type_shop] || [];
  };
  
  // UPDATE: Added functions for handling image selection in the UI
  const handleImageSelect = (file, setSelectedImage, setImagePreview, setShowImageUploadButton, setError) => {
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
  };

  // UPDATE: Added function to clear image
  const clearImage = (fileInputRef, setSelectedImage, setImagePreview) => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // UPDATE: Added function to handle view product list navigation
  const handleViewProductList = (setIsUpdatingProduct, setSelectedProductToUpdate, setShowProductManagement) => {
    console.log('Returning to product list from ProductCreationForm');
    
    // First reset product-related states
    setIsUpdatingProduct(false);
    setSelectedProductToUpdate(null);
    
    // Then set showProductManagement to ensure ProductManagement renders ShopProductsList
    setShowProductManagement(true);
    
    console.log('Navigation back to product list complete');
  };

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
    // UPDATE: Export new image-related functions
    handleImageSelect,
    clearImage,
    handleViewProductList
  };
};

export default ProductCreationFormFunctions;