// front-end/src/components/shop_management/components/product_management/components/shops_products_list/components/shops_packages_list/components/package_creation_form/PackageCreationFormUtils.jsx
import { useCallback } from 'react';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../../../app_context/ProductContext.jsx';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';

const PackageCreationFormUtils = () => {
  // Context hooks
  const { selectedShop } = useShop();
  const { products } = useProduct();
  const { setPackages, refreshPackageList } = usePackage();
  const { setError, setShowErrorCard, setSuccess, setShowSuccessCard } = useUI();

  // Validate package form inputs
  const validatePackageForm = useCallback((packageData) => {
    const errors = {};

    // Validate required fields
    if (!packageData.name_package || packageData.name_package.trim() === '') {
      errors.name_package = "El nombre del paquete es obligatorio";
    } else if (packageData.name_package.length > 100) {
      errors.name_package = "El nombre del paquete no puede exceder los 100 caracteres";
    }

    // Validate required product
    if (!packageData.id_product1) {
      errors.id_product1 = "Se requiere al menos un producto para crear un paquete";
    }

    // Validate shop ID
    if (!packageData.id_shop) {
      errors.id_shop = "Se requiere un comercio para crear un paquete";
    }

    if (packageData.discount_package !== undefined && packageData.discount_package !== '') {
      const discount = parseInt(packageData.discount_package);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        errors.discount_package = "El descuento debe ser un número entre 0 y 100";
      }
    }

    return errors;
  }, []);

  const getProductDetails = useCallback(async (productIds) => {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      const validIds = productIds.filter(id => id !== null && id !== undefined && id !== '');
      
      if (validIds.length === 0) {
        return [];
      }

      // First try to find products in the local state
      if (products && products.length > 0) {
        const details = validIds
          .map(id => products.find(p => p.id_product === id))
          .filter(p => p !== undefined && p !== null);

        if (details.length === validIds.length) {
          console.log('Found all product details in local state:', details);
          return details;
        }
      }

      // If all products not found locally, fetch from API
      console.log('Fetching product details from API for IDs:', validIds);
      const promises = validIds.map(id => 
        axiosInstance.get(`/product/by-id/${id}`)
          .then(response => {
            if (response.data && response.data.data) {
              return response.data.data;
            }
            console.warn(`Product ${id} returned invalid data`);
            return null;
          })
          .catch(error => {
            console.error(`Error fetching product ${id}:`, error);
            return null;
          })
      );

      const results = await Promise.all(promises);
      
      const validResults = results.filter(p => {
        if (!p) return false;
        if (!p.id_product || !p.name_product) {
          console.warn('Product missing required fields:', p);
          return false;
        }
        return true;
      });
      
      console.log('Fetched product details:', validResults);
      
      if (validResults.length < validIds.length) {
        console.warn(`Could only fetch ${validResults.length} of ${validIds.length} products`);
        setError(prevError => ({
          ...prevError,
          productWarning: `Algunos productos no pudieron ser cargados (${validResults.length} de ${validIds.length})`
        }));
      }
      
      return validResults;
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(prevError => ({
        ...prevError,
        productError: "Error al obtener detalles de los productos"
      }));
      setShowErrorCard(true);
      return [];
    }
  }, [products, setError, setShowErrorCard]);

  // Create a new package
  const handleCreatePackage = useCallback(async (packageData) => {
    try {
      console.log('=== STARTING PACKAGE CREATION ===');
      console.log('Package data received:', packageData);
      
      if (!packageData.id_product1) {
        console.error('Missing required product 1');
        return {
          success: false,
          message: "Se requiere al menos un producto para crear un paquete"
        };
      }

      //update: Prepare request payload with all fields properly structured
      const requestPayload = {
        id_shop: packageData.id_shop,
        id_product1: packageData.id_product1,
        id_product2: packageData.id_product2 || null,
        id_product3: packageData.id_product3 || null,
        id_product4: packageData.id_product4 || null,
        id_product5: packageData.id_product5 || null,
        name_package: packageData.name_package,
        discount_package: packageData.discount_package || 0,
        image_package: packageData.image_package || null,
        active_package: packageData.active_package !== undefined ? packageData.active_package : true
      };

      console.log('Sending request to /package/create with payload:', requestPayload);
      
      //update: Enhanced error handling and logging
      const response = await axiosInstance.post('/package/create', requestPayload)
        .catch(error => {
          console.error('=== AXIOS ERROR CAUGHT ===');
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          console.error('Error message:', error.message);
          console.error('Full error:', error);
          throw error;
        });
      
      console.log('=== PACKAGE CREATION RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('✓ Package created successfully!');
        console.log('Created package ID:', response.data.data?.id_package);
        
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || "Paquete creado exitosamente"
        }));
        setShowSuccessCard(true);
        
        // Fetch updated packages list
        try {
          const packagesResponse = await axiosInstance.get(`/package/by-shop-id/${packageData.id_shop}`);
          if (packagesResponse.data && packagesResponse.data.data) {
            setPackages(packagesResponse.data.data || []);
          }
        } catch (fetchError) {
          console.error('Error fetching updated packages:', fetchError);
        }
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.success
        };
      } else {
        console.error('✗ Backend returned error:', response.data.error);
        
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || "Error al crear el paquete"
        }));
        setShowErrorCard(true);
        
        return {
          success: false,
          message: response.data.error || "Error al crear el paquete"
        };
      }
    } catch (error) {
      console.error('=== EXCEPTION IN handleCreatePackage ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Full error object:', error);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details 
        || error.message 
        || "Error al crear el paquete";
      
      console.error('Final error message to user:', errorMessage);
      
      setError(prevError => ({
        ...prevError,
        productError: errorMessage
      }));
      setShowErrorCard(true);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [setError, setShowErrorCard, setSuccess, setShowSuccessCard, setPackages]);

  // Update an existing package
  const handleUpdatePackage = useCallback(async (packageData) => {
    try {
      console.log('=== STARTING PACKAGE UPDATE ===');
      console.log('Updating package with data:', packageData);
      
      if (!packageData.id_product1) {
        return {
          success: false,
          message: "Se requiere al menos un producto para el paquete"
        };
      }

      if (!packageData.id_package) {
        return {
          success: false,
          message: "ID del paquete requerido para actualizar"
        };
      }

      const response = await axiosInstance.patch('/package/update', {
        id_package: packageData.id_package,
        id_product1: packageData.id_product1,
        id_product2: packageData.id_product2 || null,
        id_product3: packageData.id_product3 || null,
        id_product4: packageData.id_product4 || null,
        id_product5: packageData.id_product5 || null,
        name_package: packageData.name_package,
        discount_package: packageData.discount_package || 0,
        image_package: packageData.image_package || null,
        active_package: packageData.active_package !== undefined ? packageData.active_package : true
      });
      
      console.log('Package update response:', response.data);
      
      if (response.data && response.data.success) {
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || "Paquete actualizado exitosamente"
        }));
        setShowSuccessCard(true);
        
        // Fetch updated packages list
        try {
          const packagesResponse = await axiosInstance.get(`/package/by-shop-id/${packageData.id_shop}`);
          if (packagesResponse.data && packagesResponse.data.data) {
            setPackages(packagesResponse.data.data || []);
          }
        } catch (fetchError) {
          console.error('Error fetching updated packages:', fetchError);
        }
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.success
        };
      } else {
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || "Error al actualizar el paquete"
        }));
        setShowErrorCard(true);
        
        return {
          success: false,
          message: response.data.error || "Error al actualizar el paquete"
        };
      }
    } catch (error) {
      console.error('Error updating package:', error);
      console.error('Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.details || "Error al actualizar el paquete";
      
      setError(prevError => ({
        ...prevError,
        productError: errorMessage
      }));
      setShowErrorCard(true);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [setError, setShowErrorCard, setSuccess, setShowSuccessCard, setPackages]);

  // Fetch packages by shop
  const fetchPackagesByShop = useCallback(async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No shop selected for fetching packages');
        return [];
      }

      console.log(`Fetching packages for shop ID: ${selectedShop.id_shop}`);
      const response = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
      
      if (response.data && response.data.data) {
        const packages = response.data.data || [];
        console.log(`Fetched ${packages.length} packages for shop ${selectedShop.name_shop}`);
        setPackages(packages);
        return packages;
      } else {
        console.error('Error in package fetch response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError(prevError => ({
        ...prevError,
        productError: "Error al obtener los paquetes del comercio"
      }));
      setShowErrorCard(true);
      return [];
    }
  }, [selectedShop, setPackages, setError, setShowErrorCard]);

  return {
    validatePackageForm,
    getProductDetails,
    handleCreatePackage,
    handleUpdatePackage,
    fetchPackagesByShop
  };
};

export default PackageCreationFormUtils;