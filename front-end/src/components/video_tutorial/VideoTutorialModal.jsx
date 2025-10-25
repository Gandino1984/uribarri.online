// VideoTutorialModal.jsx - Context-aware video tutorial modal
import { useEffect } from 'react';
import { X, Youtube } from 'lucide-react';
import styles from '../../../css/VideoTutorialModal.module.css';

const VideoTutorialModal = ({ isOpen, onClose, videoUrl, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract video ID from YouTube URL or use as-is if it's already an ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    // If it's already an embed URL, return it
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Format: Just the video ID
    else if (url.length === 11 && !url.includes('/')) {
      videoId = url;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }

    return null;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleWrapper}>
            <Youtube size={24} className={styles.youtubeIcon} />
            <h2 className={styles.modalTitle}>{title || 'Video Tutorial'}</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar video"
            title="Cerrar (Esc)"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.videoWrapper}>
          {embedUrl ? (
            <iframe
              className={styles.videoIframe}
              src={embedUrl}
              title={title || 'Video Tutorial'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className={styles.noVideo}>
              <Youtube size={48} />
              <p>No hay video disponible para esta sección</p>
              <span className={styles.comingSoon}>Próximamente</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.footerText}>
            ¿Tienes dudas? Visita nuestro{' '}
            <a
              href="https://www.youtube.com/@uribarrionline"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              canal de YouTube
            </a>
            {' '}para más tutoriales
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialModal;
