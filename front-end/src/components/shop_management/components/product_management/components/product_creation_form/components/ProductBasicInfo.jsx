// front-end/src/components/shop_management/components/product_management/components/product_creation_form/components/ProductBasicInfo.jsx
import React, { useEffect } from 'react';
import styles from '../../../../../../../../../public/css/ProductCreationForm.module.css';
import { useProduct } from '../../../../../../../app_context/ProductContext.jsx';
import { useShop } from '../../../../../../../app_context/ShopContext.jsx';

const ProductBasicInfo = ({ 
  productData, 
  onProductDataChange, 
  productTypesAndSubtypes,
  filteredProductTypes,
  setNewProductData,
  filterOptions
}) => {
  //update: Get category-related data from context
  const { 
    categories, 
    subcategories, 
    fetchSubcategoriesByCategory,
    getAvailableProductTypesForShop,
    loadingCategories,
    categoriesError
  } = useProduct();
  
  //update: Get selected shop to check if we're in update mode
  const { selectedShop } = useShop();
  
  //update: Check if we're updating an existing product
  const { selectedProductToUpdate } = useProduct();

  //update: Debug logs
  console.log('ProductBasicInfo - categories:', categories);
  console.log('ProductBasicInfo - loadingCategories:', loadingCategories);
  console.log('ProductBasicInfo - categoriesError:', categoriesError);
  console.log('ProductBasicInfo - filteredProductTypes:', filteredProductTypes);
  console.log('ProductBasicInfo - selectedShop:', selectedShop);

  //update: Modified filtering logic
  // If we're updating a product, show all categories
  // If creating new product and shop has restrictions, apply filtering
  // If no categories match the filter, show all categories with a warning
  let availableCategories = categories;
  let showFilterWarning = false;
  
  if (!selectedProductToUpdate && filteredProductTypes.length > 0) {
    const filtered = categories.filter(cat => filteredProductTypes.includes(cat.name_category));
    
    if (filtered.length > 0) {
      availableCategories = filtered;
    } else {
      // No categories match the shop type - show all with warning
      showFilterWarning = true;
      console.warn('No categories match shop type restrictions. Showing all categories.');
    }
  }
  
  console.log('ProductBasicInfo - availableCategories:', availableCategories);

  //update: Fetch subcategories when category changes
  useEffect(() => {
    if (productData.id_category) {
      fetchSubcategoriesByCategory(productData.id_category);
    }
  }, [productData.id_category, fetchSubcategoriesByCategory]);

  //update: Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id_category === parseInt(categoryId));
    
    setNewProductData(prev => ({
      ...prev,
      id_category: categoryId,
      id_subcategory: '', // Reset subcategory
      type_product: selectedCategory ? selectedCategory.name_category : '', // For backward compatibility
      subtype_product: '' // Reset subtype
    }));
  };

  //update: Handle subcategory change
  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    const selectedSubcategory = subcategories.find(sub => sub.id_subcategory === parseInt(subcategoryId));
    
    onProductDataChange({
      target: {
        name: 'id_subcategory',
        value: subcategoryId
      }
    });
    
    // Also update subtype_product for backward compatibility
    if (selectedSubcategory) {
      onProductDataChange({
        target: {
          name: 'subtype_product',
          value: selectedSubcategory.name_subcategory
        }
      });
    }
  };

  //update: Show error state if categories failed to load
  if (categoriesError && !loadingCategories) {
    return (
      <section className={styles.basicInfoSection}>
        <h2 className={styles.sectionTitle}>Información básica</h2>
        <div className={styles.errorMessage}>
          {categoriesError}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.basicInfoSection}>
      <h2 className={styles.sectionTitle}>Información básica</h2>
      <p className={styles.sectionDescription}>
        Proporciona los detalles principales de tu producto
      </p>
      
      {/* Show warning if no categories match shop type */}
      {showFilterWarning && (
        <div className={styles.warningMessage}>
          <p>⚠️ No hay categorías que coincidan con el tipo de tienda "{selectedShop?.type_shop}". 
          Mostrando todas las categorías disponibles.</p>
        </div>
      )}
      
      {/* Category Dropdown - From database */}
      <div className={styles.formField}>
        <select
          id="id_category"
          name="id_category"
          value={productData.id_category}
          onChange={handleCategoryChange}
          required
          disabled={loadingCategories || availableCategories.length === 0}
        >
          <option value="" disabled>
            {loadingCategories ? 'Cargando categorías...' : 
             availableCategories.length === 0 ? 'No hay categorías disponibles' : 
             'Categoría:'}
          </option>
          {availableCategories.map(category => (
            <option key={category.id_category} value={category.id_category}>
              {category.name_category}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Dropdown - Only show if a category is selected */}
      {productData.id_category && subcategories.length > 0 && (
        <div className={styles.formField}>
          <select
            id="id_subcategory"
            name="id_subcategory"
            value={productData.id_subcategory}
            onChange={handleSubcategoryChange}
            required
          >
            <option value="" disabled>Subcategoría:</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.id_subcategory} value={subcategory.id_subcategory}>
                {subcategory.name_subcategory}
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