import React from 'react';
import styles from './ShopTypeButton.module.css';

const ShopTypeButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={styles.button} // Use the CSS module class
    >
      {children}
    </button>
  );
};

export default ShopTypeButton;