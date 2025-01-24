import { useContext } from 'react';
import axiosInstance from '../../../../../utils/axiosConfig';
import AppContext from '../../../../app_context/AppContext';

const ShopProductsListFunctions = () => {
  const { 
    setProducts, 
    setError,
    selectedShop, 
    setFilteredProducts,
    filters,
    setShowErrorCard,
    selectedProducts,
    setSelectedProducts,
    setModalMessage,
    setIsModalOpen
  } = useContext(AppContext);

  const filterProducts = (products, filters) => {
    if (!products || !filters) return products;
    return products.filter((product) => {
      // Season match - case insensitive and handles "Todo el Año"
      const seasonMatch = !filters.temporada || 
        product.season_product.toLowerCase() === filters.temporada.toLowerCase() ||
        (filters.temporada.toLowerCase() === 'todo el año' && 
         product.season_product.toLowerCase().includes('todo'));
  
      // Type match - exact match required
      const typeMatch = !filters.tipo || 
        product.type_product === filters.tipo;
  
      // Subtype match - only apply if type matches
      const subtypeMatch = !filters.subtipo || 
        (typeMatch && product.subtype_product === filters.subtipo);
  
      // Discount match
      const onSaleMatch = !filters.oferta || 
        (filters.oferta === 'Sí' && product.discount_product > 0);
  
      // Rating match - parse as number for comparison
      const calificationMatch = !filters.calificacion || 
        product.calification_product >= Number(filters.calificacion);
  
      return seasonMatch && typeMatch && subtypeMatch && onSaleMatch && calificationMatch;
    });
  };

  const fetchProductsByShop = async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('-> ShopProductsListFunctions.jsx - fetchProductsByShop - No hay comercio seleccionado');
        setError(prevError => ({ ...prevError, shopError: "No hay comercio seleccionado" }));
        setProducts([]);
        return;
      }
      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);

      const fetchedProducts = response.data.data || [];
      
      console.log(`Fetched ${fetchedProducts.length} products for shop ${selectedShop.name_shop}`);
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(prevError => ({ ...prevError, databaseResponseError: "Hubo un error al buscar los productos del comercio" }));
      setProducts([]);
    } 
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await axiosInstance.delete(`/product/remove-by-id/${productId}`);
      
      if (response.data.success) {
        return { success: true, message: response.data.success };
      } else {
        setError(prevError => ({ 
          ...prevError, 
          productError: response.data.error || "Error al eliminar el producto" 
        }));
        setShowErrorCard(true);
        return { success: false, message: response.data.error };
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(prevError => ({ 
        ...prevError, 
        productError: "Error al eliminar el producto" 
      }));
      setShowErrorCard(true);
      return { success: false, message: "Error al eliminar el producto" };
    }
  };

  // New function for bulk deletion
  const bulkDeleteProducts = async () => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para eliminar"
      }));
      setShowErrorCard(true);
      return false;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      // Delete products one by one
      for (const productId of selectedProducts) {
        const result = await deleteProduct(productId);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      // Clear selected products after deletion
      setSelectedProducts(new Set());

      // Refresh the products list
      await fetchProductsByShop();

      // Show result message
      const message = `${successCount} productos eliminados exitosamente${failCount > 0 ? `, ${failCount} fallos` : ''}`;
      setError(prevError => ({
        ...prevError,
        productError: failCount > 0 ? message : ''
      }));
      
      if (failCount > 0) {
        setShowErrorCard(true);
      }

      return successCount > 0;
    } catch (err) {
      console.error('Error in bulk deletion:', err);
      setError(prevError => ({
        ...prevError,
        productError: "Error al eliminar los productos seleccionados"
      }));
      setShowErrorCard(true);
      return false;
    }
  };

  // Function to confirm bulk deletion
  const confirmBulkDelete = () => {
    if (selectedProducts.size === 0) {
      setError(prevError => ({
        ...prevError,
        productError: "No hay productos seleccionados para eliminar"
      }));
      setShowErrorCard(true);
      return;
    }

    setModalMessage(`¿Estás seguro que deseas eliminar ${selectedProducts.size} producto${selectedProducts.size > 1 ? 's' : ''}?`);
    setIsModalOpen(true);
  };

  return {
    filterProducts,
    fetchProductsByShop,
    deleteProduct,
    bulkDeleteProducts,
    confirmBulkDelete
  };
};

export default ShopProductsListFunctions;