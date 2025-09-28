import React, { useState, useEffect } from 'react';
import { Star, X, User, Calendar, MessageSquare } from 'lucide-react';
import axiosInstance from '../../../../../../../utils/app/axiosConfig.js';
import styles from '../../../../../../../../../public/css/UsersValorations.module.css';

const UsersValorations = ({ shop, onClose }) => {
  const [valorations, setValorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalValorations, setTotalValorations] = useState(0);

  useEffect(() => {
    fetchValorations();
  }, [shop.id_shop]);

  const fetchValorations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/shop-valoration/by-shop/${shop.id_shop}`);
      
      if (response.data && response.data.data) {
        setValorations(response.data.data);
        setTotalValorations(response.data.data.length);
        
        // Calculate average rating
        if (response.data.data.length > 0) {
          const sum = response.data.data.reduce((acc, val) => acc + val.calification_shop, 0);
          setAverageRating((sum / response.data.data.length).toFixed(1));
        }
      }
    } catch (err) {
      console.error('Error fetching valorations:', err);
      setError('Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i}
          size={16} 
          fill={i <= rating ? "currentColor" : "none"}
          className={i <= rating ? styles.filledStar : styles.emptyStar}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Valoraciones de {shop.name_shop}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Cargando valoraciones...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <button onClick={fetchValorations} className={styles.retryButton}>
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <div className={styles.averageRating}>
                  <span className={styles.averageNumber}>{averageRating}</span>
                  <div className={styles.averageStars}>
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className={styles.totalCount}>
                    {totalValorations} {totalValorations === 1 ? 'valoración' : 'valoraciones'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.valorationsList}>
              {valorations.length === 0 ? (
                <div className={styles.emptyState}>
                  <MessageSquare size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>
                    Este comercio aún no tiene valoraciones
                  </p>
                </div>
              ) : (
                valorations.map((valoration) => (
                  <div key={valoration.id_valoration} className={styles.valorationCard}>
                    <div className={styles.valorationHeader}>
                      <div className={styles.userInfo}>
                        <div className={styles.userIcon}>
                          <User size={16} />
                        </div>
                        <span className={styles.userName}>
                          {valoration.user?.name_user || 'Usuario anónimo'}
                        </span>
                      </div>
                      <div className={styles.valorationMeta}>
                        <div className={styles.stars}>
                          {renderStars(valoration.calification_shop)}
                        </div>
                        <div className={styles.date}>
                          <Calendar size={14} />
                          <span>{formatDate(valoration.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {valoration.comment_shop && (
                      <div className={styles.valorationComment}>
                        <p>{valoration.comment_shop}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersValorations;