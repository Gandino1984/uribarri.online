// src/components/info_management/components/info_board/components/PublicationReader.jsx
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../app_context/UIContext.jsx';
import ActionButtonsPublication from '../../../components/ActionButtonsPublication.jsx';
import { X, Calendar, Clock, User, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../../../../css/PublicationReader.module.css';

const PublicationReader = ({ publication, onClose, onEdit, onDelete, onToggleActive, onRefresh }) => {
  const { currentUser } = useAuth();
  const { openImageModal } = useUI();
  const contentRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http.//localhost:3007';

  const slideAnimation = useSpring({
    from: {
      opacity: 0,
      transform: 'translateX(100%)',
    },
    to: {
      opacity: 1,
      transform: 'translateX(0%)',
    },
    config: {
      tension: 200,
      friction: 25
    }
  });

  useEffect(() => {
    // Prevent body scroll when reader is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Focus on content for keyboard navigation
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    let cleanPath = imagePath.replace(/^\/+/, '');
    const pathSegments = cleanPath.split('/');
    const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
    const encodedPath = encodedSegments.join('/');

    return `${API_BASE_URL}/${encodedPath}`;
  };

  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = getImageUrl(imagePath);
      openImageModal(fullImagePath);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!publication) return null;

  return (
    <animated.div
      className={styles.readerContainer}
      style={slideAnimation}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      ref={contentRef}
    >
        <div className={styles.readerHeader}>
          <div className={styles.headerTop}>
            <div className={styles.organizationInfo}>
              {publication.organization && (
                <div className={styles.organizationBadge}>
                  <CheckCircle size={16} />
                  <span>{publication.organization.name_org}</span>
                </div>
              )}
            </div>

            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar (Esc)"
            >
              <X size={24} />
            </button>
          </div>

          <h1 className={styles.title}>{publication.title_pub}</h1>

          <div className={styles.metadata}>
            <div className={styles.publisherInfo}>
              {publication.publisher?.image_user ? (
                <img
                  src={getImageUrl(publication.publisher.image_user)}
                  alt={publication.publisher.name_user}
                  className={styles.publisherAvatar}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = e.target.nextElementSibling;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : (
                <div className={styles.publisherAvatarPlaceholder}>
                  <User size={20} />
                </div>
              )}
              <span className={styles.publisherName}>
                {publication.publisher?.name_user || 'Usuario desconocido'}
              </span>
            </div>

            <div className={styles.dateTimeInfo}>
              <div className={styles.dateTimeItem}>
                <Calendar size={16} />
                <span>{formatDate(publication.date_pub)}</span>
              </div>
              {publication.time_pub && (
                <div className={styles.dateTimeItem}>
                  <Clock size={16} />
                  <span>{formatTime(publication.time_pub)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actionsWrapper}>
            <ActionButtonsPublication
              publication={publication}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onRefresh={onRefresh}
            />
          </div>
        </div>

        <div className={styles.readerContent}>
          {publication.image_pub && (
            <div
              className={styles.imageContainer}
              onClick={() => handleImageClick(publication.image_pub)}
            >
              <img
                src={getImageUrl(publication.image_pub)}
                alt={publication.title_pub}
                className={styles.publicationImage}
                onError={(e) => {
                  console.error('Failed to load publication image:', publication.image_pub);
                  e.target.parentElement.style.display = 'none';
                }}
              />
              <div className={styles.imageOverlay}>
                <ImageIcon size={32} />
                <span>Haz clic para ampliar</span>
              </div>
            </div>
          )}

          <div className={styles.contentText}>
            <p>{publication.content_pub}</p>
          </div>
        </div>
    </animated.div>
  );
};

export default PublicationReader;
