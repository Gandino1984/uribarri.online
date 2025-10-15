import React, { useState, useEffect } from 'react';
import styles from '../../../../../../css/ShopCreationForm.module.css';
import axiosInstance from '../../../../../utils/app/axiosConfig.js';

const ShopBasicInfo = ({ newShop, setNewShop, shopTypesAndSubtypes }) => {
  //update: Initialize with empty arrays to prevent undefined errors
  const [typesWithIds, setTypesWithIds] = useState([]);
  const [availableSubtypes, setAvailableSubtypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
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
      setAvailableSubtypes([]);
    }
  }, [newShop.id_type]);
  
  //update: Function to fetch types with their IDs
  const fetchTypesWithIds = async () => {
    try {
      setLoadingTypes(true);
      const response = await axiosInstance.get('/type/verified');
      //update: Add validation to ensure we have data before setting state
      if (response.data && !response.data.error && Array.isArray(response.data.data)) {
        setTypesWithIds(response.data.data);
      } else {
        console.warn('Invalid types response:', response.data);
        setTypesWithIds([]);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      setTypesWithIds([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  //update: Function to fetch subtypes for a specific type
  const fetchSubtypesForType = async (typeId) => {
    try {
      setLoadingSubtypes(true);
      const response = await axiosInstance.get(`/type/${typeId}/subtypes`);
      //update: Add validation to ensure we have data before setting state
      if (response.data && !response.data.error && Array.isArray(response.data.data)) {
        setAvailableSubtypes(response.data.data);
      } else {
        console.warn('Invalid subtypes response:', response.data);
        setAvailableSubtypes([]);
      }
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      setAvailableSubtypes([]);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  //update: Handle type change - now sets id_type and resets subtype
  const handleTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    setNewShop({
      ...newShop, 
      id_type: selectedTypeId,
      id_subtype: '' // Reset subtype when type changes
    });
  };

  //update: Handle subtype change
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
            disabled={loadingTypes}
          >
            <option value="" disabled>
              {loadingTypes ? 'Cargando tipos...' : 'Tipo de comercio'}
            </option>
            {/* update: Add safety check before mapping */}
            {Array.isArray(typesWithIds) && typesWithIds.length > 0 ? (
              typesWithIds.map(type => (
                <option key={type.id_type} value={type.id_type}>
                  {type.name_type}
                </option>
              ))
            ) : (
              !loadingTypes && <option value="" disabled>No hay tipos disponibles</option>
            )}
          </select>
        </div>
        
        {/* Show subtype select only when a type is selected */}
        {newShop.id_type && (
          <div className={styles.formField}>
            <select
              value={newShop.id_subtype || ""}
              onChange={handleSubtypeChange}
              className={`${styles.input} ${newShop.id_subtype ? 'has-value' : ''}`}
              required
              disabled={loadingSubtypes || availableSubtypes.length === 0}
            >
              <option value="" disabled>
                {loadingSubtypes 
                  ? "Cargando subtipos..." 
                  : availableSubtypes.length === 0 
                    ? "Sin subtipos disponibles" 
                    : "Selecciona un subtipo"
                }
              </option>
              {/* update: Add safety check before mapping */}
              {Array.isArray(availableSubtypes) && availableSubtypes.length > 0 && 
                availableSubtypes.map(subtype => (
                  <option key={subtype.id_subtype} value={subtype.id_subtype}>
                    {subtype.name_subtype}
                  </option>
                ))
              }
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