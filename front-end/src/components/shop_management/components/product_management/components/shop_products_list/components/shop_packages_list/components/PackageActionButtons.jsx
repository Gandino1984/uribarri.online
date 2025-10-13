import React, { useState, useEffect } from 'react';
import { 
  Package, 
  PackagePlus
} from 'lucide-react';
import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';

const PackageActionButtons = ({ 
  handleAddPackage,
  selectedPackages,
  displayedPackages
}) => {
  // 📱 Add state to track if we're on a small screen
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);
  
  // 📱 Set icon size based on screen size
  const [iconSize, setIconSize] = useState(17);
  
  // 📱 Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 600;
      setIsSmallScreen(smallScreen);
      setIconSize(smallScreen ? 16 : 17);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={styles.buttonGroup}>
      <button
        onClick={handleAddPackage}
        className={`${styles.actionButton} ${styles.addButton}`}
        title="Añadir paquete"
      >
        <PackagePlus size={iconSize} />
        <span className={styles.buttonText}>Añadir Paquete</span>
      </button>
    </div>
  );
};

export default PackageActionButtons;