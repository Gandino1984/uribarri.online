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
 */
const ShopRow = ({ shop, isSelected, onSelect, onUpdate, onDelete }) => {
  return (
    <tr 
      className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}
      onClick={() => onSelect(shop)}
    >
      <td className={styles.actionsCell}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(shop);
          }}
          className={styles.updateButton}
          title="Actualizar comercio"
        >
          <Edit size={14} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shop.id_shop);
          }}
          className={styles.deleteButton}
          title="Eliminar comercio"
        >
          <Trash2 size={14} />
        </button>
      </td>
      <td className={styles.tableCell}>{shop.name_shop}</td>
      <td className={styles.tableCell}>{shop.location_shop}</td>
      <td className={styles.tableCell}>{shop.type_shop}</td>
      <td className={styles.tableCell}>{shop.subtype_shop}</td>
      <td className={styles.tableCell}>{shop.calification_shop}/5</td>
    </tr>
  );
};

export default ShopRow;