import React, { useEffect, useContext, useState } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import ShopProductListFunctions from './ShopProductsListFunctions.jsx';
import FiltersForProducts from '../../../filters_for_products/FiltersForProducts.jsx';
import { PackagePlus, Pencil, Trash2, CheckCircle, ImagePlus } from 'lucide-react';
import styles from '../../../../../../public/css/ShopProductsList.module.css';
import ConfirmationModal from '../../../confirmation_modal/ConfirmationModal.jsx';
import ProductImage from '../product_image/ProductImage.jsx';
import ImageModal from '../../../image_modal/ImageModal.jsx';
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
    selectedImageForModal, setSelectedImageForModal
    
  } = useContext(AppContext);

  const [contentVisible, setContentVisible] = useState(false);

  // Animation for shop info section
  const shopInfoAnimation = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: { transform: 'translateY(0px)', opacity: 1 },
    config: config.gentle,
    delay: 120
  });

  // Animation for main content (listHeader, filters, and table)
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


  return (
    <div className={styles.container}>
        <ConfirmationModal />

        <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImageForModal(null); // Clear the image when closing
        }}
        imageUrl={selectedImageForModal}
        altText="Product full size image"
      />

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
                  <th className={styles.tableHeaderCell}>Stock</th>
                  <th className={styles.tableHeaderCell}>Descuento</th>
                  <th className={styles.tableHeaderCell}>Temporada</th>
                  <th className={styles.tableHeaderCell}>Tipo</th>
                  <th className={styles.tableHeaderCell}>Sub-tipo</th>
                  <th className={styles.tableHeaderCell}>Más Información</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id_product}
                    className={`${styles.tableRow} ${selectedProducts.has(product.id_product) ? styles.selected : ''}`}
                  >
                    <td className={styles.actionsCell}>
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
                    <td className={styles.tableCell}
                        onDoubleClick={() => {
                          handleProductImageDoubleClick(product);
                        }}
                    >
                      <ProductImage id_product={product.id_product} />
                    </td>
                    <td className={styles.tableCell}>{product.name_product}</td>
                    <td className={styles.tableCell}>&euro;{product.price_product}</td>
                    <td className={styles.tableCell}>{product.stock_product}</td>
                    <td className={styles.tableCell}>
                      {product.discount_product > 0 ? `${product.discount_product}%` : '-'}
                    </td>
                    <td className={styles.tableCell}>{product.season_product}</td>
                    <td className={styles.tableCell}>{product.type_product}</td>
                    <td className={styles.tableCell}>{product.subtype_product}</td>
                    <td className={styles.tableCell}>{product.info_product}</td>
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

