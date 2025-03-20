import React from 'react';
import styles from '../../../../../../../../../public/css/ProductCreationForm.module.css';

const ProductBasicInfo = ({ 
  productData, 
  onProductDataChange, 
  productTypesAndSubtypes,
  filteredProductTypes,
  setNewProductData,
  filterOptions
}) => {
  // Get subtypes based on selected product type
  const subtypes = productData.type_product ? productTypesAndSubtypes[productData.type_product] : [];

  return (
    <section className={styles.basicInfoSection}>
      <h2 className={styles.sectionTitle}>Información básica</h2>
      <p className={styles.sectionDescription}>
        Proporciona los detalles principales de tu producto
      </p>
      
      {/* Product Type Dropdown - Filtered by shop type */}
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
          {filteredProductTypes.map(type => (
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
            onChange={onProductDataChange}
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

      {/* Season Dropdown */}
      <div className={styles.formField}>
        <select
          id="season_product"
          name="season_product"
          value={productData.season_product}
          onChange={onProductDataChange}
        >
          <option value="" disabled>Temporada:</option>
          {filterOptions.temporada.options.map(season => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </div>

      {/* Expiration Date */}
      <div className={styles.formField}>
        <label htmlFor="expiration_product">Fecha de Caducidad (opcional)</label>
        <input
          type="date"
          id="expiration_product"
          name="expiration_product"
          value={productData.expiration_product || ''}
          onChange={onProductDataChange}
          min={new Date().toISOString().split('T')[0]} // Set minimum date to today
          className={styles.dateInput}
        />
      </div>
    </section>
  );
};

export default ProductBasicInfo;