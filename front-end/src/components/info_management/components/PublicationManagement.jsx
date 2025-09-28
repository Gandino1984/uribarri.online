// src/components/info_management/components/PublicationManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import styles from '../../../../../public/css/PublicationManagement.module.css';

const PublicationManagement = ({ organizationId }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [approvingPub, setApprovingPub] = useState(null);
  const [rejectingPub, setRejectingPub] = useState(null);
  
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
      case 'rejected':
        return publications.filter(pub => pub.pub_approved === false && pub.reviewed);
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
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Gestión de Publicaciones</h3>
        <p className={styles.subtitle}>
          Aprueba o rechaza las publicaciones de los miembros de tu organización
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
      </div>
      
      {/* Publications list */}
      {filteredPublications.length === 0 ? (
        <div className={styles.emptyContainer}>
          <FileText size={48} />
          <p>No hay publicaciones {filterStatus !== 'all' ? `${filterStatus === 'pending' ? 'pendientes' : 'aprobadas'}` : ''}</p>
        </div>
      ) : (
        <div className={styles.publicationsList}>
          {filteredPublications.map(pub => (
            <div key={pub.id_publication} className={`${styles.publicationCard} ${!pub.pub_approved ? styles.pending : ''}`}>
              {/* Status badge */}
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
                  onClick={() => openImageModal(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${pub.image_pub}`)}
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