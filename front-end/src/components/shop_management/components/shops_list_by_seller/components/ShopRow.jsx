import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopsListBySeller.module.css';

/**
 * Component for a single shop row in the shops table
 * 
 * @param {Object} props
 * @param {Object} props.shop - Shop data object
 * @param {boolean} props.isSelected - Whether this shop is currently selected
 * @param {Function} props.onSelect - Handler for when the row is clicked
 * @param {Function} props.onUpdate - Handler for when the update button is clicked
 * @param {Function} props.onDelete - Handler for when the delete button is clicked
 * @param {boolean} props.showSubtype - Whether to show the subtype column
 */
const ShopRow = ({ 
  shop, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  showSubtype = true // 📱 UPDATE: Added prop to conditionally show subtype column
}) => {
  return (
    <tr 
      className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}
      onClick={() => onSelect(shop)}
      // 📏 UPDATE: Removed fixed height to allow natural content height
    >
      <td className={styles.actionsCell}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(shop);
          }}
          className={styles.updateButton}
          title="Actualizar comercio"
          style={{ flexShrink: 0 }}
        >
          <Edit size={16} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shop.id_shop);
          }}
          className={styles.deleteButton}
          title="Eliminar comercio"
          style={{ flexShrink: 0 }}
        >
          <Trash2 size={16} />
        </button>
      </td>
      <td className={styles.tableCell} title={shop.name_shop}>
        {shop.name_shop}
      </td>
      <td className={styles.tableCell} title={shop.location_shop}>
        {shop.location_shop}
      </td>
      <td className={styles.tableCell} title={shop.type_shop}>
        {shop.type_shop}
      </td>
      {/* 📱 UPDATE: Only render subtype column if showSubtype is true */}
      {showSubtype && (
        <td className={styles.tableCell} title={shop.subtype_shop}>
          {shop.subtype_shop}
        </td>
      )}
      <td className={styles.tableCell}>
        {shop.calification_shop}/5
      </td>
    </tr>
  );
};

export default ShopRow;