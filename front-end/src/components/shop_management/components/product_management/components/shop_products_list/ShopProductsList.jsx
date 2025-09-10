// front-end/src/components/shop_management/components/product_management/components/shop_products_list/ShopProductsList.jsx
import { useEffect, useState, useRef } from 'react';
import { useUI } from '../../../../../../../src/app_context/UIContext.jsx';
import { useShop } from '../../../../../../../src/app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../../src/app_context/ProductContext.jsx';
import { usePackage } from '../../../../../../../src/app_context/PackageContext.jsx';
import { useAuth } from '../../../../../../../src/app_context/AuthContext.jsx';
import ShopPackagesList from './components/shop_packages_list/ShopPackagesList.jsx';
import PackageCreationForm from '../shop_products_list/components/package_creation_form/PackageCreationForm.jsx';
import ShopProductsListUtils from './ShopProductsListUtils.jsx';
import FiltersForProducts from '../../../../../filters_for_products/FiltersForProducts.jsx';
import ProductCategoryManagementForm from './components/ProductCategoryManagementForm.jsx';

import styles from '../../../../../../../../public/css/ShopProductsList.module.css';
import ImageModal from '../../../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import ShopCard from '../../../shop_card/ShopCard.jsx';
import ConfirmationModal from '../../../../../confirmation_modal/ConfirmationModal.jsx';
import useFiltersForProducts from '../../../../../filters_for_products/FiltersForProductsUtils.jsx';

import SearchBar from './components/SearchBar.jsx';
//update: Import new UnifiedActionsMenu instead of ActionButtons
import UnifiedActionsMenu from './components/UnifiedActionsMenu.jsx';
import NoProductsMessage from './components/NoProductsMessage.jsx';
import NoShopSelected from './components/NoShopSelected.jsx';
import useScreenSize from '../../../shop_card/components/useScreenSize.js';

// Import icons for the card view
import { 
  ShoppingBag, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Image,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
  MapPin,
  Calendar,
  Star,
  Package,
  DollarSign,
  Search,
  Info,
  Clock,
  Check,
  CheckCircle,
  Layers,
  MoreVertical,
  Layers2,
  //update: Import ArrowLeft icon for back button
  ArrowLeft
} from 'lucide-react';

// Import image utility
import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';

// Import React Spring for animations
import { useTransition, animated } from '@react-spring/web';
import { formAnimation, fadeInScale } from '../../../../../../utils/animation/transitions.js';

