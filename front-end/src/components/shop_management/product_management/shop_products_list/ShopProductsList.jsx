import React, { useEffect, useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import ShopProductListFunctions from './ShopProductsListFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';
import { PackagePlus, Pencil, Trash2, CheckCircle, ImagePlus } from 'lucide-react';
import styles from '../../../../../../public/css/ShopProductsList.module.css';
// import ConfirmationModal from '../../../confirmation_modal/ConfirmationModal.jsx';
import ProductImage from '../product_image/ProductImage.jsx';
import ImageModal from '../../../image_modal/ImageModal.jsx';
import ProductCard from '../product_card/ProductCard.jsx';
import { useSpring, animated, config } from '@react-spring/web';
import ShopCard from '../../shop_card/ShopCard.jsx'; 



const ShopProductList = () => {
  const {
    currentUser,
    products,
    selectedShop,
    filters,
    filteredProducts, setFilteredProducts,
    selectedProducts,
    isAccepted,
    setIsAccepted,
    isDeclined,
    setIsDeclined,
    clearError,
    isImageModalOpen,
    setIsImageModalOpen,
    productToDelete, setProductToDelete,
    selectedImageForModal, setSelectedImageForModal,
    // Añadimos el nuevo estado para el producto seleccionado
    selectedProductDetails, setSelectedProductDetails
  } = useContext(AppContext);

  const [contentVisible, setContentVisible] = useState(false);
  // Estado para controlar la visibilidad del ProductCard
  const [showProductCard, setShowProductCard] = useState(false);

  // Animation for main content
  const mainContentAnimation = useSpring({
    from: { transform: 'translateY(100px)', opacity: 0 },
    to: { 
      transform: contentVisible ? 'translateY(0px)' : 'translateY(100px)', 
      opacity: contentVisible ? 1 : 0 
    },
    config: { tension: 280, friction: 20 },
  });


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
  } = ShopProductListFunctions();

  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch products when shop changes
  useEffect(() => {
    if (selectedShop?.id_shop) {
      fetchProductsByShop();
    }
  }, [selectedShop]);

  // Filter products when products or filters change
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const filtered = filterProducts(products, filters);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [products, filters]);

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

  // Función para manejar el clic en una fila de producto
  const handleProductRowClick = (product) => {
    setSelectedProductDetails(product);
    setShowProductCard(true);
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Convierte la fecha en un objeto Date y luego la formatea
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-'; // Si la fecha no es válida
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '-';
    }
  };

  // Función para formatear el campo second_hand
  const formatSecondHand = (value) => {
    return value ? 'Sí' : 'No';
  };

  return (
    <div className={styles.container}>
        {/* <ConfirmationModal /> */}

        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false);
            setSelectedImageForModal(null); // Clear the image when closing
          }}
          imageUrl={selectedImageForModal}
          altText="Product full size image"
        />

        {/* Integración del nuevo componente ProductCard */}
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
                  // onClick={handleBulkUpdate}
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
        

        {filteredProducts.length === 0 ? (
          <p className={styles.noProducts}>No hay productos disponibles</p>
        ) : (       
          <animated.div style={mainContentAnimation} className={styles.tableContainer}>
            <p className={styles.productsCount}>
                Productos mostrados: {filteredProducts.length}
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
                    {filteredProducts.map((product) => (
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
                        </td>
                        <td className={`${styles.tableCell} ${styles.smallCell}`}
                            onDoubleClick={(e) => {
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

export default ShopProductList;