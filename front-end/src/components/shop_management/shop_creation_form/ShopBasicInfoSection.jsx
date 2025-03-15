import React, { useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { Store, MapPin } from 'lucide-react';

const ShopBasicInfoSection = () => {
  const { 
    newShop, 
    setNewShop,
    shopTypesAndSubtypes
  } = useContext(AppContext);

  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  // UPDATE: Added step title and description
  return (
    <section className={styles.formFields}>
      <div className={styles.stepTitle}>
        <h2>Categoría y Ubicación</h2>
        <p className={styles.stepDescription}>Selecciona la categoría y ubicación de tu comercio</p>
      </div>
      
      <div className={styles.formField}>
        <div className={styles.inputWithIcon}>
          <Store size={18} className={styles.inputIcon} />
          <select
            value={newShop.type_shop || ''}
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
      </div>

      {newShop.type_shop && (
        <div className={styles.formField}>
          <div className={styles.inputWithIcon}>
            <Store size={18} className={styles.inputIcon} />
            <select
              value={newShop.subtype_shop || ''}
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
        </div>
      )}
      
      <div className={styles.formField}>
        <div className={styles.inputWithIcon}>
          <MapPin size={18} className={styles.inputIcon} />
          <input
            type="text"
            placeholder='Dirección del comercio:'
            value={newShop.location_shop || ''}
            onChange={(e) => setNewShop({...newShop, location_shop: e.target.value})}
            className={styles.input}
            required
          />
        </div>
      </div>
    </section>
  );
};

export default ShopBasicInfoSection;