const ShopProductsList = () => {
  const { currentUser } = useAuth();
  
  // UI context
  const {
    clearError, setError, setShowProductManagement,
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    modalMessage, setModalMessage,
    modalConfirmCallback, setModalConfirmCallback,
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
    refreshProductList,
    categories,
    subcategories,
    fetchSubcategoriesByCategory
  } = useProduct();

  // Package context
  const {
    setNewPackageData,
    initNewPackageData,
    setShowPackageCreationForm,
    setIsAddingPackage,
    showPackageCreationForm,
    isAddingPackage
  } = usePackage();

  const [showProductCard, setShowProductCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionsMenu, setActiveActionsMenu] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(null);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [activeProductMenu, setActiveProductMenu] = useState(null);
  
  // Get screen size for responsive behavior
  const isSmallScreen = useScreenSize(768);
  
  // Use the hook from FiltersForProductsUtils for consistent counting
  const { getActiveFiltersCount, handleResetFilters } = useFiltersForProducts();
  
  // Get the function to get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Add a ref to track deletion in progress
  const deletionInProgress = useRef(false);
  
  // Add a ref to track what product we're deleting
  const currentDeletingProduct = useRef(null);

  // Add visibility state for component animation
  const [isVisible, setIsVisible] = useState(true);
  
  // Add state to control showing packages list
  const [showPackages, setShowPackages] = useState(false);
  
  const [productForAction, setProductForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete' or 'toggle'

  // Get all Utils from ShopProductsListUtils
  const {
    filterProducts,
    fetchProductsByShop,
    deleteProduct,
    bulkDeleteProducts,
    confirmBulkDelete,
    handleSelectProduct,
    handleDeleteProduct: handleDeleteProductUtil,
    handleBulkDelete: handleBulkDeleteUtil,
    handleAddProduct,
    handleUpdateProduct,
    handleToggleActiveStatus: handleToggleActiveStatusUtil,
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
    allSubcategories
  } = ShopProductsListUtils();

  //update: Add function to handle back to ShopsListBySeller
  const handleBackToShopsListBySeller = () => {
    console.log('Navigating from ShopProductsList back to ShopsListBySeller');
    setShowProductManagement(false);
    // The ShopsListBySeller component will be shown automatically by ShopManagement
  };

  // Create animation transitions using React Spring
  const contentTransition = useTransition(isVisible, {
    ...formAnimation,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });

  // Create separate transition for ShopCard
  const shopCardTransition = useTransition(isVisible && selectedShop, {
    ...fadeInScale,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });
  
  // Animation for products list
  const productsTransition = useTransition(displayedProducts, {
    from: { opacity: 0, transform: 'scale(0.9)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.9)' },
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    },
    keys: item => item.id_product
  });

  // Toggle expanded state for a product
  const toggleExpanded = (productId) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Toggle product menu
  const toggleProductMenu = (productId, e) => {
    e.stopPropagation();
    if (activeProductMenu === productId) {
      setActiveProductMenu(null);
    } else {
      setActiveProductMenu(productId);
    }
  };

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
  
  // Handle delete product with confirmation modal
  const handleDeleteProduct = (product) => {
    console.log('handleDeleteProduct called with product:', product);
    setProductForAction(product);
    setActionType('delete');
    setModalMessage(`¿Estás seguro de que deseas eliminar el producto "${product.name_product}"?`);
    setModalConfirmCallback(() => async (confirmed) => {
      if (confirmed) {
        console.log('User confirmed deletion, proceeding...');
        try {
          const result = await deleteProduct(product.id_product);
          console.log('Delete result:', result);
          
          if (result.success) {
            // Show success message
            setSuccess(prev => ({
              ...prev,
              deleteSuccess: result.message || 'Producto eliminado correctamente',
              productSuccess: '',
              createSuccess: '',
              updateSuccess: ''
            }));
            setShowSuccessCard(true);
            
            // Refresh the product list
            await fetchProductsByShop();
            refreshProductList();
            
            // Clear selected products if needed
            if (selectedProducts.has(product.id_product)) {
              setSelectedProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id_product);
                return newSet;
              });
            }
          } else {
            // Show error message
            console.error('Delete failed:', result.message);
            setError(prevError => ({
              ...prevError,
              productError: result.message || 'Error al eliminar el producto'
            }));
            setShowErrorCard(true);
          }
        } catch (error) {
          console.error('Exception during deletion:', error);
          setError(prevError => ({
            ...prevError,
            productError: error.message || 'Error al eliminar el producto'
          }));
          setShowErrorCard(true);
        }
      } else {
        console.log('User cancelled deletion');
      }
      setProductForAction(null);
      setActionType(null);
    });
    setIsModalOpen(true);
  };
  
  // Toggle product active status with confirmation modal
  const handleToggleActiveStatus = (product) => {
    console.log('handleToggleActiveStatus called with product:', product);
    const action = product.active_product ? 'desactivar' : 'activar';
    setProductForAction(product);
    setActionType('toggle');
    setModalMessage(`¿Estás seguro de que deseas ${action} el producto "${product.name_product}"?`);
    setModalConfirmCallback(() => async (confirmed) => {
      if (confirmed) {
        try {
          setIsTogglingStatus(product.id_product);
          
          const result = await handleToggleActiveStatusUtil(product.id_product);
          
          if (result.success) {
            await fetchProductsByShop();
            refreshProductList();
          }
        } finally {
          setIsTogglingStatus(null);
        }
      }
      setProductForAction(null);
      setActionType(null);
    });
    setIsModalOpen(true);
  };

  // Handle bulk delete with confirmation modal
  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para eliminar"
      }));
      setShowErrorCard(true);
      return;
    }

    setModalMessage(`¿Estás seguro que deseas eliminar ${selectedProducts.size} producto${selectedProducts.size > 1 ? 's' : ''}?`);
    setModalConfirmCallback(() => async (confirmed) => {
      if (confirmed) {
        const result = await bulkDeleteProducts();
        if (result.success) {
          // Success is already handled in bulkDeleteProducts
        }
      }
    });
    setIsModalOpen(true);
  };

  // Handle package creation
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
      const selectedProductIds = Array.from(selectedProducts);

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

      setNewPackageData(packageData);
      setIsAddingPackage(true);
      setShowPackageCreationForm(true);
      
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
  
  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories || categories.length === 0) {
      return null;
    }
    const category = categories.find(cat => cat.id_category === categoryId);
    return category ? category.name_category : null;
  };
  
  // Helper function to get subcategory name
  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId || !allSubcategories) {
      return null;
    }
    return allSubcategories[subcategoryId]?.name_subcategory || null;
  };
  
  // Calculate discount price
  const calculateDiscountPrice = (price, discount) => {
    if (!discount || discount <= 0) return null;
    const discountAmount = (price * discount) / 100;
    return price - discountAmount;
  };

  // Enhanced product fetching with better error handling and state management
  useEffect(() => {
    const loadProducts = async () => {
      console.log('ShopProductsList - Fetching products for shop:', selectedShop?.id_shop);
      if (selectedShop?.id_shop) {
        try {
          setIsLoading(true);
          const fetchedProducts = await fetchProductsByShop();
          console.log(`Loaded ${fetchedProducts?.length || 0} products for shop ${selectedShop.id_shop}`);
          setIsVisible(true);
        } catch (error) {
          console.error('Error loading products:', error);
          setError(prevError => ({
            ...prevError,
            productError: "Error al cargar los productos"
          }));
          setShowErrorCard(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadProducts();
  }, [selectedShop, productListKey, fetchProductsByShop, setError, setShowErrorCard]);

  // Improved product filtering with active status check and explicit dependencies
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
        const categoryName = getCategoryName(product.id_category);
        
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
    
    // Only filter out inactive products if mostrar_inactivos is not enabled
    if (filters.mostrar_inactivos !== 'Sí') {
      filtered = filtered.filter(product => product.active_product === true || product.active_product === 1);
    }
    
    console.log(`Displaying ${filtered.length} products after filtering`);
    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  }, [products, filters, searchTerm, filterProducts, setFilteredProducts, categories, allSubcategories]);

  // Handle clicks outside active menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeActionsMenu !== null && !event.target.closest(`.${styles.actionsCellWrapper}`)) {
        setActiveActionsMenu(null);
      }
      // Also close product menu
      if (activeProductMenu !== null && !event.target.closest(`.${styles.productActionMenu}`)) {
        setActiveProductMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionsMenu, activeProductMenu]);

  useEffect(() => {
    if (isAccepted || isDeclined) {
      // Reset states after modal action is processed
      setIsAccepted(false);
      setIsDeclined(false);
    }
  }, [isAccepted, isDeclined, setIsAccepted, setIsDeclined]);

  if (!selectedShop) {
    console.log('No shop selected in ShopProductsList');
    return <NoShopSelected setShowProductManagement={setShowProductManagement} />;
  }
  
  // Check if we should show the PackageCreationForm
  if (showPackageCreationForm && isAddingPackage) {
    return <PackageCreationForm />;
  }
  
  // If showPackages is true, render the ShopPackagesList component
  if (showPackages) {
    return (
      <ShopPackagesList 
        onBack={() => setShowPackages(false)}
      />
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <ShoppingBag size={48} className={styles.loadingIcon} />
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal />

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

      {showCategoryManagement && (
        <ProductCategoryManagementForm 
          onClose={() => {
            setShowCategoryManagement(false);
            // Refresh categories after closing
            fetchProductsByShop();
          }} 
        />
      )}

      {contentTransition((style, item) => 
        item && (
          <animated.div style={style} className={styles.container}>
            {/*update: Add back button at the top of the container */}
            <div className={styles.backButtonContainer}>
              <button 
                onClick={handleBackToShopsListBySeller}
                className={styles.backButton}
                title="Volver a la lista de tiendas"
              >
                <ArrowLeft size={20} />
                <span> tiendas</span>
              </button>
            </div>
            
            {shopCardTransition((cardStyle, shop) => 
              shop && (
                <animated.div style={cardStyle} className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
                  <ShopCard shop={selectedShop} />
                </animated.div>
              )
            )}

            <div className={styles.listHeaderTop}>
              <div className={styles.listTitleWrapper}>
                <p className={styles.listTitle}>Administra los productos de tu comercio</p>
              </div>
              
              {isSmallScreen ? (
                <div className={styles.searchAndMenuContainer}>
                  <div className={styles.searchContainer}>
                    <Search size={20} color='lightgray'></Search>
                    <SearchBar 
                      searchTerm={searchTerm}
                      handleSearchChange={handleSearchChange}
                    />
                  </div>
                  
                  {/*update: Use UnifiedActionsMenu instead of ActionButtons and separate category button */}
                  <UnifiedActionsMenu 
                    handleAddProduct={handleAddProduct}
                    handleBulkUpdate={handleBulkUpdate}
                    handleBulkDelete={handleBulkDelete}
                    handleCreatePackage={handleCreatePackage}
                    toggleFilters={toggleFilters}
                    showFilters={showFilters}
                    selectedProducts={selectedProducts}
                    activeFiltersCount={activeFiltersCount}
                    navigateToPackages={() => setShowPackages(true)}
                    showCategoryManagement={() => setShowCategoryManagement(true)}
                    currentUser={currentUser}
                  />
                </div>
              ) : (
                <>
                  <SearchBar 
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                  />
                  
                  <div className={styles.buttonGroupContainer}>
                    {/*update: Use UnifiedActionsMenu for desktop as well */}
                    <UnifiedActionsMenu 
                      handleAddProduct={handleAddProduct}
                      handleBulkUpdate={handleBulkUpdate}
                      handleBulkDelete={handleBulkDelete}
                      handleCreatePackage={handleCreatePackage}
                      toggleFilters={toggleFilters}
                      showFilters={showFilters}
                      selectedProducts={selectedProducts}
                      activeFiltersCount={activeFiltersCount}
                      navigateToPackages={() => setShowPackages(true)}
                      showCategoryManagement={() => setShowCategoryManagement(true)}
                      currentUser={currentUser}
                    />
                  </div>
                </>
              )}
            </div>

            {/*update: Pass onClose prop to FiltersForProducts to allow closing */}
            {showFilters && (
              <FiltersForProducts 
                isVisible={showFilters} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                onResetFilters={handleResetAllFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
            
            {displayedProducts.length === 0 ? (
              <NoProductsMessage products={products} />
            ) : (       
              <div className={styles.productsContainer}>
                <div className={styles.header}>
                  <p className={styles.title}>
                    Productos ({displayedProducts.length})
                    {selectedProducts.size > 0 && ` | Seleccionados: ${selectedProducts.size}`}
                  </p>
                </div>
                
                <div className={styles.productsList}>
                  {productsTransition((style, product, _, index) => (
                    <animated.div 
                      style={{
                        ...style,
                        //update: Elevate z-index when menu is open for this product
                        zIndex: activeProductMenu === product.id_product ? 9999 : 'auto',
                        position: 'relative'
                      }} 
                      className={`${styles.productCard} ${selectedProducts.has(product.id_product) ? styles.selected : ''}`}
                      key={product.id_product}
                    >
                      {/* Simplified product card header */}
                      <div className={styles.productCardHeader}>
                        <div className={styles.productNumber}>
                          {displayedProducts.findIndex(p => p.id_product === product.id_product) + 1}
                        </div>
                        
                        <h4 className={styles.productName}>{product.name_product || 'Producto sin nombre'}</h4>
                        
                        <span className={styles.productPrice}>
                          €{product.discount_product > 0 
                            ? calculateDiscountPrice(product.price_product, product.discount_product).toFixed(2)
                            : product.price_product}
                        </span>
                        
                        {/* Burger menu for actions */}
                        <div className={styles.productActionMenu}>
                          <button
                            onClick={(e) => toggleProductMenu(product.id_product, e)}
                            className={`${styles.burgerMenuButton} ${activeProductMenu === product.id_product ? styles.active : ''}`}
                            title="Acciones"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeProductMenu === product.id_product && (
                            <div className={styles.actionDropdown}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActiveStatus(product);
                                  setActiveProductMenu(null);
                                }}
                                className={styles.dropdownItem}
                                disabled={isTogglingStatus === product.id_product}
                              >
                                {product.active_product ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                <span>{product.active_product ? 'Desactivar' : 'Activar'}</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateProduct(product.id_product);
                                  setActiveProductMenu(null);
                                }}
                                className={styles.dropdownItem}
                              >
                                <Edit2 size={16} />
                                <span>Editar</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(product);
                                  setActiveProductMenu(null);
                                }}
                                className={`${styles.dropdownItem} ${styles.deleteItem}`}
                              >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProduct(product.id_product);
                                  setActiveProductMenu(null);
                                }}
                                className={`${styles.dropdownItem} ${selectedProducts.has(product.id_product) ? styles.selectedItem : ''}`}
                              >
                                {selectedProducts.has(product.id_product) ? <CheckCircle size={16} /> : <Check size={16} />}
                                <span>{selectedProducts.has(product.id_product) ? 'Deseleccionar' : 'Seleccionar'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Expand button stays separate */}
                        <button
                          onClick={() => toggleExpanded(product.id_product)}
                          className={styles.expandButton}
                          title={expandedProducts.has(product.id_product) ? 'Contraer' : 'Expandir'}
                        >
                          {expandedProducts.has(product.id_product) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                      
                      {/* All detailed information moved to expanded section */}
                      {expandedProducts.has(product.id_product) && (
                        <div className={styles.productDetails}>
                          {/* Product image section */}
                          {product.image_product && (
                            <div 
                              className={styles.productImageExpanded}
                              onClick={() => {
                                setSelectedImageForModal(formatImageUrl(product.image_product));
                                setIsImageModalOpen(true);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <img 
                                src={formatImageUrl(product.image_product)} 
                                alt={product.name_product || 'Producto'}
                                className={styles.productImage}
                                onError={(e) => {
                                  console.error('Error loading product image:', product.image_product);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className={styles.imageOverlay}>
                                <Image size={16} />
                              </div>
                            </div>
                          )}
                          
                          {/* Status and badges */}
                          <div className={styles.badgesContainer}>
                            <span className={`${styles.statusBadge} ${product.active_product ? styles.active : styles.inactive}`}>
                              {product.active_product ? 'Activo' : 'Inactivo'}
                            </span>
                            
                            {product.discount_product > 0 && (
                              <>
                                <span className={styles.discountBadge}>
                                  <Tag size={12} />
                                  {product.discount_product}% dto
                                </span>
                                <span className={styles.originalPrice}>€{product.price_product}</span>
                              </>
                            )}
                            
                            {product.second_hand && (
                              <span className={styles.secondHandBadge}>
                                2ª Mano
                              </span>
                            )}
                            
                            <span className={styles.categoryBadge}>
                              {getCategoryName(product.id_category) || product.type_product || 'Sin categoría'}
                            </span>
                          </div>
                          
                          {/* Main details section */}
                          <div className={styles.detailsSection}>
                            <h5 className={styles.sectionTitle}>Información del Producto</h5>
                            <div className={styles.detailsGrid}>
                              
                              {product.info_product && (
                                <div className={styles.detailItem}>
                                  <Info size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Descripción:</span>
                                  <span className={styles.detailValue}>{product.info_product}</span>
                                </div>
                              )}
                              
                              {getSubcategoryName(product.id_subcategory) && (
                                <div className={styles.detailItem}>
                                  <Tag size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Subcategoría:</span>
                                  <span className={styles.detailValue}>{getSubcategoryName(product.id_subcategory)}</span>
                                </div>
                              )}
                              
                              {product.season_product && (
                                <div className={styles.detailItem}>
                                  <Calendar size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Temporada:</span>
                                  <span className={styles.detailValue}>{product.season_product}</span>
                                </div>
                              )}
                              
                              {(product.country_product || product.locality_product) && (
                                <div className={styles.detailItem}>
                                  <MapPin size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Origen:</span>
                                  <span className={styles.detailValue}>
                                    {product.country_product}
                                    {product.locality_product && `, ${product.locality_product}`}
                                  </span>
                                </div>
                              )}
                              
                              {product.sold_product > 0 && (
                                <div className={styles.detailItem}>
                                  <DollarSign size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Vendidos:</span>
                                  <span className={styles.detailValue}>{product.sold_product}</span>
                                </div>
                              )}
                              
                              {product.surplus_product > 0 && (
                                <div className={styles.detailItem}>
                                  <Package size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Excedente:</span>
                                  <span className={styles.detailValue}>{product.surplus_product}</span>
                                </div>
                              )}
                              
                              {product.calification_product > 0 && (
                                <div className={styles.detailItem}>
                                  <Star size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Calificación:</span>
                                  <span className={styles.detailValue}>{product.calification_product}/5</span>
                                </div>
                              )}
                              
                              {product.expiration_product && (
                                <div className={styles.detailItem}>
                                  <Clock size={14} className={styles.detailIcon} />
                                  <span className={styles.detailLabel}>Caducidad:</span>
                                  <span className={styles.detailValue}>{formatDate(product.expiration_product)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={styles.productFooter}>
                            <span className={styles.productId}>ID: {product.id_product}</span>
                            <span className={styles.creationDate}>
                              Creado: {new Date(product.creation_product).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      )}
                    </animated.div>
                  ))}
                </div>
              </div>
            )}
          </animated.div>
        )
      )}
    </>
  );
};

export default ShopProductsList;