import { useEffect, useState, useRef } from 'react';
import { useUI } from '../../../../../../../src/app_context/UIContext.jsx';
import { useShop } from '../../../../../../../src/app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../../src/app_context/ProductContext.jsx';
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
import useScreenSize from '../../../shop_card/components/useScreenSize.js'; // 🔄 UPDATE: Import useScreenSize hook for responsive behavior


const ShopProductsList = () => {
  // Auth context
  // const { currentUser } = useAuth();

  // UI context
  const {
    clearError, setError,
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    isImageModalOpen, setIsImageModalOpen,
    // setModalMessage,
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
    refreshProductList
  } = useProduct();

  const [showProductCard, setShowProductCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  // State to manage filter visibility
  const [showFilters, setShowFilters] = useState(false);
  // State to track which product's actions menu is active (for mobile)
  const [activeActionsMenu, setActiveActionsMenu] = useState(null);
  
  // 🔄 UPDATE: Get screen size for responsive behavior
  const isSmallScreen = useScreenSize(768);
  
  // Use the hook from FiltersForProductsUtils for consistent counting
  const { getActiveFiltersCount, handleResetFilters } = useFiltersForProducts();
  
  // Use the function to get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Add a ref to track deletion in progress
  const deletionInProgress = useRef(false);
  
  // Add a ref to track what product we're deleting
  const currentDeletingProduct = useRef(null);

  // Get all Utils from ShopProductsListUtils
  const {
    filterProducts,
    fetchProductsByShop,
    deleteProduct,
    bulkDeleteProducts,
    handleSelectProduct,
    handleDeleteProduct,
    handleBulkDelete,
    handleAddProduct,
    handleUpdateProduct,
    handleToggleActiveStatus,
    // getImageUrl,
    handleProductImageDoubleClick,
    formatDate,
    formatSecondHand,
    handleProductRowClick: handleRowClick,
    toggleFilters: toggleFiltersFn,
    toggleActionsMenu: toggleActionsMenuFn,
    handleSearchChange: handleSearchChangeFn,
    handleResetAllFilters: handleResetAllFiltersFn,
    handleSelectForImageUpload: handleSelectForImageUploadFn,
    handleBulkUpdate: handleBulkUpdateFn
  } = ShopProductsListUtils();

  // Wrapper Utils to pass the required state
  // const handleBack = () => {
  //   setShowProductManagement(false);
  // };

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

  // UPDATE: Enhanced product fetching with better error handling and state management
  useEffect(() => {
    const loadProducts = async () => {
      console.log('ShopProductsList - Fetching products for shop:', selectedShop?.id_shop);
      if (selectedShop?.id_shop) {
        try {
          const fetchedProducts = await fetchProductsByShop();
          console.log(`Loaded ${fetchedProducts?.length || 0} products for shop ${selectedShop.id_shop}`);
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
        // Search in all text and number fields (convert numbers to strings)
        return (
          (product.name_product && product.name_product.toLowerCase().includes(term)) || 
          (product.type_product && product.type_product.toLowerCase().includes(term)) ||
          (product.subtype_product && product.subtype_product.toLowerCase().includes(term)) ||
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
  }, [products, filters, searchTerm, filterProducts, setFilteredProducts]);

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
                deleteSuccess: "Producto eliminado exitosamente" 
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
                deleteSuccess: `${bulkResult.successCount} productos eliminados exitosamente`
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
    // Use the NoShopSelected component
    return <NoShopSelected setShowProductManagement={setShowProductManagement} />;
  }

  return (
    <div className={styles.container}>
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

        {/* 🔄 UPDATE: Wrap ShopCard in the same responsive container as in ShopsListBySeller */}
        {selectedShop && (
          <div className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
            <ShopCard shop={selectedShop} />
          </div>
        )}

        <div className={styles.listHeaderTop}>
          <div className={styles.listTitleWrapper}>
            <h1 className={styles.listTitle}>Lista de Productos</h1>
          </div>
          <div className={styles.buttonGroup}>
            {/* Use the SearchBar component */}
            <SearchBar 
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
            />
            
            {/* Use the ActionButtons component */}
            <ActionButtons 
              handleAddProduct={handleAddProduct}
              handleBulkUpdate={handleBulkUpdate}
              handleBulkDelete={handleBulkDelete}
              toggleFilters={toggleFilters}
              showFilters={showFilters}
              selectedProducts={selectedProducts}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
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
            />
          </div>
        )}
    </div>
  );
};

export default ShopProductsList;