//update: Fixed component for managing product categories and subcategories
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../../../utils/app/axiosConfig.js';
import { useAuth } from '../../../../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../../../../app_context/ShopContext.jsx';
import { X, Plus, Layers2, Search, ChevronDown, ChevronUp, Tag, Tags, AlertCircle, Layers } from 'lucide-react';
import styles from '../../../../../../../../../public/css/ProductCategoryManagementForm.module.css';

const ProductCategoryManagementForm = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { selectedShop } = useShop();
  
  //update: State for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});
  const [shopTypes, setShopTypes] = useState([]);
  
  //update: Form states
  const [searchCategory, setSearchCategory] = useState('');
  const [searchSubcategory, setSearchSubcategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState(null);
  const [selectedShopType, setSelectedShopType] = useState(null);
  
  //update: UI states
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateSubcategory, setShowCreateSubcategory] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //update: Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchShopTypes();
    if (selectedShop?.id_type) {
      setSelectedShopType({ id_type: selectedShop.id_type });
    }
  }, [selectedShop]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/product-category/verified');
      if (response.data.data) {
        setCategories(response.data.data);
        //update: Fetch subcategories for each category
        for (const category of response.data.data) {
          await fetchSubcategoriesByCategory(category.id_category, false);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías de productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopTypes = async () => {
    try {
      const response = await axiosInstance.get('/type/verified');
      if (response.data.data) {
        setShopTypes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching shop types:', err);
    }
  };

  const fetchSubcategoriesByCategory = async (categoryId, setExpanded = true) => {
    try {
      console.log(`Fetching subcategories for category ${categoryId}`);
      const response = await axiosInstance.get(`/product-subcategory/by-category/${categoryId}`);
      
      if (response.data.data) {
        console.log(`Found ${response.data.data.length} subcategories for category ${categoryId}:`, response.data.data);
        //update: Store subcategories by category ID
        setSubcategoriesByCategory(prev => ({
          ...prev,
          [categoryId]: response.data.data
        }));
        
        if (setExpanded) {
          setExpandedCategory(categoryId);
        }
      } else {
        console.log(`No subcategories found for category ${categoryId}`);
        setSubcategoriesByCategory(prev => ({
          ...prev,
          [categoryId]: []
        }));
      }
    } catch (err) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, err);
      setSubcategoriesByCategory(prev => ({
        ...prev,
        [categoryId]: []
      }));
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedCategoryForSubcategory(category);
    
    //update: Toggle expanded state
    if (expandedCategory === category.id_category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category.id_category);
      // Fetch subcategories if not already fetched
      if (!subcategoriesByCategory[category.id_category]) {
        fetchSubcategoriesByCategory(category.id_category, true);
      }
    }
    
    setSearchSubcategory('');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    if (!selectedShopType) {
      setError('Debes seleccionar un tipo de comercio para la categoría');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      //update: Create category first
      const categoryResponse = await axiosInstance.post('/product-category/create', {
        name_category: newCategoryName.trim(),
        createdby_category: currentUser?.name_user || currentUser?.email_user
      });

      if (categoryResponse.data.error) {
        setError(categoryResponse.data.error);
        return;
      }

      const newCategoryId = categoryResponse.data.data.id_category;
      
      //update: Then create type-category association
      const typeCategoryResponse = await axiosInstance.post('/type-category/create', {
        id_type: selectedShopType.id_type,
        id_category: newCategoryId
      });

      if (typeCategoryResponse.data.error) {
        setError(typeCategoryResponse.data.error);
      } else {
        setSuccess('¡Categoría de producto creada! Será revisada por un administrador.');
        setNewCategoryName('');
        setShowCreateCategory(false);
        fetchCategories();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Error al crear la categoría de producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      setError('El nombre de la subcategoría es obligatorio');
      return;
    }

    if (!selectedCategoryForSubcategory) {
      setError('Debes seleccionar una categoría primero');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.post('/product-subcategory/create', {
        name_subcategory: newSubcategoryName.trim(),
        id_category: selectedCategoryForSubcategory.id_category,
        createdby_subcategory: currentUser?.name_user || currentUser?.email_user
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess('¡Subcategoría creada! Será revisada por un administrador.');
        setNewSubcategoryName('');
        setShowCreateSubcategory(false);
        //update: Re-fetch subcategories for this category
        await fetchSubcategoriesByCategory(selectedCategoryForSubcategory.id_category, true);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error creating subcategory:', err);
      setError('Error al crear la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name_category.toLowerCase().includes(searchCategory.toLowerCase())
  );

  //update: Get current subcategories based on selected/expanded category
  const getCurrentSubcategories = (categoryId) => {
    const subcategories = subcategoriesByCategory[categoryId] || [];
    if (searchSubcategory) {
      return subcategories.filter(subcategory =>
        subcategory.name_subcategory.toLowerCase().includes(searchSubcategory.toLowerCase())
      );
    }
    return subcategories;
  };

  //update: Get all subcategories for the selected category (for the right panel)
  const getSelectedCategorySubcategories = () => {
    if (!selectedCategory) return [];
    return getCurrentSubcategories(selectedCategory.id_category);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <p>
            Gestionar Categorías de Productos
          </p>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        <div className={styles.content}>
          {/* Categories Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>
                <Layers2 size={20} />
                Categorías de Productos
              </h3>
              <button
                onClick={() => setShowCreateCategory(!showCreateCategory)}
                className={styles.addButton}
                disabled={loading}
              >
                <Plus size={20} />
                Categoría
              </button>
            </div>

            {showCreateCategory && (
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de comercio:</label>
                  <select
                    value={selectedShopType?.id_type || ''}
                    onChange={(e) => {
                      const type = shopTypes.find(t => t.id_type === parseInt(e.target.value));
                      setSelectedShopType(type);
                    }}
                    className={styles.select}
                  >
                    <option value="">Selecciona un tipo...</option>
                    {shopTypes.map(type => (
                      <option key={type.id_type} value={type.id_type}>
                        {type.name_type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={styles.input}
                />
                
                <div className={styles.formActions}>
                  <button
                    onClick={handleCreateCategory}
                    className={styles.confirmButton}
                    disabled={loading || !selectedShopType}
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateCategory(false);
                      setNewCategoryName('');
                      setSelectedShopType(null);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className={styles.searchBox}>
              <Search size={20} color='lightgray' />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.typesList}>
              {loading ? (
                <div className={styles.loading}>Cargando...</div>
              ) : filteredCategories.length === 0 ? (
                <div className={styles.noResults}>
                  {searchCategory ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                </div>
              ) : (
                filteredCategories.map(category => (
                  <div
                    key={category.id_category}
                    className={`${styles.typeItem} ${selectedCategory?.id_category === category.id_category ? styles.selected : ''}`}
                  >
                    <div
                      className={styles.typeHeader}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <span>{category.name_category}</span>
                      <button className={styles.expandButton}>
                        {expandedCategory === category.id_category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    
                    {expandedCategory === category.id_category && (
                      <div className={styles.subtypesList}>
                        {(() => {
                          const subcategories = getCurrentSubcategories(category.id_category);
                          return subcategories.length > 0 ? (
                            subcategories.map(subcategory => (
                              <div key={subcategory.id_subcategory} className={styles.subtypeItem}>
                                <Tags size={14} />
                                {subcategory.name_subcategory}
                              </div>
                            ))
                          ) : (
                            <div className={styles.noSubtypes}>
                              No hay subcategorías para esta categoría
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subcategories Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>
                <Layers size={20} />
                Subcategorías de producto
                {/* {selectedCategory && (
                  <span className={styles.selectedTypeLabel}>
                    ({selectedCategory.name_category})
                  </span>
                )} */}
              </h3>
              <button
                onClick={() => setShowCreateSubcategory(!showCreateSubcategory)}
                className={styles.addButton}
                disabled={!selectedCategoryForSubcategory || loading}
                title={!selectedCategoryForSubcategory ? 'Selecciona una categoría primero' : ''}
              >
                <Plus size={16} />
                Subcategoría
              </button>
            </div>

            {showCreateSubcategory && selectedCategoryForSubcategory && (
              <div className={styles.createForm}>
                <div className={styles.selectedTypeInfo}>
                  Crear subcategoría para: <strong>{selectedCategoryForSubcategory.name_category}</strong>
                </div>
                <input
                  type="text"
                  placeholder="Nombre de la nueva subcategoría..."
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.formActions}>
                  <button
                    onClick={handleCreateSubcategory}
                    className={styles.confirmButton}
                    disabled={loading}
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateSubcategory(false);
                      setNewSubcategoryName('');
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {selectedCategory && (
              <div className={styles.searchBox}>
                <Search size={20} color='lightgray' />
                <input
                  type="text"
                  placeholder="Buscar subcategoría..."
                  value={searchSubcategory}
                  onChange={(e) => setSearchSubcategory(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )}

            <div className={styles.subtypesMainList}>
              {!selectedCategory ? (
                <div className={styles.noTypeSelected}>
                  Selecciona una categoría para ver sus subcategorías
                </div>
              ) : (() => {
                const subcategories = getSelectedCategorySubcategories();
                return subcategories.length === 0 ? (
                  <div className={styles.noResults}>
                    {searchSubcategory ? 'No se encontraron subcategorías' : 'No hay subcategorías para esta categoría'}
                  </div>
                ) : (
                  subcategories.map(subcategory => (
                    <div key={subcategory.id_subcategory} className={styles.subtypeMainItem}>
                      <Tags size={16} />
                      <span>{subcategory.name_subcategory}</span>
                    </div>
                  ))
                );
              })()}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.infoNote}>
            <AlertCircle size={14} />
            Las nuevas categorías y subcategorías requieren aprobación del administrador
          </div>
          <button onClick={onClose} className={styles.closeModalButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryManagementForm;