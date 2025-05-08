import React from 'react';
import styles from '../../../../../../../public/css/ShopCreationForm.module.css';

const ShopBasicInfo = ({ newShop, setNewShop, shopTypesAndSubtypes }) => {
  // Get the list of shop types
  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  return (
    <section className={styles.formFields}>
      <h2 className={styles.sectionTitle}>Información básica</h2>
      <p className={styles.sectionDescription}>
        Proporciona los detalles principales de tu comercio. Esta información será visible para todos los usuarios.
      </p>
      
      {/* 🚀 UPDATE: Added wrapper div for better centering and max-width control */}
      <div className={styles.basicInfoInputWrapper}>
        <div className={styles.formField}>
          <input
            type="text"
            placeholder='Nombre del comercio:'
            value={newShop.name_shop}
            onChange={(e) => setNewShop({...newShop, name_shop: e.target.value})}
            className={styles.input}
            required
          />
        </div>
        
        <div className={styles.formField}>
          <select
            value={newShop.type_shop || ""}
            onChange={(e) => {
              setNewShop({
                ...newShop, 
                type_shop: e.target.value,
                subtype_shop: ''
              })
            }}
            className={`${styles.input} ${newShop.type_shop ? 'has-value' : ''}`}
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
              value={newShop.subtype_shop || ""}
              onChange={(e) => setNewShop({...newShop, subtype_shop: e.target.value})}
              className={`${styles.input} ${newShop.subtype_shop ? 'has-value' : ''}`}
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
      </div>
    </section>
  );
};

export default ShopBasicInfo;