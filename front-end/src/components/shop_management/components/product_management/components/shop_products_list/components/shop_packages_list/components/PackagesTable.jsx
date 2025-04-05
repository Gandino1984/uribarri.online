import React, { useState, useEffect } from 'react';
import PackageTableHeader from './PackageTableHeader';
import PackageTableRow from './PackageTableRow';
import styles from '../../../../../../../../../../../public/css/ShopPackagesList.module.css';

const PackagesTable = ({ 
  displayedPackages,
  formatDate,
  formatActiveStatus,
  handlePackageRowClick,
  activeActionsMenu,
  toggleActionsMenu,
  handleUpdatePackage,
  handleDeletePackage,
  handleToggleActiveStatus,
  currentDeletingPackage,
  getProductDetailsForPackage
}) => {
  // 📱 Enhanced window width tracking with initial state and breakpoints
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // 📱 Improved resize handler with debounce for better performance
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100); // Add small debounce of 100ms
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial width calculation
    setWindowWidth(window.innerWidth);
    
    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 📱 More granular breakpoints for responsive design
  const isSmallScreen = windowWidth <= 600;

  return (
    <div className={styles.tableResponsiveWrapper}>
      <table className={styles.table}>
        <thead>
          <PackageTableHeader 
            isSmallScreen={isSmallScreen}
          />
        </thead>
        <tbody>
          {displayedPackages.map((packageItem) => (
            <PackageTableRow 
              key={packageItem.id_package}
              package={packageItem}
              activeActionsMenu={activeActionsMenu}
              toggleActionsMenu={toggleActionsMenu}
              handleUpdatePackage={handleUpdatePackage}
              handleDeletePackage={handleDeletePackage}
              handleToggleActiveStatus={handleToggleActiveStatus}
              handlePackageRowClick={handlePackageRowClick}
              formatDate={formatDate}
              formatActiveStatus={formatActiveStatus}
              currentDeletingPackage={currentDeletingPackage}
              getProductDetailsForPackage={getProductDetailsForPackage}
              isSmallScreen={isSmallScreen}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackagesTable;