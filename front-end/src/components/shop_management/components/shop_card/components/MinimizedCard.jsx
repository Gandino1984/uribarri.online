import React, { memo } from 'react';
import { Maximize2 } from 'lucide-react';
import styles from '../../../../../../public/css/ShopCard.module.css';

const MinimizedCard = memo(({ toggleMinimized }) => {
  return (
    <div className={styles.minimizedCard} onClick={toggleMinimized}>
      <div className={styles.minimizedContent}>
        <span className={styles.minimizedText}>Tarjeta de comercio</span>
        <Maximize2 size={18} className={styles.toggleIcon} />
      </div>
    </div>
  );
});

export default MinimizedCard;