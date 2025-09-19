// src/components/info_management/components/info_board/InfoBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../src/app_context/AuthContext.jsx';
import { useUI } from '../../../../src/app_context/UIContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import styles from '../../../../../public/css/InfoBoard.module.css';
import { Calendar, User, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react';

const InfoBoard = () => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterByUser, setFilterByUser] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Fetch all publications
  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/publication');
      
      if (response.data && !response.data.error) {
        let pubs = response.data.data || [];
        
        // Apply user filter if active
        if (filterByUser) {
          pubs = pubs.filter(pub => pub.id_user_pub === filterByUser);
        }
        
        // Apply sort order
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
  }, [filterByUser, sortOrder, setError]);
  
  // Initial load
  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);
  
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
  
  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Handle image click
  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${imagePath}`;
      openImageModal(fullImagePath);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterByUser(value === 'all' ? null : parseInt(value));
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  // Get unique publishers for filter dropdown
  const getUniquePublishers = () => {
    const publishers = new Map();
    publications.forEach(pub => {
      if (pub.publisher) {
        publishers.set(pub.publisher.id_user, pub.publisher.name_user);
      }
    });
    return Array.from(publishers, ([id, name]) => ({ id, name }));
  };
  
  return (
    <div className={styles.container}>
      {/* Filters and controls */}
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
      
      {/* Loading state */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Cargando publicaciones...</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && publications.length === 0 && (
        <div className={styles.emptyContainer}>
          <AlertCircle size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            {filterByUser 
              ? "No hay publicaciones de este usuario"
              : "No hay publicaciones disponibles en este momento"}
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
      
      {/* Publications grid */}
      {!loading && publications.length > 0 && (
        <div className={styles.publicationsGrid}>
          {publications.map(publication => (
            <article key={publication.id_publication} className={styles.publicationCard}>
              {/* Card header */}
              <div className={styles.cardHeader}>
                <h2 className={styles.publicationTitle}>{publication.title_pub}</h2>
                {publication.publisher && (
                  <div className={styles.publisherInfo}>
                    {publication.publisher.image_user ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${publication.publisher.image_user}`}
                        alt={publication.publisher.name_user}
                        className={styles.publisherAvatar}
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
              
              {/* Card content */}
              <div className={styles.cardContent}>
                <p className={styles.publicationContent}>{publication.content_pub}</p>
                
                {/* Publication image if exists */}
                {publication.image_pub && (
                  <div 
                    className={styles.publicationImageWrapper}
                    onClick={() => handleImageClick(publication.image_pub)}
                  >
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${publication.image_pub}`}
                      alt={publication.title_pub}
                      className={styles.publicationImage}
                    />
                    <div className={styles.imageOverlay}>
                      <ImageIcon size={24} />
                      <span>Ver imagen</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card footer */}
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
      
      {/* Publications count */}
      {!loading && publications.length > 0 && (
        <div className={styles.publicationsCount}>
          <p>
            Mostrando {publications.length} {publications.length === 1 ? 'publicación' : 'publicaciones'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoBoard;