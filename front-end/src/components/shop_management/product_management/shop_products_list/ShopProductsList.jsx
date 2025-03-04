import React, { useEffect, useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import ShopProductsListFunctions from './ShopProductsListFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';
import { PackagePlus, Pencil, Trash2, CheckCircle, ImagePlus, ArrowLeft } from 'lucide-react';
import styles from '../../../../../../public/css/ShopProductsList.module.css';
import ProductImage from '../product_image/ProductImage.jsx';
import ImageModal from '../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import { useSpring, animated } from '@react-spring/web';
import ShopCard from '../../shop_card/ShopCard.jsx'; 
import ConfirmationModal from '../../../confirmation_modal/ConfirmationModal.jsx';
import ProductManagementFunctions from '../ProductManagementFunctions.jsx';

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
    setshowShopManagement
  } = useContext(AppContext);

  const [contentVisible, setContentVisible] = useState(false);
  const [showProductCard, setShowProductCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedProducts, setDisplayedProducts] = useState([]);

  
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
  } = ShopProductsListFunctions();

  const { fetchProductsByShop } = ProductManagementFunctions();

  
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

    console.log(`Filtering ${products.length} products with filters:`, filters);
    
    // First apply filters
    let filtered = filterProducts(products, filters);
    
    // Then apply search term if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name_product?.toLowerCase().includes(term) || 
        product.type_product?.toLowerCase().includes(term) ||
        product.subtype_product?.toLowerCase().includes(term) ||
        product.info_product?.toLowerCase().includes(term)
      );
    }
    
    console.log(`Filtered to ${filtered.length} products`);
    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  }, [products, filters, searchTerm]);

  // Handle deletion confirmation
  useEffect(() => {
    const handleConfirmedDelete = async () => {
      if (isAccepted) {
        if (productToDelete) {
          // Single product deletion
          console.log('Deleting product:', productToDelete);
          try {
            const result = await deleteProduct(productToDelete);

            console.log('Delete result:', result);
            if (result.success) {
              await fetchProductsByShop();
            }
          } catch (error) {
            console.error('Error deleting product:', error);
          } finally {
            setProductToDelete(null);
            setIsAccepted(false);
            clearError();
          }
        } else {
          // Bulk deletion
          await bulkDeleteProducts();
          setIsAccepted(false);
          clearError();
        }
      }
    };

    handleConfirmedDelete();
  }, [isAccepted, productToDelete]);

  // Handle deletion cancellation
  useEffect(() => {
    if (isDeclined) {
      setProductToDelete(null);
      setIsDeclined(false);
      clearError();
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

  
  const handleSelectForImageUpload = (id_product) => {
    setSelectedProductForImageUpload(id_product);
    
    
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (!newSelected.has(id_product)) {
        newSelected.add(id_product);
      }
      return newSelected;
    });
  };


  if (!selectedShop) {
    console.log('No shop selected in ShopProductsList');
    return (
      <div className={styles.noShopSelected || styles.noProducts}>
        <h2>No hay comercio seleccionado</h2>
        <button 
          className={styles.actionButton}
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
              <h2 className={styles.listTitle}>Lista de Productos</h2>
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleAddProduct}
                  className={styles.actionButton}
                >
                  <PackagePlus size={17} />
                  <span className={styles.buttonText}>Añadir Producto</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  disabled={selectedProducts.size === 0}
                >
                  <Trash2 size={17} />
                  <span className={styles.buttonText}>Borrar Productos</span>
                </button>

                <button
                  className={`${styles.actionButton} ${styles.updateButton}`}
                  disabled={selectedProducts.size === 0}
                >
                  <Pencil size={17} />
                  <span className={styles.buttonText}>Actualizar Productos</span>
                </button>
              </div>
            </div>
          
        </animated.div>

        <FiltersForProducts />
        
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
                    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleUpdateProduct(product.id_product)}
                        className={`${styles.actionButton} ${styles.updateButton}`}
                        title="Actualizar producto"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id_product)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Eliminar producto"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleSelectProduct(product.id_product)}
                        className={`${styles.actionButton} ${styles.selectButton} ${
                          selectedProducts.has(product.id_product) ? styles.selected : ''
                        }`}
                        title="Seleccionar producto"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleSelectForImageUpload(product.id_product)}
                        className={`${styles.actionButton} ${styles.imageButton}`}
                        title="Seleccionar para subir imagen"
                      >
                        <ImagePlus size={18} />
                      </button>
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