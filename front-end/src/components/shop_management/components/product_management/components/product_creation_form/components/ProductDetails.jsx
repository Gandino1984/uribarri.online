import React from 'react';
import styles from '../../../../../../../../css/ProductCreationForm.module.css';
import { countries } from '../../../../../../../utils/app/countries.js';

import CustomToggleSwitch from '../../../../../../navigation_components/CustomToggleSwitch.jsx';

const ProductDetails = ({ 
  productData, 
  onProductDataChange, 
  onNumericInputChange 
}) => {
  // Handle checkbox change specially
  const handleCheckboxChange = (isChecked) => {
    // Ensure we pass the correct boolean value and convert it to 1/0 for the backend
    onProductDataChange({
      target: {
        name: 'second_hand',
        value: isChecked ? 1 : 0
      }
    });
  };

  // Handle text input change with word count check for info_product
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'info_product') {
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount <= 7) {
        onProductDataChange(e);
      }
      // If word count exceeds 7, don't update the state (silently reject the input)
    } else {
      onProductDataChange(e);
    }
  };

  return (
    <section className={styles.detailsSection}>
      <h2 className={styles.sectionTitle}>Detalles opcionales</h2>
      <p className={styles.sectionDescription}>
        Completa la información para una mejor descripción del producto
      </p>
      
      {/* Country and locality fields */}
      <div className={styles.formField}>
        <select
          id="country_product"
          name="country_product"
          value={productData.country_product || ''}
          onChange={onProductDataChange}
        >
          <option value="">País de origen</option>
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <input
          type="text"
          id="locality_product"
          name="locality_product"
          placeholder='Localidad de origen:'
          value={productData.locality_product || ''}
          onChange={onProductDataChange}
        />
      </div>

      <div className={styles.formField}>
        <textarea
          id="info_product"
          name="info_product"
          value={productData.info_product}
          onChange={handleInfoChange}
          rows="4"
          width="100%"
          placeholder='Información adicional del producto. Usa palabras claves como: tallas, colección, materiales, procedencia, etc.'
        />
      </div>

      {/* UPDATE: Replace checkbox with CustomToggleSwitch with proper state handling */}
      <div className={styles.formField}>
        <div className={styles.toggleSwitchContainer}>
          <span className={styles.toggleLabel}>Segunda mano</span>
          <CustomToggleSwitch 
            checked={productData.second_hand === 1}
            onChange={handleCheckboxChange}
            leftLabel="No"
            rightLabel="Sí"
          />
        </div>
      </div>

      <div className={styles.formField}>
        <label htmlFor="discount_product">% Descuento (opcional)</label>
        <input
          type="number"
          id="discount_product"
          name="discount_product"
          value={productData.discount_product}
          onChange={onNumericInputChange}
          step="1"
          min="0"
          max="100"
          placeholder="0-100" /* 🔖 UPDATE: Added placeholder for discount range */
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="surplus_product">Excedente (opcional)</label>
        <input
          type="number"
          id="surplus_product"
          name="surplus_product"
          value={productData.surplus_product}
          onChange={onNumericInputChange}
          min="0"
          placeholder="0" /* 📈 UPDATE: Added placeholder for surplus value */
          required
        />
      </div>
    </section>
  );
};

export default ProductDetails;