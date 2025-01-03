import { useContext, useEffect } from 'react';
import AppContext from '../../../../app_context/AppContext';
import axiosInstance from '../../../../../utils/axiosConfig';

const ProductCreationFormFunctions = () => {
  const { 
    setNewProductData,
    selectedShop, setError, 
    setShowErrorCard, newProductData, 
    products, setProducts,
    setShowProductManagement 
  } = useContext(AppContext);

  useEffect(() => {
    if (selectedShop) {
      setNewProductData(prev => ({
        ...prev,
        id_shop: selectedShop.id_shop
      }));
    }
  }, [selectedShop, setNewProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value === '' ? '' : Number(value);
    setNewProductData(prev => ({
      ...prev, [name]: processedValue
    }));
  };

  const validateProductData = (newProductData) => {
    try {
      if (!newProductData.id_shop) {
        setError(prevError => ({ ...prevError, productError: "Debe seleccionar una negocio"}));
        throw new Error("Debe seleccionar una negocio");
      }
      if (!newProductData.name_product) {
        setError(prevError => ({ ...prevError, productError: "El nombre de producto es requerido"}));
        throw new Error("El nombre de producto es requerido");
      }
      if (!newProductData.type_product) {
        setError(prevError => ({ ...prevError, productError: "El tipo de producto es requerido"}));
        throw new Error("El tipo de producto es requerido");
      }
      if (newProductData.discount_product < 0 || newProductData.discount_product > 100) {
        setError(prevError => ({ ...prevError, productError: "Valor de descuento fuera del rango permitido"}));
        throw new Error("Valor de descuento fuera del rango permitido");
      }
      if (newProductData.stock_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El Stock no puede ser negativo"}));
        throw new Error("El Stock no puede ser negativo");
      }
      return true;
    } catch (err) {
      console.error('Error validating product data:', err);
      setError(prevError => ({ ...prevError, productError: "Error al validar los datos del producto" }));
      return false;
    }
  };

  const resetNewProductData = () => {
    setNewProductData({
      name_product: '',
      price_product: '',
      discount_product: 0,
      season_product: 'Todo el Año',
      calification_product: 0,
      type_product: '',
      stock_product: 0,
      info_product: '',
      id_shop: selectedShop?.id_shop || ''
    });
    setError(prevError => ({
      ...prevError,
      productError: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateProductData(newProductData)) return;

      const response = await axiosInstance.post('/product/create', newProductData);

      if (response.data.error) {
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return;
      }

      if (response.data.data) {
        // Add the new product to the products array
        setProducts(prevProducts => [...prevProducts, response.data.data]);
        
        // Reset the form
        resetNewProductData();
        
        // Switch to product list view
        setShowProductManagement(false);
      }
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al crear el producto'
      }));
      setShowErrorCard(true);
      console.error('Error creating product:', err);
    }
  };

  const fetchUpdatedProducts = async () => {
    try {
      const response = await axiosInstance.get(`/product/by-shop-id/${selectedShop.id_shop}`);
      if (response.data.data) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching updated products:', err);
    }
  };

  return {
    handleChange,
    handleNumericInputChange,
    handleSubmit,
    resetNewProductData,
    fetchUpdatedProducts
  };
};

export default ProductCreationFormFunctions;