import { useCallback, useEffect } from 'react';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
// import { useAuth } from '../../../../../../../../app_context/AuthContext.jsx';
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

  // ✨ UPDATE: Validate package form inputs
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

    //update: Validate discount_package if provided
    if (packageData.discount_package !== undefined && packageData.discount_package !== '') {
      const discount = parseInt(packageData.discount_package);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        errors.discount_package = "El descuento debe ser un número entre 0 y 100";
      }
    }

    return errors;
  }, []);

  //update: Fixed getProductDetails to properly handle null values and always return valid products
  const getProductDetails = useCallback(async (productIds) => {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      // Filter out null/undefined/empty string IDs first
      const validIds = productIds.filter(id => id !== null && id !== undefined && id !== '');
      
      if (validIds.length === 0) {
        return [];
      }

      // First try to find products in the local state
      if (products && products.length > 0) {
        const details = validIds
          .map(id => products.find(p => p.id_product === id))
          .filter(p => p !== undefined && p !== null); // Filter out not found products

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
            // Make sure we have valid data
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
      
      // Filter out null results and ensure we have valid product objects
      const validResults = results.filter(p => {
        if (!p) return false;
        // Check that the product has at least the required fields
        if (!p.id_product || !p.name_product) {
          console.warn('Product missing required fields:', p);
          return false;
        }
        return true;
      });
      
      console.log('Fetched product details:', validResults);
      
      // If we couldn't fetch all products, show a warning
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

  // ✨ UPDATE: Create a new package - updated to match your backend implementation
  const handleCreatePackage = useCallback(async (packageData) => {
    try {
      console.log('Creating package with data:', packageData);
      
      // Ensure there's a product1
      if (!packageData.id_product1) {
        return {
          success: false,
          message: "Se requiere al menos un producto para crear un paquete"
        };
      }

      // Make API call to create package
      const response = await axiosInstance.post('/package/create', {
        id_shop: packageData.id_shop,
        id_product1: packageData.id_product1,
        id_product2: packageData.id_product2,
        id_product3: packageData.id_product3,
        id_product4: packageData.id_product4,
        id_product5: packageData.id_product5,
        name_package: packageData.name_package,
        discount_package: packageData.discount_package || 0, //update: Include discount_package
        active_package: packageData.active_package
      });
      
      console.log('Package creation response:', response.data);
      
      if (response.data && response.data.success) {
        // Set success message
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || "Paquete creado exitosamente"
        }));
        setShowSuccessCard(true);
        
        // Fetch updated packages list
        try {
          const packagesResponse = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
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
        // Handle API error
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
      console.error('Error creating package:', error);
      
      const errorMessage = error.response?.data?.error || "Error al crear el paquete";
      
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
  }, [selectedShop, setError, setShowErrorCard, setSuccess, setShowSuccessCard, setPackages]);

  // ✨ UPDATE: Update an existing package
  const handleUpdatePackage = useCallback(async (packageData) => {
    try {
      console.log('Updating package with data:', packageData);
      
      // Ensure there's a product1
      if (!packageData.id_product1) {
        return {
          success: false,
          message: "Se requiere al menos un producto para el paquete"
        };
      }

      // Ensure we have the package ID
      if (!packageData.id_package) {
        return {
          success: false,
          message: "ID del paquete requerido para actualizar"
        };
      }

      // Make API call to update package
      const response = await axiosInstance.patch('/package/update', {
        id_package: packageData.id_package,
        id_product1: packageData.id_product1,
        id_product2: packageData.id_product2,
        id_product3: packageData.id_product3,
        id_product4: packageData.id_product4,
        id_product5: packageData.id_product5,
        name_package: packageData.name_package,
        discount_package: packageData.discount_package || 0,
        active_package: packageData.active_package
      });
      
      console.log('Package update response:', response.data);
      
      if (response.data && response.data.success) {
        // Set success message
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || "Paquete actualizado exitosamente"
        }));
        setShowSuccessCard(true);
        
        // Fetch updated packages list
        try {
          const packagesResponse = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
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
        // Handle API error
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
      
      const errorMessage = error.response?.data?.error || "Error al actualizar el paquete";
      
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
  }, [selectedShop, setError, setShowErrorCard, setSuccess, setShowSuccessCard, setPackages]);

  // ✨ UPDATE: Fetch packages by shop
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