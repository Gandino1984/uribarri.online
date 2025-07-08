import React, { useState, useEffect } from 'react';
import styles from '../../../../../../../public/css/ShopCreationForm.module.css';
import axiosInstance from '../../../../../utils/app/axiosConfig.js';

const ShopBasicInfo = ({ newShop, setNewShop, shopTypesAndSubtypes }) => {
  //update: Add state to store types with their IDs
  const [typesWithIds, setTypesWithIds] = useState([]);
  const [subtypesForSelectedType, setSubtypesForSelectedType] = useState([]);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  
  //update: Fetch types with IDs when component mounts
  useEffect(() => {
    fetchTypesWithIds();
  }, []);
  
  //update: Fetch subtypes when type changes
  useEffect(() => {
    if (newShop.id_type) {
      fetchSubtypesForType(newShop.id_type);
    } else {
      setSubtypesForSelectedType([]);
    }
  }, [newShop.id_type]);
  
  //update: Function to fetch types with their IDs
  const fetchTypesWithIds = async () => {
    try {
      const response = await axiosInstance.get('/type');
      if (response.data && !response.data.error) {
        setTypesWithIds(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };
  
  //update: Function to fetch subtypes for a specific type - Fixed API endpoint
  const fetchSubtypesForType = async (typeId) => {
    try {
      setLoadingSubtypes(true);
      // Fixed: Use the correct API endpoint that matches the router
      const response = await axiosInstance.get(`/type/${typeId}/subtypes`);
      if (response.data && !response.data.error) {
        setSubtypesForSelectedType(response.data.data);
      } else {
        console.error('Error in response:', response.data.error);
        setSubtypesForSelectedType([]);
      }
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      setSubtypesForSelectedType([]);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  //update: Handle type change - now sets id_type instead of type_shop
  const handleTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    setNewShop({
      ...newShop, 
      id_type: selectedTypeId,
      id_subtype: '' // Reset subtype when type changes
    });
  };
  
  //update: Handle subtype change - now sets id_subtype
  const handleSubtypeChange = (e) => {
    const selectedSubtypeId = e.target.value;
    setNewShop({
      ...newShop, 
      id_subtype: selectedSubtypeId
    });
  };

  return (
    <section className={styles.formFields}>
      <h2 className={styles.sectionTitle}>Paso 2: Información básica</h2>
      <p className={styles.sectionDescription}>
        Proporciona los detalles principales de tu comercio. Esta información será visible para todos los usuarios.
      </p>
      
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
            value={newShop.id_type || ""}
            onChange={handleTypeChange}
            className={`${styles.input} ${newShop.id_type ? 'has-value' : ''}`}
            required
          >
            <option value="" disabled>Categoría</option>
            {typesWithIds.map(type => (
              <option key={type.id_type} value={type.id_type}>
                {type.name_type}
              </option>
            ))}
          </select>
        </div>

        {newShop.id_type && (
          <div className={styles.formField}>
            <select
              value={newShop.id_subtype || ""}
              onChange={handleSubtypeChange}
              className={`${styles.input} ${newShop.id_subtype ? 'has-value' : ''}`}
              required
              disabled={loadingSubtypes}
            >
              <option value="" disabled>
                {loadingSubtypes ? 'Cargando subcategorías...' : 'Subcategoría'}
              </option>
              {subtypesForSelectedType.map(subtype => (
                <option key={subtype.id_subtype} value={subtype.id_subtype}>
                  {subtype.name_subtype}
                </option>
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