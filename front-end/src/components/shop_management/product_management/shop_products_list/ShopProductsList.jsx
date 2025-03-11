import React, { useEffect, useContext, useState, useRef } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import ShopProductsListFunctions from './ShopProductsListFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';
import { 
  PackagePlus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  ImagePlus, 
  ArrowLeft, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ArrowRightFromLine,
  ArrowLeftFromLine 
} from 'lucide-react';
import styles from '../../../../../../public/css/ShopProductsList.module.css';
import ProductImage from '../product_image/ProductImage.jsx';
import ImageModal from '../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import { useSpring, animated } from '@react-spring/web';
import ShopCard from '../../shop_card/ShopCard.jsx'; 
import ConfirmationModal from '../../../confirmation_modal/ConfirmationModal.jsx';
import ProductManagementFunctions from '../ProductManagementFunctions.jsx';
import useFiltersForProducts from '../../../filters_for_products/FiltersForProductsFunctions.jsx';

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
  
  // Function to toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(prevState => !prevState);
  };
  
  // Function to toggle actions menu for a product
  const toggleActionsMenu = (productId, e) => {
    e.stopPropagation();
    if (activeActionsMenu === productId) {
      setActiveActionsMenu(null);
    } else {
      setActiveActionsMenu(productId);
    }
  };
  
  // Function to handle clicks outside active menu
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
  
  // Use the function to get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Animate the filter button
  const filterButtonAnimation = useSpring({
    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 10 }
  });
  
  // Add a ref to track deletion in progress
  const deletionInProgress = useRef(false);
  // Add a ref to track what product we're deleting
  const currentDeletingProduct = useRef(null);

  const {
    filterProducts,
    deleteProduct,
    bulkDeleteProducts,
    handleSelectProduct,
    handleDeleteProduct,
    handleBulkDelete,
    handleAddProduct,
    handleUpdateProduct,
    getImageUrl,
    handleProductImageDoubleClick,
    fetchProductsByShop
  } = ShopProductsListFunctions();

  const { fetchProductsByShop: fetchProducts } = ProductManagementFunctions();

  const handleBack = () => {
    setShowProductManagement(false);
  };

  const mainContentAnimation = useSpring({
    from: { transform: 'translateY(100px)', opacity: 0 },
    to: { 
      transform: contentVisible ? 'translateY(0px)' : 'translateY(100px)', 
      opacity: contentVisible ? 1 : 0 
    },
    config: { tension: 280, friction: 20 },
  });

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Custom reset filters handler that also clears the search term
  const handleResetAllFilters = () => {
    // First reset the filters using the function from FiltersForProductsFunctions
    handleResetFilters();
    
    // Then clear the search term in this component
    setSearchTerm('');
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

  // Completely rewritten deletion handler to prevent multiple deletion attempts
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

  const handleProductRowClick = (product) => {
    setSelectedProductDetails(product);
    setShowProductCard(true);
  };

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

  const formatSecondHand = (value) => {
    return value ? 'Sí' : 'No';
  };

  const handleSelectForImageUpload = (id_product, e) => {
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

  // Handler for bulk update button
  const handleBulkUpdate = () => {
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
  
  if (!selectedShop) {
    console.log('No shop selected in ShopProductsList');
    return (
      <div className={styles.noShopSelected || styles.noProducts}>
        <h2>No hay comercio seleccionado</h2>
        <button 
          className={styles.actionButton}
          title="Volver"
          onClick={() => {
            setShowProductManagement(false);
          }}
        >
          Volver
        </button>
      </div>
    );
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

        <animated.div style={mainContentAnimation}>
            <div className={styles.listHeaderTop}>
              <div className={styles.listTitleWrapper}>
                <h1 className={styles.listTitle}>Lista de Productos</h1>
              </div>
              <div className={styles.buttonGroup}>
                <div className={styles.searchInputWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Buscar productos..."
                      className={styles.searchInput}
                    />
                    
                </div>
                <button
                  onClick={handleAddProduct}
                  className={styles.actionButton}
                  title="Añadir producto"
                >
                  <PackagePlus size={17} />
                  <span className={styles.buttonText}>Añadir</span>
                </button>

                <button
                  onClick={handleBulkUpdate}
                  className={`${styles.actionButton} ${styles.updateButton}`}
                  disabled={selectedProducts.size === 0}
                  title="Actualizar producto"
                >
                  <Pencil size={17} />
                  <span className={styles.buttonText}>Actualizar</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  disabled={selectedProducts.size === 0}
                  title="Borrar producto"
                >
                  <Trash2 size={17} />
                  <span className={styles.buttonText}>Borrar</span>
                </button>
                
                {/* Enhanced Filter Toggle Button with Animation */}
                <button
                  onClick={toggleFilters}
                  className={`${styles.actionButton} ${styles.filterButton} ${showFilters ? styles.active : ''}`}
                  title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                >
                  <Filter size={17} />
                  <span className={styles.buttonText}>Más filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className={styles.filterBadge}>{activeFiltersCount}</span>
                  )}
                  {/* Animated chevron that rotates when filters are toggled */}
                  <animated.div style={filterButtonAnimation} className={styles.filterButtonIcon}>
                    <ChevronDown size={14} />
                  </animated.div>
                </button>
              </div>
            </div>
        </animated.div>

        {/* Pass searchTerm and setSearchTerm to FiltersForProducts */}
        {showFilters && <FiltersForProducts isVisible={showFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onResetFilters={handleResetAllFilters} />}
        
        {displayedProducts.length === 0 ? (
          <p className={styles.noProducts}>
            {products.length === 0 
              ? "No hay productos disponibles. Añade un producto para comenzar."
              : "No se encontraron productos que coincidan con tu búsqueda."}
          </p>
        ) : (       
          <animated.div style={mainContentAnimation} className={styles.tableContainer}>
            <p className={styles.productsCount}>
                Productos mostrados: {displayedProducts.length}
                {selectedProducts.size > 0 && ` | Seleccionados: ${selectedProducts.size}`}
            </p>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableHeaderCell}>Acciones</th>
                  <th className={styles.tableHeaderCell}>Imagen</th>
                  <th className={styles.tableHeaderCell}>Nombre</th>
                  <th className={styles.tableHeaderCell}>Precio</th>            
                  <th className={styles.tableHeaderCell}>Tipo</th>
                  <th className={styles.tableHeaderCell}>Sub-tipo</th>
                  <th className={styles.tableHeaderCell}>País de Origen</th>
                  <th className={styles.tableHeaderCell}>Localidad</th>
                  <th className={styles.tableHeaderCell}>Temporada</th>
                  <th className={styles.tableHeaderCell}>Descuento</th>
                  <th className={styles.tableHeaderCell}>Total Vendidos</th>
                  <th className={styles.tableHeaderCell}>Segunda Mano</th>
                  <th className={styles.tableHeaderCell}>Más Información</th>
                  <th className={styles.tableHeaderCell}>Caducidad AAAA-MM-DD</th>
                  <th className={styles.tableHeaderCell}>Excedente</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product) => (
                  <tr
                    key={product.id_product}
                    className={`${styles.tableRow} ${selectedProducts.has(product.id_product) ? styles.selected : ''}`}
                    onClick={() => handleProductRowClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Updated accordion-style action cell with arrow icons */}
                    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                      <div className={`${styles.actionsCellWrapper} ${activeActionsMenu === product.id_product ? styles.active : ''}`}>
                        <button
                          className={`${styles.mainActionButton} ${activeActionsMenu === product.id_product ? styles.active : ''}`}
                          onClick={(e) => toggleActionsMenu(product.id_product, e)}
                          title="Acciones"
                          style={{ overflow: 'visible' }} // Add inline style to ensure visibility
                        >
                          {activeActionsMenu === product.id_product ? (
                            /* When menu is open, show left arrow with explicit dimensions */
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArrowLeftFromLine size={22} strokeWidth={2} />
                            </span>
                          ) : (
                            /* When menu is closed, show right arrow with explicit dimensions */
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArrowRightFromLine size={22} strokeWidth={2} />
                            </span>
                          )}
                        </button>
                        
                        <div className={styles.actionButtonsContainer}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateProduct(product.id_product);
                              setActiveActionsMenu(null);
                            }}
                            className={`${styles.actionButton} ${styles.updateButton}`}
                            title="Actualizar producto"
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id_product);
                              setActiveActionsMenu(null);
                            }}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Eliminar producto"
                            type="button"
                            disabled={currentDeletingProduct.current === product.id_product}
                          >
                            <Trash2 size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(product.id_product);
                              setActiveActionsMenu(null);
                            }}
                            className={`${styles.actionButton} ${styles.selectButton} ${
                              selectedProducts.has(product.id_product) ? styles.selected : ''
                            }`}
                            title="Seleccionar producto"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={(e) => handleSelectForImageUpload(product.id_product, e)}
                            className={`${styles.actionButton} ${styles.imageButton}`}
                            title="Seleccionar para subir imagen"
                          >
                            <ImagePlus size={20} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td 
                      className={`${styles.tableCell} ${styles.smallCell}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductImageDoubleClick(product);
                      }}
                    >
                      <ProductImage id_product={product.id_product} />
                    </td>
                    <td className={`${styles.tableCell} ${styles.mediumCell}`}>{product.name_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>&euro;{product.price_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.type_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.subtype_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.country_product || '-'}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.locality_product || '-'}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.season_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>
                      {product.discount_product > 0 ? `${product.discount_product}%` : 'No'}
                    </td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.sold_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{formatSecondHand(product.second_hand)}</td>
                    <td className={`${styles.tableCell} ${styles.largeCell}`}>{product.info_product}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{formatDate(product.expiration_product)}</td>
                    <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.surplus_product}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </animated.div>
        )}
    </div>
  );
};

export default ShopProductsList;