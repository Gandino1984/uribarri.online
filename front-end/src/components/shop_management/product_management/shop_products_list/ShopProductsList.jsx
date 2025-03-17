import React, { useEffect, useContext, useState, useRef } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import ShopProductsListFunctions from './ShopProductsListFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';
import { ArrowLeft } from 'lucide-react';
import styles from '../../../../../../public/css/ShopProductsList.module.css';
import ProductImage from '../product_image/ProductImage.jsx';
import ImageModal from '../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import ShopCard from '../../shop_card/ShopCard.jsx'; 
import ConfirmationModal from '../../../confirmation_modal/ConfirmationModal.jsx';
import ProductManagementFunctions from '../ProductManagementFunctions.jsx';
import useFiltersForProducts from '../../../filters_for_products/FiltersForProductsFunctions.jsx';
// import { useSpring, animated } from 'react-spring';

// UPDATE: Import new component files
import SearchBar from './components/SearchBar.jsx';
import ActionButtons from './components/ActionButtons.jsx';
import ProductsCount from './components/ProductsCount.jsx';
import NoProductsMessage from './components/NoProductsMessage.jsx';
import NoShopSelected from './components/NoShopSelected.jsx';
import ProductsTable from './components/ProductsTable.jsx';

const ShopProductsList = () => {
  const {
    currentUser,
    products,
    selectedShop,
    filters,
    filteredProducts, setFilteredProducts,
    selectedProducts, setSelectedProducts,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    clearError, setError,
    isImageModalOpen, setIsImageModalOpen,
    productToDelete, setProductToDelete,
    selectedImageForModal, setSelectedImageForModal,
    selectedProductDetails, setSelectedProductDetails,
    setSelectedProductForImageUpload,
    isModalOpen, setIsModalOpen,
    setModalMessage,
    productListKey,
    setShowProductManagement,
    setshowShopManagement,
    refreshProductList,
    success, setSuccess,
    setShowSuccessCard,
    setShowErrorCard
  } = useContext(AppContext);

  const [contentVisible, setContentVisible] = useState(false);
  const [showProductCard, setShowProductCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
  // State to manage filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State to track which product's actions menu is active (for mobile)
  const [activeActionsMenu, setActiveActionsMenu] = useState(null);
  
  // Use the hook from FiltersForProductsFunctions for consistent counting
  const { getActiveFiltersCount, handleResetFilters } = useFiltersForProducts();
  
  // Use the function to get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  
  // Add a ref to track deletion in progress
  const deletionInProgress = useRef(false);
  // Add a ref to track what product we're deleting
  const currentDeletingProduct = useRef(null);

  // UPDATE: Get all functions from ShopProductsListFunctions
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
    handleBulkUpdate: handleBulkUpdateFn
  } = ShopProductsListFunctions();

  // UPDATE: Wrapper functions to pass the required state
  const handleBack = () => {
    setShowProductManagement(false);
  };

  // UPDATE: Wrapper functions that use the ones from ShopProductsListFunctions
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('ShopProductsList - Fetching products for shop:', selectedShop?.id_shop);
    if (selectedShop?.id_shop) {
      fetchProductsByShop();
    }
  }, [selectedShop, productListKey]); 

  // Update displayed products based on search and filters
  useEffect(() => {
    if (!Array.isArray(products)) {
      console.log('Products is not an array:', products);
      setDisplayedProducts([]);
      return;
    }

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
    
    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  }, [products, filters, searchTerm]);

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
  }, [isAccepted]);

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
  }, [isDeclined]);

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
    // UPDATE: Use the NoShopSelected component
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

        {selectedShop && <ShopCard shop={selectedShop} />}
            <div className={styles.listHeaderTop}>
              <div className={styles.listTitleWrapper}>
                <h1 className={styles.listTitle}>Lista de Productos</h1>
              </div>
              <div className={styles.buttonGroup}>
                {/* UPDATE: Use the SearchBar component */}
                <SearchBar 
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange}
                />
                
                {/* UPDATE: Use the ActionButtons component */}
                <ActionButtons 
                  handleAddProduct={handleAddProduct}
                  handleBulkUpdate={handleBulkUpdate}
                  handleBulkDelete={handleBulkDelete}
                  toggleFilters={toggleFilters}
                  showFilters={showFilters}
                  selectedProducts={selectedProducts}
                  activeFiltersCount={activeFiltersCount}
                  // filterButtonAnimation={filterButtonAnimation}
                />
              </div>
            </div>
        

        {/* Pass searchTerm and setSearchTerm to FiltersForProducts */}
        {showFilters && <FiltersForProducts isVisible={showFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onResetFilters={handleResetAllFilters} />}
        
        {displayedProducts.length === 0 ? (
          /* UPDATE: Use the NoProductsMessage component */
          <NoProductsMessage products={products} />
        ) : (       
          <div className={styles.tableContainer}>
            {/* UPDATE: Use the ProductsCount component */}
            <ProductsCount 
              displayedProducts={displayedProducts}
              selectedProducts={selectedProducts}
            />
            
            {/* UPDATE: Use the ProductsTable component */}
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
              handleProductImageDoubleClick={handleProductImageDoubleClick}
              currentDeletingProduct={currentDeletingProduct}
            />
          </div>
        )}
    </div>
  );
};

export default ShopProductsList;