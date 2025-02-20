import React, { useContext, useEffect } from 'react';
import ProductCreationFormFunctions from './ProductCreationFormFunctions';
import AppContext from '../../../../app_context/AppContext';
import styles from '../../../../../../public/css/ProductCreationForm.module.css';
import { CirclePlus, ScrollText, PackagePlus, Save } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import CustomNumberInput from '../../../custom_number_input/CustomNumberInput';


const ProductCreationForm = () => {
  const {
    handleChange,
    handleNumericInputChange,
    resetNewProductData,
    handleSubmit,
    handleUpdate
  } = ProductCreationFormFunctions();

  const { 
    newProductData: productData,
    filterOptions,
    setShowProductManagement,
    isUpdatingProduct,
    selectedProductToUpdate,
    productTypesAndSubtypes,
    setNewProductData
  } = useContext(AppContext);

  // Get the list of product types
  const productTypes = Object.keys(productTypesAndSubtypes);

  // Get subtypes based on selected product type
  const subtypes = productData.type_product ? productTypesAndSubtypes[productData.type_product] : [];

  useEffect(() => {
    if (isUpdatingProduct && selectedProductToUpdate) {
      Object.keys(selectedProductToUpdate).forEach(key => {
        if (key in productData) {
          handleChange({
            target: {
              name: key,
              value: selectedProductToUpdate[key]
            }
          });
        }
      });
    } else {
      resetNewProductData();
    }
  }, [isUpdatingProduct, selectedProductToUpdate]);

  const handleViewProductList = () => {
    setShowProductManagement(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isUpdatingProduct) {
      handleUpdate(e);
    } else {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formField}>
        <button 
          type="button" 
          className={styles.submitButton}
          onClick={handleViewProductList}
        >
          Ver Lista de Productos
          <ScrollText size={20}/>
        </button>
      </div>

      <h2 className={styles.formTitle}>
        {isUpdatingProduct ? 'Actualizar Producto' : '¿O quieres crear un nuevo producto?'}
      </h2>
      
      <form onSubmit={handleFormSubmit} className={styles.form}>
        <div className={styles.formField}>
          <input
            type="text"
            id="name_product"
            name="name_product"
            placeholder='Nombre del Producto:'
            value={productData.name_product}
            onChange={handleChange}
            required
          />
        </div>
        

        <div className={styles.formField}>
          <label htmlFor="price_product">Precio</label>
          <CustomNumberInput
            label="Precio"
            name="price_product"
            value={productData.price_product}
            onChange={handleNumericInputChange}
            step={0.1}
            min={0}
            required
          />
        </div>

        <div className={styles.formField}>
          <textarea
            id="info_product"
            name="info_product"
            value={productData.info_product}
            onChange={handleChange}
            rows="4"
            width="100%"
            placeholder='Información adicional del producto. Usa palabras claves como: tallas, colección, materiales, procedencia, etc.'
          />
        </div>

        {/* Product Type Dropdown */}
        <div className={styles.formField}>
          <select
            id="type_product"
            name="type_product"
            value={productData.type_product}
            onChange={(e) => {
              // Reset subtype when type changes
              setNewProductData({
                ...productData,
                type_product: e.target.value,
                subtype_product: '' // Clear subtype
              });
            }}
            required
          >
            <option value="" disabled>Tipo:</option>
            {productTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Subtype Dropdown - Only show if a type is selected */}
        {productData.type_product && (
          <div className={styles.formField}>
            <select
              id="subtype_product"
              name="subtype_product"
              value={productData.subtype_product}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Subtipo:</option>
              {subtypes.map(subtype => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formField}>
          <select
            id="season_product"
            name="season_product"
            value={productData.season_product}
            onChange={handleChange}
          >
            <option value="" disabled>Temporada:</option>
            {filterOptions.temporada.options.map(season => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <label htmlFor="discount_product">Descuento (%)</label>
          <CustomNumberInput
            label="Descuento (%)"
            name="discount_product"
            value={productData.discount_product}
            onChange={handleNumericInputChange}
            step={1}
            min={0}
            max={100}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="stock_product">Stock</label>
          <CustomNumberInput
            label="Stock"
            name="stock_product"
            value={productData.stock_product}
            onChange={handleNumericInputChange}
            min={0}
            required
          />
        </div>

        <div className={styles.formField}>
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            {isUpdatingProduct ? (
              <>
                Actualizar Producto
                <Save size={16}/>
              </>
            ) : (
              <>
                Crear Producto
                <PackagePlus size={16}/>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreationForm;