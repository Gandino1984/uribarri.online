import React, { useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';

const ShopBasicInfoSection = () => {
  const { 
    newShop, 
    setNewShop,
    shopTypesAndSubtypes
  } = useContext(AppContext);

  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  return (
    <section className={styles.formFields}>
      <div className={styles.formField}>
        <select
          value={newShop.type_shop}
          onChange={(e) => {
            setNewShop({
              ...newShop, 
              type_shop: e.target.value,
              subtype_shop: ''
            })
          }}
          className={styles.input} 
          required
        >
          <option value="" disabled>Categoría</option>
          {shopTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {newShop.type_shop && (
        <div className={styles.formField}>
          <select
            value={newShop.subtype_shop}
            onChange={(e) => setNewShop({...newShop, subtype_shop: e.target.value})}
            className={styles.input} 
            required
          >
            <option value="" disabled>Subcategoría</option>
            {subtypes.map(subtype => (
              <option key={subtype} value={subtype}>{subtype}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className={styles.formField}>
        <input
          type="text"
          placeholder='Dirección del comercio:'
          value={newShop.location_shop}
          onChange={(e) => setNewShop({...newShop, location_shop: e.target.value})}
          className={styles.input}
          required
        />
      </div>
    </section>
  );
};

export default ShopBasicInfoSection;