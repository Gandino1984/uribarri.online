// src/components/info_management/components/PublicationManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
//update: Import ActionButtonsPublication and PublicationCreationForm
import ActionButtonsPublication from './ActionButtonsPublication.jsx';
import PublicationCreationForm from './PublicationCreationForm.jsx';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, Image as ImageIcon, AlertCircle, EyeOff } from 'lucide-react';
import styles from '../../../../../public/css/PublicationManagement.module.css';

const PublicationManagement = ({ organizationId }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected, active, inactive
  const [approvingPub, setApprovingPub] = useState(null);
  const [rejectingPub, setRejectingPub] = useState(null);
  //update: Add state for edit form
  const [editingPublication, setEditingPublication] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Check if user is manager of the organization
  const isManager = userOrganizations?.some(
    participation => participation.id_org === organizationId && participation.org_managed
  );
  
  // Fetch publications for the organization
  const fetchOrganizationPublications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/publication/by-organization', {
        id_org: organizationId
      });
      
      if (response.data && !response.data.error) {
        const pubs = response.data.data || [];
        setPublications(pubs);
      } else {
        setPublications([]);
      }
    } catch (err) {
      console.error('Error fetching organization publications:', err);
      setError(prev => ({ 
        ...prev, 
        fetchError: 'Error al cargar las publicaciones' 
      }));
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      fetchOrganizationPublications();
    }
  }, [organizationId]);
  
  // Handle approve publication
  const handleApprovePublication = async (pubId) => {
    setApprovingPub(pubId);
    
    try {
      const response = await axiosInstance.patch('/publication/approve', {
        id_publication: pubId,
        pub_approved: true
      });
      
      if (!response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          approveSuccess: 'Publicación aprobada exitosamente' 
        }));
        // Refresh publications list
        await fetchOrganizationPublications();
      } else {
        setError(prev => ({ 
          ...prev, 
          approveError: response.data.error 
        }));
      }
    } catch (error) {
      console.error('Error approving publication:', error);
      setError(prev => ({ 
        ...prev, 
        approveError: 'Error al aprobar la publicación' 
      }));
    } finally {
      setApprovingPub(null);
    }
  };
  
  // Handle reject publication
  const handleRejectPublication = async (pubId) => {
    setRejectingPub(pubId);
    
    try {
      const response = await axiosInstance.patch('/publication/approve', {
        id_publication: pubId,
        pub_approved: false
      });
      
      if (!response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          rejectSuccess: 'Publicación rechazada' 
        }));
        // Refresh publications list
        await fetchOrganizationPublications();
      } else {
        setError(prev => ({ 
          ...prev, 
          rejectError: response.data.error 
        }));
      }
    } catch (error) {
      console.error('Error rejecting publication:', error);
      setError(prev => ({ 
        ...prev, 
        rejectError: 'Error al rechazar la publicación' 
      }));
    } finally {
      setRejectingPub(null);
    }
  };
  
  //update: Handle edit publication
  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    setShowEditForm(true);
  };
  
  //update: Handle successful edit
  const handleEditSuccess = (updatedPublication) => {
    setShowEditForm(false);
    setEditingPublication(null);
    // Refresh publications
    fetchOrganizationPublications();
  };
  
  //update: Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingPublication(null);
  };
  
  //update: Handle delete publication (called from ActionButtonsPublication)
  const handleDeletePublication = (publicationId) => {
    // Just refresh the list after deletion
    fetchOrganizationPublications();
  };
  
  //update: Handle toggle active status (called from ActionButtonsPublication)
  const handleToggleActive = (publicationId, newStatus) => {
    // Update the local state immediately for better UX
    setPublications(prevPubs => 
      prevPubs.map(pub => 
        pub.id_publication === publicationId 
          ? { ...pub, publication_active: newStatus }
          : pub
      )
    );
    // Then refresh to ensure sync with database
    fetchOrganizationPublications();
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };
  
  // Filter publications based on status
  const getFilteredPublications = () => {
    switch (filterStatus) {
      case 'pending':
        return publications.filter(pub => !pub.pub_approved);
      case 'approved':
        return publications.filter(pub => pub.pub_approved === true);
      case 'active':
        return publications.filter(pub => pub.pub_approved === true && pub.publication_active !== false);
      case 'inactive':
        return publications.filter(pub => pub.publication_active === false);
      default:
        return publications;
    }
  };
  
  const filteredPublications = getFilteredPublications();
  
  if (!isManager) {
    return (
      <div className={styles.noAccessContainer}>
        <AlertCircle size={48} />
        <p>No tienes permisos para gestionar publicaciones de esta organización.</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando publicaciones...</p>
      </div>
    );
  }
  
  //update: Show edit form if editing
  if (showEditForm && editingPublication) {
    return (
      <PublicationCreationForm 
        onSuccess={handleEditSuccess}
        onCancel={handleCancelEdit}
        editMode={true}
        publicationData={editingPublication}
      />
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <h3 className={styles.title}>Gestión de Publicaciones</h3> */}
        <p className={styles.subtitle}>
          Administra las publicaciones de tu organización
        </p>
      </div>
      
      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filterStatus === 'all' ? styles.active : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Todas ({publications.length})
        </button>
        <button
          className={`${styles.filterTab} ${filterStatus === 'pending' ? styles.active : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pendientes ({publications.filter(p => !p.pub_approved).length})
        </button>
        <button
          className={`${styles.filterTab} ${filterStatus === 'approved' ? styles.active : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          Aprobadas ({publications.filter(p => p.pub_approved === true).length})
        </button>
        <button
          className={`${styles.filterTab} ${filterStatus === 'active' ? styles.active : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          Activas ({publications.filter(p => p.pub_approved === true && p.publication_active !== false).length})
        </button>
        <button
          className={`${styles.filterTab} ${filterStatus === 'inactive' ? styles.active : ''}`}
          onClick={() => setFilterStatus('inactive')}
        >
          Inactivas ({publications.filter(p => p.publication_active === false).length})
        </button>
      </div>
      
      {/* Publications list */}
      {filteredPublications.length === 0 ? (
        <div className={styles.emptyContainer}>
          <FileText size={48} />
          <p>No hay publicaciones {filterStatus !== 'all' ? `${
            filterStatus === 'pending' ? 'pendientes' : 
            filterStatus === 'approved' ? 'aprobadas' :
            filterStatus === 'active' ? 'activas' :
            'inactivas'
          }` : ''}</p>
        </div>
      ) : (
        <div className={styles.publicationsList}>
          {filteredPublications.map(pub => (
            <div key={pub.id_publication} className={`${styles.publicationCard} ${!pub.pub_approved ? styles.pending : ''} ${pub.publication_active === false ? styles.inactive : ''}`}>
              {/* Status badge */}
              <div className={styles.cardHeaderWrapper}>
                <div className={`${styles.statusBadge} ${pub.pub_approved ? styles.approved : styles.pendingBadge}`}>
                  {pub.pub_approved ? (
                    <>
                      <CheckCircle size={14} />
                      <span>Aprobada</span>
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Pendiente</span>
                    </>
                  )}
                </div>
                
                {/* update: Add ActionButtonsPublication for all publications */}
                <ActionButtonsPublication
                  publication={pub}
                  onEdit={handleEditPublication}
                  onDelete={handleDeletePublication}
                  onToggleActive={handleToggleActive}
                  onRefresh={fetchOrganizationPublications}
                />
              </div>
              
              {/* update: Show inactive badge if publication is inactive */}
              {pub.publication_active === false && (
                <div className={styles.inactiveBadge}>
                  <EyeOff size={14} />
                  <span>Publicación desactivada</span>
                </div>
              )}
              
              <div className={styles.publicationHeader}>
                <h4 className={styles.publicationTitle}>{pub.title_pub}</h4>
                {pub.publisher && (
                  <div className={styles.publisherInfo}>
                    <User size={14} />
                    <span>{pub.publisher.name_user}</span>
                  </div>
                )}
              </div>
              
              <p className={styles.publicationContent}>{pub.content_pub}</p>
              
              {pub.image_pub && (
                <div 
                  className={styles.publicationImage}
                  onClick={() => openImageModal(`${import.meta.env.VITE_API_URL}/${pub.image_pub}`)}
                >
                  <ImageIcon size={16} />
                  <span>Ver imagen</span>
                </div>
              )}
              
              <div className={styles.publicationMeta}>
                <Calendar size={14} />
                <span>{formatDate(pub.date_pub)}</span>
              </div>
              
              {!pub.pub_approved && (
                <div className={styles.approvalActions}>
                  <button
                    className={`${styles.actionButton} ${styles.approveButton}`}
                    onClick={() => handleApprovePublication(pub.id_publication)}
                    disabled={approvingPub === pub.id_publication || rejectingPub === pub.id_publication}
                  >
                    {approvingPub === pub.id_publication ? (
                      <>
                        <span className={styles.buttonLoader}></span>
                        <span>Aprobando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Aprobar</span>
                      </>
                    )}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.rejectButton}`}
                    onClick={() => handleRejectPublication(pub.id_publication)}
                    disabled={approvingPub === pub.id_publication || rejectingPub === pub.id_publication}
                  >
                    {rejectingPub === pub.id_publication ? (
                      <>
                        <span className={styles.buttonLoader}></span>
                        <span>Rechazando...</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Rechazar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicationManagement;