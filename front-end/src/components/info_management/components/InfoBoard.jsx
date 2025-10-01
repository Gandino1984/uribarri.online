//update: src/components/info_management/components/info_board/InfoBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../src/app_context/AuthContext.jsx';
import { useUI } from '../../../../src/app_context/UIContext.jsx';
import { useOrganization } from '../../../../src/app_context/OrganizationContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import ActionButtonsPublication from '../components/ActionButtonsPublication.jsx';
import PublicationCreationForm from '../components/PublicationCreationForm.jsx';
import styles from '../../../../../public/css/InfoBoard.module.css';
import { Calendar, User, Clock, Image as ImageIcon, AlertCircle, CheckCircle, EyeOff } from 'lucide-react';

const InfoBoard = () => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  const { userOrganizations } = useOrganization();
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterByUser, setFilterByUser] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [editingPublication, setEditingPublication] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  //update: Get API base URL for image paths
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3007';
  
  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/publication');
      
      if (response.data && !response.data.error) {
        let pubs = response.data.data || [];
        
        const isManager = userOrganizations?.some(p => p.org_managed);
        
        if (!isManager) {
          pubs = pubs.filter(pub => pub.pub_approved === true && pub.publication_active !== false);
        } else {
          pubs = pubs.filter(pub => {
            if (pub.pub_approved === true) {
              const isManagedOrg = userOrganizations?.some(
                p => p.org_managed && p.id_org === pub.id_org
              );
              if (isManagedOrg) return true;
              
              return pub.publication_active !== false;
            }
            return false;
          });
        }
        
        if (filterByUser) {
          pubs = pubs.filter(pub => pub.id_user_pub === filterByUser);
        }
        
        if (sortOrder === 'oldest') {
          pubs.reverse();
        }
        
        setPublications(pubs);
      } else {
        setError(prev => ({ 
          ...prev, 
          publicationError: response.data.error || 'Error al cargar publicaciones' 
        }));
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(prev => ({ 
        ...prev, 
        publicationError: 'Error al cargar las publicaciones' 
      }));
    } finally {
      setLoading(false);
    }
  }, [filterByUser, sortOrder, setError, userOrganizations]);
  
  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);
  
  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    setShowEditForm(true);
  };
  
  const handleEditSuccess = (updatedPublication) => {
    setShowEditForm(false);
    setEditingPublication(null);
    fetchPublications();
  };
  
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingPublication(null);
  };
  
  const handleDeletePublication = (publicationId) => {
    fetchPublications();
  };
  
  const handleToggleActive = (publicationId, newStatus) => {
    setPublications(prevPubs => 
      prevPubs.map(pub => 
        pub.id_publication === publicationId 
          ? { ...pub, publication_active: newStatus }
          : pub
      )
    );
    fetchPublications();
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };
  
  //update: Fixed handleImageClick to construct full URL properly
  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = `${API_BASE_URL}/${imagePath}`;
      console.log('Opening image modal with path:', fullImagePath);
      openImageModal(fullImagePath);
    }
  };
  
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterByUser(value === 'all' ? null : parseInt(value));
  };
  
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  const getUniquePublishers = () => {
    const publishers = new Map();
    publications.forEach(pub => {
      if (pub.publisher) {
        publishers.set(pub.publisher.id_user, pub.publisher.name_user);
      }
    });
    return Array.from(publishers, ([id, name]) => ({ id, name }));
  };
  
  //update: Helper function to construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${API_BASE_URL}/${imagePath}`;
  };
  
  return (
    <div className={styles.container}>
      {showEditForm && editingPublication && (
        <PublicationCreationForm 
          onSuccess={handleEditSuccess}
          onCancel={handleCancelEdit}
          editMode={true}
          publicationData={editingPublication}
        />
      )}
      
      {!showEditForm && (
        <>
          <div className={styles.controls}>
            <div className={styles.filterSection}>
              <label htmlFor="userFilter" className={styles.filterLabel}>
                Filtrar por usuario:
              </label>
              <select 
                id="userFilter"
                className={styles.filterSelect}
                onChange={handleFilterChange}
                value={filterByUser || 'all'}
              >
                <option value="all">Todos los usuarios</option>
                {getUniquePublishers().map(publisher => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.sortSection}>
              <label htmlFor="sortOrder" className={styles.filterLabel}>
                Ordenar:
              </label>
              <select 
                id="sortOrder"
                className={styles.filterSelect}
                onChange={handleSortChange}
                value={sortOrder}
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>
          
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p className={styles.loadingText}>Cargando publicaciones...</p>
            </div>
          )}
          
          {!loading && publications.length === 0 && (
            <div className={styles.emptyContainer}>
              <AlertCircle size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {filterByUser 
                  ? "No hay publicaciones aprobadas de este usuario"
                  : "No hay publicaciones aprobadas disponibles"}
              </p>
              {filterByUser && (
                <button 
                  className={styles.resetButton}
                  onClick={() => setFilterByUser(null)}
                >
                  Ver todas las publicaciones
                </button>
              )}
            </div>
          )}
          
          {!loading && publications.length > 0 && (
            <div className={styles.publicationsGrid}>
              {publications.map(publication => (
                <article 
                  key={publication.id_publication} 
                  className={`${styles.publicationCard} ${publication.publication_active === false ? styles.inactiveCard : ''}`}
                >
                  <div className={styles.cardHeaderWrapper}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.publicationTitle}>{publication.title_pub}</h2>
                      {publication.publisher && (
                        <div className={styles.publisherInfo}>
                          {publication.publisher.image_user ? (
                            <img 
                              src={getImageUrl(publication.publisher.image_user)}
                              alt={publication.publisher.name_user}
                              className={styles.publisherAvatar}
                              onError={(e) => {
                                console.error('Failed to load publisher image:', publication.publisher.image_user);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className={styles.publisherAvatarPlaceholder}>
                              <User size={16} />
                            </div>
                          )}
                          <span className={styles.publisherName}>
                            {publication.publisher.name_user}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <ActionButtonsPublication
                      publication={publication}
                      onEdit={handleEditPublication}
                      onDelete={handleDeletePublication}
                      onToggleActive={handleToggleActive}
                      onRefresh={fetchPublications}
                    />
                  </div>
                  
                  {publication.publication_active === false && (
                    <div className={styles.inactiveBadge}>
                      <EyeOff size={14} />
                      <span>Publicación desactivada</span>
                    </div>
                  )}
                  
                  {publication.organization && (
                    <div className={styles.organizationBadge}>
                      <CheckCircle size={14} />
                      <span>{publication.organization.name_org}</span>
                    </div>
                  )}
                  
                  {/*update: Moved image above text content */}
                  {publication.image_pub && (
                    <div 
                      className={styles.publicationImageWrapper}
                      onClick={() => handleImageClick(publication.image_pub)}
                    >
                      <img 
                        src={getImageUrl(publication.image_pub)}
                        alt={publication.title_pub}
                        className={styles.publicationImage}
                        onLoad={() => {
                          console.log('Publication image loaded successfully:', publication.image_pub);
                        }}
                        onError={(e) => {
                          console.error('Failed to load publication image:', publication.image_pub);
                          console.error('Attempted URL:', getImageUrl(publication.image_pub));
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                      <div className={styles.imageOverlay}>
                        <ImageIcon size={24} />
                        <span>Ver imagen</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <p className={styles.publicationContent}>{publication.content_pub}</p>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.dateTime}>
                      <div className={styles.dateTimeItem}>
                        <Calendar size={14} />
                        <span>{formatDate(publication.date_pub)}</span>
                      </div>
                      {publication.time_pub && (
                        <div className={styles.dateTimeItem}>
                          <Clock size={14} />
                          <span>{formatTime(publication.time_pub)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {!loading && publications.length > 0 && (
            <div className={styles.publicationsCount}>
              <p>
                Mostrando {publications.length} {publications.length === 1 ? 'publicación aprobada' : 'publicaciones aprobadas'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfoBoard;