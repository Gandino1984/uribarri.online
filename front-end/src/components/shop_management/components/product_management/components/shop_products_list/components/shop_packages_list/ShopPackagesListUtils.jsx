import { useCallback } from 'react';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import { useProduct } from '../../../../../../../../app_context/ProductContext.jsx';

const ShopPackagesListUtils = () => {
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
  } = useUI();
  
  // Shop context
  const { 
    selectedShop
  } = useShop();
  
  // Package context
  const { 
    packages, 
    setPackages,
    selectedPackage, 
    setSelectedPackage,
    packageToDelete, 
    setPackageToDelete,
    refreshPackageList,
    setNewPackageData,
    setIsAddingPackage,
    setShowPackageCreationForm
  } = usePackage();

  // Product context
  const {
    products,
  } = useProduct();

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

  // Format active status for display
  const formatActiveStatus = (value) => {
    return value ? 'Activo' : 'Inactivo';
  };

  // Handle package row click to show package details
  const handlePackageRowClick = (pkg, setSelectedPackageDetails, setShowPackageCard) => {
    setSelectedPackageDetails(pkg);
    setShowPackageCard(true);
  };

  // Toggle filters visibility
  const toggleFilters = (setShowFilters) => {
    setShowFilters(prevState => !prevState);
  };

  // Toggle actions menu for a package
  const toggleActionsMenu = (packageId, activeActionsMenu, setActiveActionsMenu, e) => {
    e.stopPropagation();
    if (activeActionsMenu === packageId) {
      setActiveActionsMenu(null);
    } else {
      setActiveActionsMenu(packageId);
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

  // Fetch packages for the selected shop
  const fetchPackagesByShop = useCallback(async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('-> ShopPackagesListUtils.jsx - fetchPackagesByShop - No hay comercio seleccionado');
        setError(prevError => ({ ...prevError, shopError: "No hay comercio seleccionado" }));
        setPackages([]);
        return [];
      }
      
      console.log(`Fetching packages for shop ID: ${selectedShop.id_shop}`);
      const response = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);

      const fetchedPackages = response.data.data || [];
      
      // Additional validation - skip empty packages
      const validPackages = fetchedPackages.filter(pkg => 
        pkg.name_package && pkg.name_package.trim() !== ''
      );
      
      if (validPackages.length !== fetchedPackages.length) {
        console.warn(`Filtered out ${fetchedPackages.length - validPackages.length} empty packages`);
      }
      
      console.log(`Successfully fetched ${validPackages.length} valid packages for shop ${selectedShop.name_shop}`);
      
      // Sort the packages to maintain consistent order after updates
      // Most recent packages first (assuming higher ID means more recent)
      const sortedPackages = [...validPackages].sort((a, b) => {
        return b.id_package - a.id_package;
      });
      
      setPackages(sortedPackages);
      
      // Clear any selections when refreshing the package list
      setSelectedPackage(null);
      
      return sortedPackages;
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(prevError => ({ ...prevError, databaseResponseError: "Hubo un error al buscar los paquetes del comercio" }));
      setPackages([]);
      return [];
    }
  }, [selectedShop, setPackages, setSelectedPackage, setError]);

  // Delete a package
  const deletePackage = useCallback(async (id_package) => {
    try {
      console.log(`Starting deletion of package with ID: ${id_package}`);
      
      // Input validation
      if (!id_package) {
        console.error('Invalid package ID for deletion');
        return { success: false, message: "ID de paquete inválido" };
      }
      
      // Find the package in the current state
      const pkg = packages.find(p => p.id_package === id_package);
      if (!pkg) {
        console.error(`Package with ID ${id_package} not found in current packages list`);
        return { success: false, message: "Paquete no encontrado" };
      }
      
      // Now delete the actual package from the database with error handling for race conditions
      try {
        console.log(`Sending API request to delete package with ID: ${id_package}`);
        const response = await axiosInstance.delete(`/package/remove-by-id/${id_package}`);
        
        // Verify deletion success
        if (response.data && response.data.success) {
          console.log('Package deletion API success response:', response.data);
          
          // Verify the ID returned matches what we sent
          if (response.data.data && response.data.data.toString() === id_package.toString()) {
            console.log('Deletion verified by matching IDs');
            
            // Apply proper success message for deletion
            setSuccess(prev => ({
              ...prev,
              deleteSuccess: "Paquete eliminado.",
              // Clear other package-related messages to avoid confusion
              productSuccess: '',
              createSuccess: '',
              updateSuccess: ''
            }));
            setShowSuccessCard(true);
            
            return { 
              success: true, 
              message: response.data.success || "Paquete eliminado." 
            };
          } else {
            console.warn('Package deletion API returned success but with unexpected data:', response.data);
            return { success: true, message: "Paquete eliminado" };
          }
        } else {
          // This could be a race condition - check if package was already deleted
          if (response.data && response.data.error === "Paquete no encontrado") {
            console.warn('Package not found in database. It may have been already deleted.');
            // We'll count this as a successful deletion since the package is gone
            return { success: true, message: "Paquete eliminado (ya no existía)" };
          }
          
          console.error('API reported error during package deletion:', response.data);
          setError(prevError => ({
            ...prevError,
            productError: response.data.error || "Error al eliminar el paquete"
          }));
          setShowErrorCard(true);
          return { success: false, message: response.data.error || "Error al eliminar el paquete" };
        }
      } catch (apiError) {
        // Check if the error is a 404, which could mean the package was already deleted
        if (apiError.response && apiError.response.status === 404) {
          console.warn('Got 404 response - package may have been already deleted');
          // Even though we got an error, the package is gone, so technically this is a success
          return { success: true, message: "Paquete eliminado (ya no existía)" };
        }
        
        throw apiError; // Re-throw for other errors
      }
    } catch (err) {
      console.error('Exception in deletePackage function:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al eliminar el paquete: " + (err.message || "Error desconocido")
      }));
      setShowErrorCard(true);
      return { success: false, message: "Error al eliminar el paquete" };
    }
  }, [packages, setError, setShowErrorCard, setSuccess, setShowSuccessCard]);

  // Handle delete package button click
  const handleDeletePackage = useCallback(async (id_package) => {
    console.log('Attempting to delete package:', id_package);
    
    // First clear any existing success or error messages
    setSuccess(prev => ({
      ...prev,
      deleteSuccess: '',
      productSuccess: '',
      createSuccess: '',
      updateSuccess: ''
    }));
    
    setPackageToDelete(id_package);
    setModalMessage('¿Estás seguro que deseas eliminar este paquete?');
    setIsModalOpen(true);
    setIsAccepted(false);
  }, [setSuccess, setPackageToDelete, setModalMessage, setIsModalOpen, setIsAccepted]);

  // Handle add package button click
  const handleAddPackage = useCallback(() => {
    console.log('handleAddPackage clicked - Preparing to show package creation form');
    
    // 1. Prepare an empty package with defaults and shop ID
    const emptyPackage = {
      id_shop: selectedShop?.id_shop || '',
      id_product1: '',
      id_product2: null,
      id_product3: null,
      id_product4: null,
      id_product5: null,
      name_package: '',
      active_package: true
    };
    
    // 2. Set the new package data
    setNewPackageData(emptyPackage);
    
    // 3. Set the mode flag to trigger PackageCreationForm display
    setIsAddingPackage(true);
    
    // 4. Show the package creation form
    setShowPackageCreationForm(true);
    
    console.log('Package creation mode activated');
  }, [selectedShop, setNewPackageData, setIsAddingPackage, setShowPackageCreationForm]);

  // Handle update package button click
  const handleUpdatePackage = useCallback((id_package) => {
    const packageToUpdate = packages.find(p => p.id_package === id_package);
    if (packageToUpdate) {
      setSelectedPackage(packageToUpdate);
      setIsAddingPackage(true);
      setShowPackageCreationForm(true);
    }
  }, [packages, setSelectedPackage, setIsAddingPackage, setShowPackageCreationForm]);

  // Handle toggle package active status
  const handleToggleActiveStatus = useCallback(async (id_package) => {
    try {
      console.log(`Toggling active status for package: ${id_package}`);
      
      // Call the API to toggle the package status
      const response = await axiosInstance.post('/package/toggle-active', {
        id_package
      });
      
      if (response.data && response.data.success) {
        // Success message
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success
        }));
        setShowSuccessCard(true);
        
        // Refresh the package list to update UI
        await fetchPackagesByShop();
        refreshPackageList();
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.success
        };
      } else {
        // Error handling
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || "Error al cambiar el estado del paquete"
        }));
        setShowErrorCard(true);
        return {
          success: false,
          message: response.data.error
        };
      }
    } catch (err) {
      console.error('Error toggling package active status:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al cambiar el estado del paquete"
      }));
      setShowErrorCard(true);
      return {
        success: false,
        message: "Error al cambiar el estado del paquete"
      };
    }
  }, [setError, setShowErrorCard, setSuccess, setShowSuccessCard, fetchPackagesByShop, refreshPackageList]);

  // Find and return product details for a package
  const getProductDetailsForPackage = useCallback((packageItem) => {
    if (!packageItem || !products || products.length === 0) {
      return [];
    }

    const productDetails = [];
    
    // Check and add each product in the package
    for (let i = 1; i <= 5; i++) {
      const productIdKey = `id_product${i}`;
      const productId = packageItem[productIdKey];
      
      if (productId) {
        const productDetail = products.find(p => p.id_product === productId);
        if (productDetail) {
          productDetails.push(productDetail);
        }
      }
    }
    
    return productDetails;
  }, [products]);

  // Filter packages by search term
  const filterPackages = useCallback((packages, searchTerm) => {
    if (!packages || !searchTerm || searchTerm.trim() === '') {
      return packages;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return packages.filter(pkg => {
      return (
        (pkg.name_package && pkg.name_package.toLowerCase().includes(term)) ||
        (pkg.id_package && pkg.id_package.toString().includes(term))
      );
    });
  }, []);

  return {
    fetchPackagesByShop,
    deletePackage,
    handleDeletePackage,
    handleAddPackage,
    handleUpdatePackage,
    handleToggleActiveStatus,
    formatDate,
    formatActiveStatus,
    handlePackageRowClick,
    toggleFilters,
    toggleActionsMenu,
    handleSearchChange,
    handleResetAllFilters,
    getProductDetailsForPackage,
    filterPackages
  };
};

export default ShopPackagesListUtils;