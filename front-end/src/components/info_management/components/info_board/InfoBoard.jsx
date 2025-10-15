//update: src/components/info_management/components/info_board/InfoBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useOrganization } from '../../../../app_context/OrganizationContext.jsx';
import { usePublication } from '../../../../app_context/PublicationContext.jsx';
import ActionButtonsPublication from '../../components/ActionButtonsPublication.jsx';
import PublicationCreationForm from '../../components/PublicationCreationForm.jsx';
import FiltersForPublications from './components/FiltersForPublications.jsx';
import styles from '../../../../../css/InfoBoard.module.css';
import { Calendar, User, Clock, Image as ImageIcon, AlertCircle, CheckCircle, EyeOff, Filter } from 'lucide-react';

const InfoBoard = () => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  const { userOrganizations } = useOrganization();
  const { 
    filteredPublications, 
    publicationsLoading,
    fetchAllPublications,
    filters,
    publications
  } = usePublication();
  
  const [editingPublication, setEditingPublication] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  //update: Get API base URL for image paths
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3007';
  
  const fetchPublications = useCallback(async () => {
    await fetchAllPublications();
  }, [fetchAllPublications]);
  
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
  
  //update: Enhanced image URL construction with proper encoding and logging
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log('No image path provided');
      return null;
    }
    
    console.log('Getting image URL for path:', imagePath);
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('Path is already a full URL:', imagePath);
      return imagePath;
    }
    
    // Clean the path - remove leading slashes
    let cleanPath = imagePath.replace(/^\/+/, '');
    
    // The path from database should be like: assets/images/organizations/<org_name>/publications/publication_<id>.webp
    // We need to properly encode each segment
    const pathSegments = cleanPath.split('/');
    const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
    const encodedPath = encodedSegments.join('/');
    
    const fullUrl = `${API_BASE_URL}/${encodedPath}`;
    
    console.log('Constructed publication image URL:', {
      original: imagePath,
      clean: cleanPath,
      encoded: encodedPath,
      fullUrl: fullUrl
    });
    
    return fullUrl;
  };
  
  //update: Handle image click to open modal
  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = getImageUrl(imagePath);
      console.log('Opening image modal with path:', fullImagePath);
      openImageModal(fullImagePath);
    }
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.filterByOrganization) count++;
    if (filters.filterByUser) count++;
    if (filters.sortOrder !== 'newest') count++;
    return count;
  };
  
  const handleToggleFilters = () => {
    setShowFilters(prev => !prev);
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
          <div className={styles.filtersButtonContainer}>
            <button
              className={`${styles.filtersButton} ${showFilters ? styles.filtersButtonActive : ''}`}
              onClick={handleToggleFilters}
              type="button"
              title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <Filter size={18} />
              <span>Filtros</span>
              {getActiveFiltersCount() > 0 && (
                <span className={styles.filtersBadge}>{getActiveFiltersCount()}</span>
              )}
            </button>
            <div className={styles.resultsCount}>
              {filteredPublications.length !== publications.length && (
                <span className={styles.filteredCount}>
                  {filteredPublications.length} de {publications.length} publicaciones
                </span>
              )}
            </div>
          </div>

          {showFilters && (
            <FiltersForPublications onClose={() => setShowFilters(false)} />
          )}
          
          {publicationsLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p className={styles.loadingText}>Cargando publicaciones...</p>
            </div>
          )}
          
          {!publicationsLoading && filteredPublications.length === 0 && (
            <div className={styles.emptyContainer}>
              <AlertCircle size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {filters.searchTerm 
                  ? `No se encontraron publicaciones que coincidan con "${filters.searchTerm}"`
                  : filters.filterByUser || filters.filterByOrganization
                    ? "No hay publicaciones con los filtros seleccionados"
                    : "No hay publicaciones aprobadas disponibles"
                }
              </p>
              {(filters.filterByUser || filters.filterByOrganization || filters.searchTerm) && (
                <button 
                  className={styles.resetButton}
                  onClick={() => setShowFilters(true)}
                >
                  Ver todas las publicaciones
                </button>
              )}
            </div>
          )}
          
          {!publicationsLoading && filteredPublications.length > 0 && (
            <div className={styles.publicationsGrid}>
              {filteredPublications.map(publication => {
                //update: Log publication data for debugging
                console.log('Rendering publication:', {
                  id: publication.id_publication,
                  title: publication.title_pub,
                  image_pub: publication.image_pub,
                  organization: publication.organization?.name_org
                });
                
                return (
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
                    
                    {/*update: Enhanced image display with better error handling */}
                    {publication.image_pub && (
                      <div 
                        className={styles.publicationImageWrapper}
                        onClick={() => handleImageClick(publication.image_pub)}
                      >
                        <img 
                          src={getImageUrl(publication.image_pub)}
                          alt={publication.title_pub}
                          className={styles.publicationImage}
                          onLoad={(e) => {
                            console.log('✅ Publication image loaded successfully:', {
                              publicationId: publication.id_publication,
                              imagePath: publication.image_pub,
                              url: e.target.src
                            });
                          }}
                          onError={(e) => {
                            console.error('❌ Failed to load publication image:', {
                              publicationId: publication.id_publication,
                              imagePath: publication.image_pub,
                              attemptedUrl: e.target.src,
                              naturalWidth: e.target.naturalWidth,
                              naturalHeight: e.target.naturalHeight
                            });
                            
                            // Hide the image wrapper entirely if image fails to load
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
                );
              })}
            </div>
          )}
          
          {!publicationsLoading && filteredPublications.length > 0 && (
            <div className={styles.publicationsCount}>
              <p>
                Mostrando {filteredPublications.length} {filteredPublications.length === 1 ? 'publicación aprobada' : 'publicaciones aprobadas'}
                {filters.searchTerm && ` para "${filters.searchTerm}"`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfoBoard;