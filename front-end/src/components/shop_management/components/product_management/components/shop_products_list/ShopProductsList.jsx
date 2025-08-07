import { useEffect, useState, useRef } from 'react';
import { useUI } from '../../../../../../../src/app_context/UIContext.jsx';
import { useShop } from '../../../../../../../src/app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../../src/app_context/ProductContext.jsx';
import { usePackage } from '../../../../../../../src/app_context/PackageContext.jsx';
import ShopPackagesList from './components/shop_packages_list/ShopPackagesList.jsx';
import ShopProductsListUtils from './ShopProductsListUtils.jsx';
import FiltersForProducts from '../../../../../filters_for_products/FiltersForProducts.jsx';

import styles from '../../../../../../../../public/css/ShopProductsList.module.css';
import ImageModal from '../../../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import ShopCard from '../../../shop_card/ShopCard.jsx';
import ConfirmationModal from '../../../../../confirmation_modal/ConfirmationModal.jsx';
import useFiltersForProducts from '../../../../../filters_for_products/FiltersForProductsUtils.jsx';

import SearchBar from './components/SearchBar.jsx';
import ActionButtons from './components/ActionButtons.jsx';
import ProductsCount from './components/ProductsCount.jsx';
import NoProductsMessage from './components/NoProductsMessage.jsx';
import NoShopSelected from './components/NoShopSelected.jsx';
import ProductsTable from './components/ProductsTable.jsx';
import useScreenSize from '../../../shop_card/components/useScreenSize.js';

// 🌟 UPDATE: Import React Spring for animations
import { useTransition, animated } from '@react-spring/web';
import { formAnimation, fadeInScale } from '../../../../../../utils/animation/transitions.js';

const ShopProductsList = () => {
  // UI context
  const {
    clearError, setError,
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    isImageModalOpen, setIsImageModalOpen,
    setShowSuccessCard,
    setShowErrorCard,
    setSuccess,
    selectedImageForModal, setSelectedImageForModal
  } = useUI();

  // Shop context
  const { selectedShop } = useShop();

  // Product context
  const {
    products,
    filters,
    setFilteredProducts,
    selectedProducts, setSelectedProducts,
    productToDelete, setProductToDelete,
    selectedProductDetails, setSelectedProductDetails,
    setSelectedProductForImageUpload,
    productListKey,
    setShowProductManagement,
    refreshProductList,
    //update: Get categories and subcategories from context
    categories,
    subcategories,
    fetchSubcategoriesByCategory
  } = useProduct();

  // ✨ UPDATE: Package context
  const {
    setNewPackageData,
    initNewPackageData,
    setShowPackageCreationForm,
    setIsAddingPackage
  } = usePackage();

  const [showProductCard, setShowProductCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  // State to manage filter visibility
  const [showFilters, setShowFilters] = useState(false);
  // State to track which product's actions menu is active (for mobile)
  const [activeActionsMenu, setActiveActionsMenu] = useState(null);
  
  // Get screen size for responsive behavior
  const isSmallScreen = useScreenSize(768);
  
  // Use the hook from FiltersForProductsUtils for consistent counting
  const { getActiveFiltersCount, handleResetFilters } = useFiltersForProducts();
  
  // Use the function to get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Add a ref to track deletion in progress
  const deletionInProgress = useRef(false);
  
  // Add a ref to track what product we're deleting
  const currentDeletingProduct = useRef(null);

  // 🌟 UPDATE: Add visibility state for component animation
  const [isVisible, setIsVisible] = useState(true);
  
  // 🔄 UPDATE: Add state to control showing packages list
  const [showPackages, setShowPackages] = useState(false);

  // Get all Utils from ShopProductsListUtils
  const {
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
    handleProductRowClick: handleRowClick,
    toggleFilters: toggleFiltersFn,
    toggleActionsMenu: toggleActionsMenuFn,
    handleSearchChange: handleSearchChangeFn,
    handleResetAllFilters: handleResetAllFiltersFn,
    handleSelectForImageUpload: handleSelectForImageUploadFn,
    handleBulkUpdate: handleBulkUpdateFn,
    isNewProduct,
    //update: Get allSubcategories from utils
    allSubcategories
  } = ShopProductsListUtils();

  // 🌟 UPDATE: Create animation transitions using React Spring
  const contentTransition = useTransition(isVisible, {
    ...formAnimation,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });

  // 🌟 UPDATE: Create separate transition for ShopCard
  const shopCardTransition = useTransition(isVisible && selectedShop, {
    ...fadeInScale,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });

  // Wrapper Utils that use the ones from ShopProductsListUtils
  const handleSearchChange = (e) => {
    handleSearchChangeFn(e, setSearchTerm);
  };

  const handleResetAllFilters = () => {
    handleResetAllFiltersFn(handleResetFilters, setSearchTerm);
  };

  const toggleActionsMenu = (productId, e) => {
    toggleActionsMenuFn(productId, activeActionsMenu, setActiveActionsMenu, e);
  };

  const handleProductRowClick = (product) => {
    handleRowClick(product, setSelectedProductDetails, setShowProductCard);
  };

  const toggleFilters = () => {
    toggleFiltersFn(setShowFilters);
  };

  const handleSelectForImageUpload = (id_product, e) => {
    handleSelectForImageUploadFn(id_product, setSelectedProductForImageUpload, setSelectedProducts, setActiveActionsMenu, e);
  };

  const handleBulkUpdate = () => {
    handleBulkUpdateFn(selectedProducts, products, handleUpdateProduct, setError, setShowErrorCard);
  };

  // ✨ UPDATE: Added function to handle package creation
  const handleCreatePackage = () => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para crear un paquete"
      }));
      setShowErrorCard(true);
      return;
    }

    if (selectedProducts.size > 5) {
      setError(prevError => ({
        ...prevError,
        productError: "Máximo 5 productos por paquete"
      }));
      setShowErrorCard(true);
      return;
    }

    try {
      // Get the selected product IDs as an array
      const selectedProductIds = Array.from(selectedProducts);

      // Initialize new package data object
      const packageData = {
        id_shop: selectedShop.id_shop,
        id_product1: selectedProductIds[0] || '',
        id_product2: selectedProductIds[1] || null,
        id_product3: selectedProductIds[2] || null,
        id_product4: selectedProductIds[3] || null,
        id_product5: selectedProductIds[4] || null,
        name_package: '',
        active_package: true
      };

      // Set the package data in context
      setNewPackageData(packageData);
      
      // Set isAddingPackage to true
      setIsAddingPackage(true);
      
      // Show the package creation form
      setShowPackageCreationForm(true);
      
      // Success message for log only
      console.log('Prepared package with selected products:', selectedProductIds);
    } catch (error) {
      console.error('Error preparing package creation:', error);
      setError(prevError => ({
        ...prevError,
        productError: "Error al preparar la creación del paquete"
      }));
      setShowErrorCard(true);
    }
  };

  // UPDATE: Enhanced product fetching with better error handling and state management
  useEffect(() => {
    const loadProducts = async () => {
      console.log('ShopProductsList - Fetching products for shop:', selectedShop?.id_shop);
      if (selectedShop?.id_shop) {
        try {
          const fetchedProducts = await fetchProductsByShop();
          console.log(`Loaded ${fetchedProducts?.length || 0} products for shop ${selectedShop.id_shop}`);
          
          // 🌟 UPDATE: Set visible to true once products are loaded
          setIsVisible(true);
        } catch (error) {
          console.error('Error loading products:', error);
          setError(prevError => ({
            ...prevError,
            productError: "Error al cargar los productos"
          }));
          setShowErrorCard(true);
        }
      }
    };
    
    loadProducts();
  }, [selectedShop, productListKey, fetchProductsByShop, setError, setShowErrorCard]);

  // UPDATE: Improved product filtering with active status check and explicit dependencies
  useEffect(() => {
    if (!Array.isArray(products)) {
      console.log('Products is not an array:', products);
      setDisplayedProducts([]);
      return;
    }

    console.log(`Filtering ${products.length} products with current filters and search term`);
    
    // First apply filters
    let filtered = filterProducts(products, filters);
    
    // Then apply search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => {
        //update: Add category name search capability
        const categoryName = categories?.find(cat => cat.id_category === product.id_category)?.name_category || '';
        
        // Search in all text and number fields (convert numbers to strings)
        return (
          (product.name_product && product.name_product.toLowerCase().includes(term)) || 
          (product.type_product && product.type_product.toLowerCase().includes(term)) ||
          (product.subtype_product && product.subtype_product.toLowerCase().includes(term)) ||
          (categoryName && categoryName.toLowerCase().includes(term)) ||
          (product.info_product && product.info_product.toLowerCase().includes(term)) ||
          (product.country_product && product.country_product.toLowerCase().includes(term)) ||
          (product.locality_product && product.locality_product.toLowerCase().includes(term)) ||
          (product.season_product && product.season_product.toLowerCase().includes(term)) ||
          (product.price_product && product.price_product.toString().includes(term)) ||
          (product.discount_product && product.discount_product.toString().includes(term)) ||
          (product.sold_product && product.sold_product.toString().includes(term)) ||
          (product.surplus_product && product.surplus_product.toString().includes(term))
        );
      });
    }
    
    // UPDATE: Only filter out inactive products if mostrar_inactivos is not enabled
    if (filters.mostrar_inactivos !== 'Sí') {
      filtered = filtered.filter(product => product.active_product === true || product.active_product === 1);
    }
    
    console.log(`Displaying ${filtered.length} products after filtering`);
    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  }, [products, filters, searchTerm, filterProducts, setFilteredProducts, categories]);

  // Deletion handler
  useEffect(() => {
    // Only run if isAccepted changes to true and we're not already in the middle of deletion
    if (isAccepted && !deletionInProgress.current) {
      const handleConfirmedDelete = async () => {
        try {
          // Set flag to prevent duplicate deletions
          deletionInProgress.current = true;
          
          // Clear any existing success messages
          setSuccess(prev => ({
            ...prev,
            productSuccess: '',
            createSuccess: '',
            updateSuccess: '',
            deleteSuccess: ''
          }));
          
          console.log('Beginning product deletion process');
          
          if (productToDelete) {
            // Store current product ID being deleted to avoid re-processing
            currentDeletingProduct.current = productToDelete;
            console.log('Deleting single product with ID:', productToDelete);
            
            const result = await deleteProduct(productToDelete);
            console.log('Delete API result:', result);
            
            if (result.success) {
              console.log('Product deleted successfully, fetching updated product list');
              
              // First fetch updated products
              await fetchProductsByShop();
              
              // Set a success message for deletion
              setSuccess(prev => ({
                ...prev,
                deleteSuccess: "Producto eliminado." 
              }));
              setShowSuccessCard(true);
              
              // Refresh UI
              refreshProductList();
            } else {
              console.error('Product deletion failed:', result.message);
              setError(prevError => ({
                ...prevError,
                productError: result.message || "Error al eliminar el producto"
              }));
            }
          } else if (selectedProducts.size > 0) {
            // Bulk deletion
            console.log('Performing bulk deletion of products');
            const bulkResult = await bulkDeleteProducts();
            
            if (bulkResult.success) {
              console.log(`Bulk deletion successful: ${bulkResult.successCount} products deleted`);
              
              // Set success message for bulk deletion
              setSuccess(prev => ({
                ...prev,
                deleteSuccess: `${bulkResult.successCount} productos eliminados.`
              }));
              setShowSuccessCard(true);
              
              // Refresh product list
              refreshProductList();
            } else {
              console.error('Bulk deletion failed:', bulkResult.message);
            }
          }
        } catch (error) {
          console.error('Error during product deletion process:', error);
          setError(prevError => ({
            ...prevError,
            productError: "Error al eliminar el producto: " + (error.message || "Error desconocido")
          }));
        } finally {
          // Reset all delete-related state
          setProductToDelete(null);
          setIsAccepted(false);
          clearError();
          
          // Reset our deletion flags
          deletionInProgress.current = false;
          currentDeletingProduct.current = null;
        }
      };

      handleConfirmedDelete();
    }
  }, [isAccepted, productToDelete, selectedProducts, deleteProduct, bulkDeleteProducts, fetchProductsByShop, refreshProductList, setSuccess, setError, setProductToDelete, setIsAccepted, clearError, setShowSuccessCard]);

  // Handle deletion cancellation
  useEffect(() => {
    if (isDeclined) {
      setProductToDelete(null);
      setIsDeclined(false);
      clearError();
      
      // Reset deletion flags on cancel
      deletionInProgress.current = false;
      currentDeletingProduct.current = null;
    }
  }, [isDeclined, setProductToDelete, setIsDeclined, clearError]);

  // Handle clicks outside active menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close menu if clicking outside of an actions cell
      if (activeActionsMenu !== null && !event.target.closest(`.${styles.actionsCellWrapper}`)) {
        setActiveActionsMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionsMenu]);

  if (!selectedShop) {
    console.log('No shop selected in ShopProductsList');
    return <NoShopSelected setShowProductManagement={setShowProductManagement} />;
  }
  
  // 🔄 UPDATE: If showPackages is true, render the ShopPackagesList component
  if (showPackages) {
    return (
      <ShopPackagesList 
        onBack={() => setShowPackages(false)} // Function to return to products view
      />
    );
  }

  return (
    <>
      <ConfirmationModal 
        isOpen={isModalOpen}
        onConfirm={() => {
          setIsModalOpen(false);
          setIsAccepted(true);
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setIsDeclined(true);
        }}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImageForModal(null);
        }}
        imageUrl={selectedImageForModal}
        altText="Product full size image"
      />

      {showProductCard && selectedProductDetails && (
        <ProductCard 
          onClose={() => {
            setShowProductCard(false);
            setSelectedProductDetails(null);
          }} 
        />
      )}

      {contentTransition((style, item) => 
        item && (
          <animated.div style={style} className={styles.container}>
            {/* 🌟 UPDATE: Animated ShopCard */}
            {shopCardTransition((cardStyle, shop) => 
              shop && (
                <animated.div style={cardStyle} className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
                  <ShopCard shop={selectedShop} />
                </animated.div>
              )
            )}

            <div className={styles.listHeaderTop}>
              <div className={styles.listTitleWrapper}>
                <h1 className={styles.listTitle}>Lista de Productos</h1>
              </div>
              
              {/*update: Mobile layout with search bar and burger menu */}
              {isSmallScreen ? (
                <div className={styles.searchAndMenuContainer}>
                  <SearchBar 
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                  />
                  
                  <ActionButtons 
                    handleAddProduct={handleAddProduct}
                    handleBulkUpdate={handleBulkUpdate}
                    handleBulkDelete={handleBulkDelete}
                    handleCreatePackage={handleCreatePackage}
                    toggleFilters={toggleFilters}
                    showFilters={showFilters}
                    selectedProducts={selectedProducts}
                    activeFiltersCount={activeFiltersCount}
                    navigateToPackages={() => setShowPackages(true)}
                    isMobile={true}
                  />
                </div>
              ) : (
                <>
                  {/*update: Desktop layout */}
                  <SearchBar 
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                  />
                  
                  <div className={styles.buttonGroupContainer}>
                    <ActionButtons 
                      handleAddProduct={handleAddProduct}
                      handleBulkUpdate={handleBulkUpdate}
                      handleBulkDelete={handleBulkDelete}
                      handleCreatePackage={handleCreatePackage}
                      toggleFilters={toggleFilters}
                      showFilters={showFilters}
                      selectedProducts={selectedProducts}
                      activeFiltersCount={activeFiltersCount}
                      navigateToPackages={() => setShowPackages(true)}
                      isMobile={false}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Pass searchTerm and setSearchTerm to FiltersForProducts */}
            {showFilters && <FiltersForProducts isVisible={showFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onResetFilters={handleResetAllFilters} />}
            
            {displayedProducts.length === 0 ? (
              /* Use the NoProductsMessage component */
              <NoProductsMessage products={products} />
            ) : (       
              <div className={styles.tableContainer}>
                {/* Use the ProductsCount component */}
                <ProductsCount 
                  displayedProducts={displayedProducts}
                  selectedProducts={selectedProducts}
                />
                
                {/* Use the ProductsTable component */}
                <ProductsTable 
                  displayedProducts={displayedProducts}
                  selectedProducts={selectedProducts}
                  formatDate={formatDate}
                  formatSecondHand={formatSecondHand}
                  handleProductRowClick={handleProductRowClick}
                  activeActionsMenu={activeActionsMenu}
                  toggleActionsMenu={toggleActionsMenu}
                  handleUpdateProduct={handleUpdateProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  handleSelectProduct={handleSelectProduct}
                  handleSelectForImageUpload={handleSelectForImageUpload}
                  handleToggleActiveStatus={handleToggleActiveStatus}
                  handleProductImageDoubleClick={handleProductImageDoubleClick}
                  currentDeletingProduct={currentDeletingProduct}
                  //update: Pass categories and subcategories to ProductsTable
                  categories={categories}
                  subcategories={Object.values(allSubcategories)}
                />
              </div>
            )}
          </animated.div>
        )
      )}
    </>
  );
};

export default ShopProductsList;