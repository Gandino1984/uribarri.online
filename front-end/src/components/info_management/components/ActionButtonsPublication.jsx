// src/components/info_management/components/ActionButtonsPublication.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { Edit, Trash2, Eye, EyeOff, MoreVertical, X } from 'lucide-react';
import styles from '../../../../css/ActionButtonsPublication.module.css';

const ActionButtonsPublication = ({ 
  publication, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onRefresh 
}) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openModal } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  
  // Add event listener for clicks outside - MUST be before any conditional returns
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close menu if it's actually open and click is outside
      if (showMenu && !e.target.closest(`.${styles.container}`)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showMenu]);
  
  //update: Fixed manager check to properly match organization IDs with enhanced logging
  const isManagerOfPublication = () => {
    if (!currentUser || !publication.id_org) {
      console.log('🔴 ActionButtons - No currentUser or publication.id_org:', {
        hasCurrentUser: !!currentUser,
        userId: currentUser?.id_user,
        publicationIdOrg: publication.id_org,
        publicationTitle: publication.title_pub
      });
      return false;
    }

    // Check if user manages the organization that owns this publication
    // The userOrganizations array contains participation objects where
    // the organization data is nested inside an 'organization' property
    const managedOrg = userOrganizations?.find(
      participation => {
        // Check both possible structures for organization ID
        const orgId = participation.organization?.id_organization || participation.id_org;
        const isManaged = participation.org_managed;
        const matches = orgId === publication.id_org && isManaged;

        if (matches) {
          console.log('✅ Found managed organization match:', {
            orgId,
            publicationOrgId: publication.id_org,
            isManaged,
            publicationTitle: publication.title_pub
          });
        }

        return matches;
      }
    );

    const isManager = !!managedOrg;
    console.log('🔵 ActionButtons - isManager result:', {
      isManager,
      publicationId: publication.id_publication,
      publicationTitle: publication.title_pub,
      totalUserOrgs: userOrganizations?.length || 0
    });

    return isManager;
  };
  
  // Don't render if user is not a manager of this publication's organization
  if (!isManagerOfPublication()) {
    return null;
  }
  
  //update: Handle edit action
  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(publication);
    }
  };
  
  //update: Handle delete action with enhanced logging
  const handleDelete = async () => {
    console.log('��️ Delete button clicked for publication:', {
      id: publication.id_publication,
      title: publication.title_pub,
      hasImage: !!publication.image_pub,
      imagePath: publication.image_pub
    });

    setShowMenu(false);

    //update: CRITICAL FIX - Use openModal which matches ConfirmationModal component
    const confirmMessage = `¿Eliminar publicación?\n\n¿Estás seguro de que deseas eliminar la publicación "${publication.title_pub}"?\n\nEsta acción no se puede deshacer.`;

    console.log('🔔 Opening confirmation modal with openModal');
    openModal(confirmMessage, async (confirmed) => {
      if (confirmed) {
        console.log('🟢 User confirmed deletion for publication:', publication.id_publication);
        setIsProcessing(true);
        setCurrentAction('delete');

        try {
          console.log('📡 Sending DELETE request to:', `/publication/remove-by-id/${publication.id_publication}`);
          const response = await axiosInstance.delete(`/publication/remove-by-id/${publication.id_publication}`);

          console.log('📨 DELETE response received:', {
            hasError: !!response.data.error,
            message: response.data.message,
            data: response.data.data
          });

          if (!response.data.error) {
            console.log('✅ Publication deleted successfully');
            console.log('⏰ Waiting for backend transaction to commit...');

            // Add delay to ensure backend transaction is committed and database is updated
            await new Promise(resolve => setTimeout(resolve, 300));

            // Refresh first to get updated list
            if (onRefresh) {
              console.log('🔄 Calling onRefresh callback');
              await onRefresh();
              console.log('✅ Refresh completed');

              // Force a small delay after refresh to ensure React processes state updates
              await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Then call onDelete for any cleanup
            if (onDelete) {
              console.log('🔄 Calling onDelete callback');
              onDelete(publication.id_publication);
            }

            // Show success message after refresh completes
            setSuccess(prev => ({
              ...prev,
              deleteSuccess: 'Publicación eliminada exitosamente'
            }));
          } else {
            console.error('❌ Server returned error:', response.data.error);
            setError(prev => ({
              ...prev,
              deleteError: response.data.error
            }));
          }
        } catch (error) {
          console.error('❌ Error deleting publication:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          setError(prev => ({
            ...prev,
            deleteError: 'Error al eliminar la publicación'
          }));
        } finally {
          setIsProcessing(false);
          setCurrentAction(null);
        }
      } else {
        console.log('🔴 User cancelled deletion');
      }
    });
  };
  
  //update: Handle toggle active/inactive status
  const handleToggleActive = async () => {
    setShowMenu(false);
    setIsProcessing(true);
    setCurrentAction('toggle');
    
    try {
      // Toggle the publication_active status (default to true if undefined)
      const currentStatus = publication.publication_active !== false;
      const newActiveStatus = !currentStatus;
      
      const response = await axiosInstance.patch('/publication/update', {
        id_publication: publication.id_publication,
        publication_active: newActiveStatus
      });
      
      if (!response.data.error) {
        setSuccess(prev => ({
          ...prev,
          toggleSuccess: newActiveStatus 
            ? 'Publicación activada' 
            : 'Publicación desactivada'
        }));
        
        if (onToggleActive) {
          onToggleActive(publication.id_publication, newActiveStatus);
        }
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setError(prev => ({
          ...prev,
          toggleError: response.data.error
        }));
      }
    } catch (error) {
      console.error('Error toggling publication status:', error);
      setError(prev => ({
        ...prev,
        toggleError: 'Error al cambiar el estado de la publicación'
      }));
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };
  
  //update: Toggle menu visibility
  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  };
  
  return (
    <div className={styles.container}>
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        disabled={isProcessing}
        title="Acciones"
      >
        {isProcessing ? (
          <span className={styles.loader}></span>
        ) : (
          <MoreVertical size={20} />
        )}
      </button>
      
      {showMenu && !isProcessing && (
        <div className={styles.dropdownMenu}>
          <button
            className={styles.menuItem}
            onClick={handleEdit}
            title="Editar publicación"
          >
            <Edit size={16} />
            <span>Editar</span>
          </button>
          
          <button
            className={`${styles.menuItem} ${styles.toggleItem}`}
            onClick={handleToggleActive}
            title={publication.publication_active !== false ? "Desactivar publicación" : "Activar publicación"}
          >
            {publication.publication_active !== false ? (
              <>
                <EyeOff size={16} />
                <span>Desactivar</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Activar</span>
              </>
            )}
          </button>
          
          <div className={styles.menuDivider}></div>
          
          <button
            className={`${styles.menuItem} ${styles.deleteItem}`}
            onClick={handleDelete}
            title="Eliminar publicación"
          >
            <Trash2 size={16} />
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButtonsPublication;