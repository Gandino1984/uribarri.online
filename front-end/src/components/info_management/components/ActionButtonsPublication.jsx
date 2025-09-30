// src/components/info_management/components/ActionButtonsPublication.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { Edit, Trash2, Eye, EyeOff, MoreVertical, X } from 'lucide-react';
import styles from '../../../../../public/css/ActionButtonsPublication.module.css';

const ActionButtonsPublication = ({ 
  publication, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onRefresh 
}) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openConfirmationModal, closeConfirmationModal } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  
  //update: Check if current user manages the organization of this publication
  const isManagerOfPublication = () => {
    if (!currentUser || !publication.id_org) return false;
    
    // Check if user manages the organization that owns this publication
    const managedOrg = userOrganizations?.find(
      participation => participation.id_org === publication.id_org && participation.org_managed
    );
    
    return !!managedOrg;
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
  
  //update: Handle delete action
  const handleDelete = async () => {
    setShowMenu(false);
    
    openConfirmationModal(
      '¿Eliminar publicación?',
      `¿Estás seguro de que deseas eliminar la publicación "${publication.title_pub}"? Esta acción no se puede deshacer.`,
      async () => {
        setIsProcessing(true);
        setCurrentAction('delete');
        
        try {
          const response = await axiosInstance.delete(`/publication/remove-by-id/${publication.id_publication}`);
          
          if (!response.data.error) {
            setSuccess(prev => ({
              ...prev,
              deleteSuccess: 'Publicación eliminada exitosamente'
            }));
            
            if (onDelete) {
              onDelete(publication.id_publication);
            }
            
            if (onRefresh) {
              onRefresh();
            }
          } else {
            setError(prev => ({
              ...prev,
              deleteError: response.data.error
            }));
          }
        } catch (error) {
          console.error('Error deleting publication:', error);
          setError(prev => ({
            ...prev,
            deleteError: 'Error al eliminar la publicación'
          }));
        } finally {
          setIsProcessing(false);
          setCurrentAction(null);
          closeConfirmationModal();
        }
      },
      () => {
        // On cancel, just close the modal
        closeConfirmationModal();
      }
    );
  };
  
  //update: Handle toggle active/inactive status
  const handleToggleActive = async () => {
    setShowMenu(false);
    setIsProcessing(true);
    setCurrentAction('toggle');
    
    try {
      // Toggle the pub_active status (default to true if undefined)
      const currentStatus = publication.pub_active !== false;
      const newActiveStatus = !currentStatus;
      
      const response = await axiosInstance.patch('/publication/update', {
        id_publication: publication.id_publication,
        pub_active: newActiveStatus
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
  
  //update: Close menu when clicking outside
  const handleClickOutside = () => {
    if (showMenu) {
      setShowMenu(false);
    }
  };
  
  // Add event listener for clicks outside
  React.useEffect(() => {
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showMenu]);
  
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
            title={publication.pub_active !== false ? "Desactivar publicación" : "Activar publicación"}
          >
            {publication.pub_active !== false ? (
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