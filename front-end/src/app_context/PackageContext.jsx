import { createContext, useContext, useState } from 'react';
import { useShop } from './ShopContext';
import { useProduct } from './ProductContext';

const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const { selectedShop } = useShop();
  const { products } = useProduct();
  
  // Package state
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [showPackageCreationForm, setShowPackageCreationForm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  
  // 🎁 UPDATE: Added state to control the exit animation of PackageCreationForm
  const [shouldExitPackageForm, setShouldExitPackageForm] = useState(false);
  
  // Package creation/editing
  const [newPackageData, setNewPackageData] = useState({
    id_shop: '',
    id_product1: '',
    id_product2: null,
    id_product3: null,
    id_product4: null,
    id_product5: null,
    name_package: '',
    active_package: true
  });
  
  // Refresh control
  const [packageListKey, setPackageListKey] = useState(0);
  
  // Helper functions
  const refreshPackageList = () => {
    setPackageListKey(prevKey => prevKey + 1);
  };
  
  // 🎁 UPDATE: Add animation control functions
  const startFormExitAnimation = () => {
    // Set the flag to start exit animation
    setShouldExitPackageForm(true);
    
    // Return a promise that resolves when animation should be complete
    return new Promise(resolve => {
      setTimeout(() => {
        // Reset flag after animation duration
        setShouldExitPackageForm(false);
        resolve();
      }, 500); // Duration should match animation time in component
    });
  };
  
  // 🎁 UPDATE: Function to close package form with animation
  const closePackageFormWithAnimation = async () => {
    await startFormExitAnimation();
    setShowPackageCreationForm(false);
    setSelectedPackage(null);
  };
  
  // Function to set new package data with selected shop
  const initNewPackageData = () => {
    setNewPackageData({
      ...newPackageData,
      id_shop: selectedShop?.id_shop || ''
    });
  };
  
  // Reset package data
  const resetPackageData = () => {
    setNewPackageData({
      id_shop: selectedShop?.id_shop || '',
      id_product1: '',
      id_product2: null,
      id_product3: null,
      id_product4: null,
      id_product5: null,
      name_package: '',
      active_package: true
    });
  };

  const value = {
    packages, setPackages,
    selectedPackage, setSelectedPackage,
    isAddingPackage, setIsAddingPackage,
    showPackageCreationForm, setShowPackageCreationForm,
    packageToDelete, setPackageToDelete,
    newPackageData, setNewPackageData,
    packageListKey, refreshPackageList,
    shouldExitPackageForm,
    startFormExitAnimation,
    closePackageFormWithAnimation,
    initNewPackageData,
    resetPackageData
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
};

export default PackageContext;