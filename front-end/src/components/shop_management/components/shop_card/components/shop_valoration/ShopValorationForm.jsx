import React from 'react';
import { Star, Send, X, ShoppingBag, Loader } from 'lucide-react';
import { useAuth } from '../../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import useShopValorationForm from './ShopValorationFormUtils.jsx';
import styles from '../../../../../../../../public/css/ShopValorationForm.module.css';

const ShopValorationForm = ({ shop, onClose, onSubmitSuccess }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  //update: Use the updated utils hook
  const {
    rating,
    hoveredRating,
    comment,
    isSubmitting,
    canRate,
    rateMessage,
    existingValoration,
    hasPurchased,
    purchaseCheckLoading,
    handleRatingClick,
    handleRatingHover,
    handleRatingLeave,
    handleCommentChange,
    handleSubmit
  } = useShopValorationForm(shop, currentUser, setError, setSuccess, onClose, onSubmitSuccess);

  //update: Render stars component
  const renderStars = () => {
    const stars = [];
    const activeRating = hoveredRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${styles.starButton} ${i <= activeRating ? styles.filled : ''}`}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={handleRatingLeave}
          disabled={!canRate && !existingValoration}
        >
          <Star 
            size={24} 
            fill={i <= activeRating ? "currentColor" : "none"}
          />
        </button>
      );
    }
    
    return stars;
  };

  //update: Show loading state while checking purchase status
  if (purchaseCheckLoading) {
    return (
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Valorar comercio</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.loadingContainer}>
          <Loader size={24} className={styles.loadingIcon} />
          <p className={styles.loadingText}>Verificando elegibilidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {existingValoration ? 'Actualizar valoración' : 'Valorar comercio'}
        </h3>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      </div>
      
      {!canRate && !existingValoration ? (
        <div className={styles.messageContainer}>
          {/*update: Show purchase requirement message with icon */}
          {!hasPurchased && currentUser?.type_user === 'user' ? (
            <div className={styles.purchaseRequiredContainer}>
              <ShoppingBag size={48} className={styles.purchaseIcon} />
              <p className={styles.purchaseRequiredTitle}>Compra requerida</p>
              <p className={styles.purchaseRequiredMessage}>
                Para valorar este comercio, primero debes realizar una compra exitosa
              </p>
            </div>
          ) : (
            <p className={styles.errorMessage}>{rateMessage}</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.ratingSection}>
            <label className={styles.label}>Calificación</label>
            <div className={styles.starsContainer}>
              {renderStars()}
              <span className={styles.ratingText}>
                {rating > 0 ? `${rating} de 5` : 'Selecciona una calificación'}
              </span>
            </div>
          </div>
          
          <div className={styles.commentSection}>
            <label htmlFor="comment" className={styles.label}>
              Comentario (opcional)
            </label>
            <textarea
              id="comment"
              className={styles.textarea}
              value={comment}
              onChange={handleCommentChange}
              placeholder="Comparte tu experiencia con este comercio..."
              rows={4}
              maxLength={500}
            />
            <span className={styles.charCount}>
              {comment.length}/500
            </span>
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Enviando...' : (
                <>
                  <Send size={16} />
                  {existingValoration ? 'Actualizar' : 'Enviar valoración'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ShopValorationForm;