import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../utils/app/axiosConfig.js';
import { X, Plus, Search, ChevronDown, ChevronUp, Tag, Tags, AlertCircle } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopTypeManagementForm.module.css';

const ShopTypeManagementForm = ({ onClose }) => {
  //update: State for types and subtypes
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [filteredSubtypes, setFilteredSubtypes] = useState([]);
  
  //update: Form states
  const [searchType, setSearchType] = useState('');
  const [searchSubtype, setSearchSubtype] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newSubtypeName, setNewSubtypeName] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeForSubtype, setSelectedTypeForSubtype] = useState(null);
  
  //update: UI states
  const [showCreateType, setShowCreateType] = useState(false);
  const [showCreateSubtype, setShowCreateSubtype] = useState(false);
  const [expandedType, setExpandedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //update: Fetch types on component mount
  useEffect(() => {
    fetchTypes();
  }, []);

  //update: Filter subtypes based on selected type
  useEffect(() => {
    if (selectedType) {
      const filtered = subtypes.filter(subtype => subtype.id_type === selectedType.id_type);
      setFilteredSubtypes(filtered);
    } else {
      setFilteredSubtypes(subtypes);
    }
  }, [selectedType, subtypes]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/type/verified');
      if (response.data.data) {
        setTypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching types:', err);
      setError('Error al cargar los tipos de comercio');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtypesByType = async (typeId) => {
    try {
      const response = await axiosInstance.get(`/type/${typeId}/subtypes`);
      if (response.data.data) {
        setSubtypes(response.data.data);
        setFilteredSubtypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching subtypes:', err);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedTypeForSubtype(type);
    setExpandedType(type.id_type);
    fetchSubtypesByType(type.id_type);
    setSearchSubtype('');
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim()) {
      setError('El nombre del tipo es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.post('/type/create', {
        name_type: newTypeName.trim()
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess('¡Tipo de comercio creado! Será revisado por un administrador.');
        setNewTypeName('');
        setShowCreateType(false);
        fetchTypes();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating type:', err);
      setError('Error al crear el tipo de comercio');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtype = async () => {
    if (!newSubtypeName.trim()) {
      setError('El nombre del subtipo es obligatorio');
      return;
    }

    if (!selectedTypeForSubtype) {
      setError('Debes seleccionar un tipo primero');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.post('/subtype/create', {
        name_subtype: newSubtypeName.trim(),
        id_type: selectedTypeForSubtype.id_type
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess('¡Subtipo creado! Será revisado por un administrador.');
        setNewSubtypeName('');
        setShowCreateSubtype(false);
        fetchSubtypesByType(selectedTypeForSubtype.id_type);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating subtype:', err);
      setError('Error al crear el subtipo');
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = types.filter(type =>
    type.name_type.toLowerCase().includes(searchType.toLowerCase())
  );

  const displayedSubtypes = filteredSubtypes.filter(subtype =>
    subtype.name_subtype.toLowerCase().includes(searchSubtype.toLowerCase())
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Gestiona tus tipos de comercio</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        <div className={styles.content}>
          {/* Types Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>
                <Tag size={20} />
                Tipos
              </h3>
              <button
                onClick={() => setShowCreateType(!showCreateType)}
                className={styles.addButton}
                disabled={loading}
              >
                <Plus size={20} />
                tipo
              </button>
            </div>

            {showCreateType && (
              <div className={styles.createForm}>
                <input
                  type="text"
                  placeholder="Nombre del nuevo tipo..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.formActions}>
                  <button
                    onClick={handleCreateType}
                    className={styles.confirmButton}
                    disabled={loading}
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateType(false);
                      setNewTypeName('');
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* <div className={styles.searchBox}>
              <Search size={20} color='lightgray'/>
              <input
                type="text"
                placeholder="Buscar tipo..."
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className={styles.searchInput}
              />
            </div> */}

            <div className={styles.typesList}>
              {loading ? (
                <div className={styles.loading}>Cargando...</div>
              ) : filteredTypes.length === 0 ? (
                <div className={styles.noResults}>
                  {searchType ? 'No se encontraron tipos' : 'No hay tipos registrados'}
                </div>
              ) : (
                filteredTypes.map(type => (
                  <div
                    key={type.id_type}
                    className={`${styles.typeItem} ${selectedType?.id_type === type.id_type ? styles.selected : ''}`}
                  >
                    <div
                      className={styles.typeHeader}
                      onClick={() => handleTypeSelect(type)}
                    >
                      <span>{type.name_type}</span>
                      <button className={styles.expandButton}>
                        {expandedType === type.id_type ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    
                    {expandedType === type.id_type && (
                      <div className={styles.subtypesList}>
                        {displayedSubtypes.length > 0 ? (
                          displayedSubtypes.map(subtype => (
                            <div key={subtype.id_subtype} className={styles.subtypeItem}>
                              <Tags size={14} />
                              {subtype.name_subtype}
                            </div>
                          ))
                        ) : (
                          <div className={styles.noSubtypes}>
                            No hay subtipos para este tipo
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subtypes Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>
                <Tags size={20} />
                Subtipos
                {/* {selectedType && (
                  <span className={styles.selectedTypeLabel}>
                    ({selectedType.name_type})
                  </span>
                )} */}
              </h3>
              <button
                onClick={() => setShowCreateSubtype(!showCreateSubtype)}
                className={styles.addButton}
                disabled={!selectedTypeForSubtype || loading}
                title={!selectedTypeForSubtype ? 'Selecciona un tipo primero' : ''}
              >
                <Plus size={20} />
                Subtipo
              </button>
            </div>

            {showCreateSubtype && selectedTypeForSubtype && (
              <div className={styles.createForm}>
                <div className={styles.selectedTypeInfo}>
                  Crear subtipo para: <strong>{selectedTypeForSubtype.name_type}</strong>
                </div>
                <input
                  type="text"
                  placeholder="Nombre del nuevo subtipo..."
                  value={newSubtypeName}
                  onChange={(e) => setNewSubtypeName(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.formActions}>
                  <button
                    onClick={handleCreateSubtype}
                    className={styles.confirmButton}
                    disabled={loading}
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateSubtype(false);
                      setNewSubtypeName('');
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* {selectedType && (
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar subtipo..."
                  value={searchSubtype}
                  onChange={(e) => setSearchSubtype(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )} */}

            <div className={styles.subtypesMainList}>
              {!selectedType ? (
                <div className={styles.noTypeSelected}>
                  Selecciona un tipo para ver sus subtipos
                </div>
              ) : displayedSubtypes.length === 0 ? (
                <div className={styles.noResults}>
                  {searchSubtype ? 'No se encontraron subtipos' : 'No hay subtipos para este tipo'}
                </div>
              ) : (
                displayedSubtypes.map(subtype => (
                  <div key={subtype.id_subtype} className={styles.subtypeMainItem}>
                    <Tags size={16} />
                    <span>{subtype.name_subtype}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.infoNote}>
            <AlertCircle size={14} />
            Los nuevos tipos y subtipos requieren aprobación del administrador
          </div>
          <button onClick={onClose} className={styles.closeModalButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopTypeManagementForm;