import React, { useContext, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormFunctions } from './ShopCreationFormFunctions.jsx';
import { Box } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

const ShopCreationForm = () => {
  const { 
    newShop, 
    setNewShop,
    shopTypesAndSubtypes,
    selectedShop,
    setShowShopCreationForm,
    setError,
    setShowErrorCard
  } = useContext(AppContext);

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule
  } = ShopCreationFormFunctions();

  // Animation configuration
  const formAnimation = useSpring({
    from: { 
      transform: 'translateY(35%)',
      opacity: 0
    },
    to: { 
      transform: 'translateY(0%)',
      opacity: 1
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 22
    }
  });

  // Initialize form with selected shop data when updating
  useEffect(() => {
    if (selectedShop) {
      setNewShop({
        name_shop: selectedShop.name_shop,
        type_shop: selectedShop.type_shop,
        subtype_shop: selectedShop.subtype_shop,
        location_shop: selectedShop.location_shop,
        id_user: selectedShop.id_user,
        calification_shop: selectedShop.calification_shop,
        image_shop: selectedShop.image_shop,
        morning_open: selectedShop.morning_open || '',
        morning_close: selectedShop.morning_close || '',
        afternoon_open: selectedShop.afternoon_open || '',
        afternoon_close: selectedShop.afternoon_close || ''
      });
    }
  }, [selectedShop, setNewShop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate schedule
    const scheduleValidation = validateSchedule(newShop);
    
    if (!scheduleValidation.isValid) {
      setError(prevError => ({ 
        ...prevError, 
        shopError: scheduleValidation.error 
      }));
      setShowErrorCard(true);
      return;
    }

    if (selectedShop) {
      await handleUpdateShop(selectedShop.id_shop, newShop);
    } else {
      await handleCreateShop(newShop);
    }
  };

  // Get the list of shop types
  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  return (
    <animated.div style={formAnimation} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>   
          <h3 className={styles.headerTitle}>
            {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formFields}>
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
          </div>

          <div className={styles.scheduleContainer}>
            <h4 className={styles.scheduleTitle}>Horario de la mañana</h4>
            <div className={styles.scheduleFields}>
              <input
                type="time"
                value={newShop.morning_open || ''}
                onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                className={styles.timeInput}
                required
              />
              <span>a</span>
              <input
                type="time"
                value={newShop.morning_close || ''}
                onChange={(e) => setNewShop({...newShop, morning_close: e.target.value})}
                className={styles.timeInput}
                required
              />
            </div>

            <h4 className={styles.scheduleTitle}>Horario de la tarde</h4>
            <div className={styles.scheduleFields}>
              <input
                type="time"
                value={newShop.afternoon_open || ''}
                onChange={(e) => setNewShop({...newShop, afternoon_open: e.target.value})}
                className={styles.timeInput}
                required
              />
              <span>a</span>
              <input
                type="time"
                value={newShop.afternoon_close || ''}
                onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                className={styles.timeInput}
                required
              />
            </div>
          </div>
            
          <div className={styles.buttonContainer}>
            <button 
              type="submit" 
              className={styles.submitButton}
            >
              {selectedShop ? 'Actualizar' : 'Crear'}
              <Box size={17} />
            </button>
          </div>
        </form>
      </div>
    </animated.div>
  );
};

export default ShopCreationForm;