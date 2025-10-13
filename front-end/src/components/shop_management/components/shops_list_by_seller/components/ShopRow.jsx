import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import styles from '../../../../../../public/css/ShopsListBySeller.module.css';


const ShopRow = ({ 
  shop, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  showSubtype = true 
}) => {
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
          className={styles.active}
          title="Actualizar comercio"
        >
          <Edit size={16} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shop.id_shop);
          }}
          className={styles.active}
          title="Eliminar comercio"
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