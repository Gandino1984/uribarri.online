// front-end/src/components/shop_management/components/product_management/components/product_creation_form/components/ProductBasicInfo.jsx
import React, { useEffect } from 'react';
import styles from '../../../../../../../../css/ProductCreationForm.module.css';
import { useProduct } from '../../../../../../../app_context/ProductContext.jsx';
import { useShop } from '../../../../../../../app_context/ShopContext.jsx';

const ProductBasicInfo = ({ 
  productData, 
  onProductDataChange, 
  setNewProductData,
  filterOptions
}) => {
  const { 
    categories, 
    subcategories, 
    fetchSubcategoriesByCategory,
    loadingCategories,
    loadingSubcategories,
    categoriesError
  } = useProduct();
  
  //update: Get selected shop to check if we're in update mode
  const { selectedShop } = useShop();
  
  //update: Check if we're updating an existing product
  const { selectedProductToUpdate } = useProduct();

  //update: Debug logs
  console.log('ProductBasicInfo - categories:', categories);
  console.log('ProductBasicInfo - subcategories:', subcategories);
  console.log('ProductBasicInfo - productData.id_category:', productData.id_category);
  console.log('ProductBasicInfo - loadingSubcategories:', loadingSubcategories);

  //update: Fetch subcategories when category changes or component mounts with a category
  useEffect(() => {
    console.log('Category effect triggered, id_category:', productData.id_category);
    if (productData.id_category) {
      console.log('Fetching subcategories for category:', productData.id_category);
      fetchSubcategoriesByCategory(productData.id_category);
    } else {
      // Clear subcategories if no category is selected
      console.log('No category selected, subcategories should be cleared');
    }
  }, [productData.id_category, fetchSubcategoriesByCategory]);

  //update: Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('Category selected:', categoryId);
    
    const selectedCategory = categories.find(cat => cat.id_category === parseInt(categoryId));
    console.log('Found category:', selectedCategory);
    
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
    
    console.log('Subcategory selected:', subcategoryId, selectedSubcategory);
    
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

  // Since categories are already filtered in ProductContext based on shop type,
  // we can use them directly
  console.log('Available categories for rendering:', categories);
  console.log('Available subcategories for rendering:', subcategories);

  return (
    <section className={styles.basicInfoSection}>
      <h2 className={styles.sectionTitle}>Información básica</h2>
      <p className={styles.sectionDescription}>
        Proporciona los detalles principales de tu producto
      </p>
      
      {/* Category Dropdown - From database */}
      <div className={styles.formField}>
        <select
          id="id_category"
          name="id_category"
          value={productData.id_category || ''}
          onChange={handleCategoryChange}
          required
          disabled={loadingCategories || categories.length === 0}
        >
          <option value="" disabled>
            {loadingCategories ? 'Cargando categorías...' : 
             categories.length === 0 ? 'No hay categorías disponibles' : 
             'Categoría:'}
          </option>
          {categories.map(category => (
            <option key={category.id_category} value={category.id_category}>
              {category.name_category}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Dropdown - Only show if a category is selected */}
      {productData.id_category && (
        <div className={styles.formField}>
          <select
            id="id_subcategory"
            name="id_subcategory"
            value={productData.id_subcategory || ''}
            onChange={handleSubcategoryChange}
            required
            disabled={loadingSubcategories}
          >
            <option value="" disabled>
              {loadingSubcategories ? 'Cargando subcategorías...' : 
               subcategories.length === 0 ? 'No hay subcategorías disponibles' : 
               'Subcategoría:'}
            </option>
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