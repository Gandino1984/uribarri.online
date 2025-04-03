import { useEffect, useState, useRef } from 'react';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import ShopPackagesListUtils from './ShopPackagesListUtils.jsx';

import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';
import ConfirmationModal from '../../../../../../../confirmation_modal/ConfirmationModal.jsx';
import ShopCard from '../../../../../shop_card/ShopCard.jsx';
import useScreenSize from '../../../../../shop_card/components/useScreenSize.js';
import PackageCard from './components/PackageCard.jsx';

// Import components
import SearchBar from './components/SearchBar.jsx';
import PackageActionButtons from './components/PackageActionButtons.jsx';
import PackagesCount from './components/PackagesCount.jsx';
import NoPackagesMessage from './components/NoPackagesMessage.jsx';
import NoShopSelected from './components/NoShopSelected.jsx';
import PackagesTable from './components/PackagesTable.jsx';

// Import animations
import { useTransition, animated } from '@react-spring/web';
import { formAnimation, fadeInScale } from '../../../../../../../../utils/animation/transitions.js';

const ShopPackagesList = ({ onBack }) => {
  // UI context
  const {
    clearError, setError,
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    setShowSuccessCard,
    setShowErrorCard,
    setSuccess
  } = useUI();

  // Shop context
  const { selectedShop } = useShop();

  // Package context
  const {
    packages,
    setPackages,
    packageToDelete, setPackageToDelete,
    packageListKey,
    refreshPackageList,
    closePackageFormWithAnimation
  } = usePackage();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedPackages, setDisplayedPackages] = useState([]);
  const [showPackageCard, setShowPackageCard] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [activeActionsMenu, setActiveActionsMenu] = useState(null);
  
  // Add refs to track deletion
  const deletionInProgress = useRef(false);
  const currentDeletingPackage = useRef(null);
  
  // Animation visibility state
  const [isVisible, setIsVisible] = useState(true);
  
  // Get screen size for responsive behavior
  const isSmallScreen = useScreenSize(768);
  
  // Get all Utils from ShopPackagesListUtils
  const {
    fetchPackagesByShop,
    deletePackage,
    handleDeletePackage,
    handleAddPackage,
    handleUpdatePackage,
    handleToggleActiveStatus,
    formatDate,
    formatActiveStatus,
    handlePackageRowClick: handleRowClick,
    toggleActionsMenu: toggleActionsMenuFn,
    handleSearchChange: handleSearchChangeFn,
    getProductDetailsForPackage,
    filterPackages
  } = ShopPackagesListUtils();
  
  // Create animation transitions using React Spring
  const contentTransition = useTransition(isVisible, {
    ...formAnimation,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });

  // Create separate transition for ShopCard
  const shopCardTransition = useTransition(isVisible && selectedShop, {
    ...fadeInScale,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });
  
  // Wrapper Utils
  const handleSearchChange = (e) => {
    handleSearchChangeFn(e, setSearchTerm);
  };
  
  const toggleActionsMenu = (packageId, e) => {
    toggleActionsMenuFn(packageId, activeActionsMenu, setActiveActionsMenu, e);
  };
  
  const handlePackageRowClick = (pkg) => {
    handleRowClick(pkg, setSelectedPackageDetails, setShowPackageCard);
  };
  
  // Package fetching with error handling
  useEffect(() => {
    const loadPackages = async () => {
      console.log('ShopPackagesList - Fetching packages for shop:', selectedShop?.id_shop);
      if (selectedShop?.id_shop) {
        try {
          const fetchedPackages = await fetchPackagesByShop();
          console.log(`Loaded ${fetchedPackages?.length || 0} packages for shop ${selectedShop.id_shop}`);
          setIsVisible(true);
        } catch (error) {
          console.error('Error loading packages:', error);
          setError(prevError => ({
            ...prevError,
            productError: "Error al cargar los paquetes"
          }));
          setShowErrorCard(true);
        }
      }
    };
    
    loadPackages();
  }, [selectedShop, packageListKey, fetchPackagesByShop, setError, setShowErrorCard]);
  
  // Update displayed packages when search term changes
  useEffect(() => {
    if (!Array.isArray(packages)) {
      console.log('Packages is not an array:', packages);
      setDisplayedPackages([]);
      return;
    }

    console.log(`Filtering ${packages.length} packages with search term`);
    
    // Apply search term if provided
    let filtered = packages;
    if (searchTerm && searchTerm.trim() !== '') {
      filtered = filterPackages(packages, searchTerm);
    }
    
    console.log(`Displaying ${filtered.length} packages after filtering`);
    setDisplayedPackages(filtered);
  }, [packages, searchTerm, filterPackages]);
  
  // Handle package deletion
  useEffect(() => {
    // Only run if isAccepted changes to true and we're not already in the middle of deletion
    if (isAccepted && !deletionInProgress.current) {
      const handleConfirmedDelete = async () => {
        try {
          // Set flag to prevent duplicate deletions
          deletionInProgress.current = true;
          
          // Clear any existing success messages
          setSuccess(prev => ({
            ...prev,
            productSuccess: '',
            createSuccess: '',
            updateSuccess: '',
            deleteSuccess: ''
          }));
          
          console.log('Beginning package deletion process');
          
          if (packageToDelete) {
            // Store current package ID being deleted to avoid re-processing
            currentDeletingPackage.current = packageToDelete;
            console.log('Deleting package with ID:', packageToDelete);
            
            const result = await deletePackage(packageToDelete);
            console.log('Delete API result:', result);
            
            if (result.success) {
              console.log('Package deleted successfully, fetching updated package list');
              
              // First fetch updated packages
              await fetchPackagesByShop();
              
              // Set a success message for deletion
              setSuccess(prev => ({
                ...prev,
                deleteSuccess: "Paquete eliminado." 
              }));
              setShowSuccessCard(true);
              
              // Refresh UI
              refreshPackageList();
            } else {
              console.error('Package deletion failed:', result.message);
              setError(prevError => ({
                ...prevError,
                productError: result.message || "Error al eliminar el paquete"
              }));
            }
          }
        } catch (error) {
          console.error('Error during package deletion process:', error);
          setError(prevError => ({
            ...prevError,
            productError: "Error al eliminar el paquete: " + (error.message || "Error desconocido")
          }));
        } finally {
          // Reset all delete-related state
          setPackageToDelete(null);
          setIsAccepted(false);
          clearError();
          
          // Reset our deletion flags
          deletionInProgress.current = false;
          currentDeletingPackage.current = null;
        }
      };

      handleConfirmedDelete();
    }
  }, [isAccepted, packageToDelete, deletePackage, fetchPackagesByShop, refreshPackageList, setSuccess, setError, setPackageToDelete, setIsAccepted, clearError, setShowSuccessCard]);
  
  // Handle deletion cancellation
  useEffect(() => {
    if (isDeclined) {
      setPackageToDelete(null);
      setIsDeclined(false);
      clearError();
      
      // Reset deletion flags on cancel
      deletionInProgress.current = false;
      currentDeletingPackage.current = null;
    }
  }, [isDeclined, setPackageToDelete, setIsDeclined, clearError]);
  
  // Handle clicks outside active menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close menu if clicking outside of an actions cell
      if (activeActionsMenu !== null && !event.target.closest(`.${styles.actionsCellWrapper}`)) {
        setActiveActionsMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionsMenu]);
  
  if (!selectedShop) {
    console.log('No shop selected in ShopPackagesList');
    return <NoShopSelected />;
  }

  return (
    <>
      <ConfirmationModal 
        isOpen={isModalOpen}
        onConfirm={() => {
          setIsModalOpen(false);
          setIsAccepted(true);
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setIsDeclined(true);
        }}
      />

      {showPackageCard && selectedPackageDetails && (
        <PackageCard 
          package={selectedPackageDetails}
          productDetails={getProductDetailsForPackage(selectedPackageDetails)}
          onClose={() => {
            setShowPackageCard(false);
            setSelectedPackageDetails(null);
          }} 
        />
      )}

      {contentTransition((style, item) => 
        item && (
          <animated.div style={style} className={styles.container}>
            {/* Animated ShopCard */}
            {shopCardTransition((cardStyle, shop) => 
              shop && (
                <animated.div style={cardStyle} className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
                  <ShopCard shop={selectedShop} />
                </animated.div>
              )
            )}

            <div className={styles.listHeaderTop}>
              <div className={styles.listTitleWrapper}>
                <div className={styles.titleWithBackButton}>
                  <button 
                    onClick={onBack}
                    className={styles.backButton}
                    title="Volver a productos"
                  >
                    ← Productos
                  </button>
                  <h1 className={styles.listTitle}>Lista de Paquetes</h1>
                </div>
              </div>
              
              <SearchBar 
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                placeholder="Buscar paquetes..."
              />
              
              <div className={styles.buttonGroupContainer}>
                <PackageActionButtons 
                  handleAddPackage={handleAddPackage}
                  selectedPackages={[]}
                  displayedPackages={displayedPackages}
                />
              </div>
            </div>

            {displayedPackages.length === 0 ? (
              <NoPackagesMessage packages={packages} />
            ) : (       
              <div className={styles.tableContainer}>
                <PackagesCount 
                  displayedPackages={displayedPackages}
                />
                
                <PackagesTable 
                  displayedPackages={displayedPackages}
                  formatDate={formatDate}
                  formatActiveStatus={formatActiveStatus}
                  handlePackageRowClick={handlePackageRowClick}
                  activeActionsMenu={activeActionsMenu}
                  toggleActionsMenu={toggleActionsMenu}
                  handleUpdatePackage={handleUpdatePackage}
                  handleDeletePackage={handleDeletePackage}
                  handleToggleActiveStatus={handleToggleActiveStatus}
                  currentDeletingPackage={currentDeletingPackage}
                  getProductDetailsForPackage={getProductDetailsForPackage}
                />
              </div>
            )}
          </animated.div>
        )
      )}
    </>
  );
};

export default ShopPackagesList;