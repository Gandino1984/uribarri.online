import React from 'react';
import { ChevronLeft, ChevronRight, Box } from 'lucide-react';
import styles from '../../../../../public/css/ShopCreationForm.module.css';

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  isSubmitting = false,
  submitLabel = 'Submit',
  nextLabel = 'Siguiente',
  previousLabel = 'Anterior',
  processingLabel = 'Procesando...',
  SubmitIcon = Box,
  showSubmitButton = true
}) => {
  // UPDATE: Prevent event bubbling in navigation buttons
  const handleNextClick = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    if (onNext) onNext();
  };
  
  const handlePreviousClick = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    if (onPrevious) onPrevious();
  };
  
  return (
    <div className={styles.navigationButtons}>
      {currentStep > 1 && (
        <button 
          type="button" 
          className={styles.navButton}
          onClick={handlePreviousClick}
        >
          <ChevronLeft size={16} />
          {previousLabel}
        </button>
      )}
      
      {currentStep < totalSteps ? (
        <button 
          type="button" 
          className={styles.navButton}
          onClick={handleNextClick}
        >
          {nextLabel}
          <ChevronRight size={16} />
        </button>
      ) : (
        showSubmitButton && (
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
            style={{ 
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? processingLabel : submitLabel}
            {!isSubmitting && <SubmitIcon size={17} style={{ marginLeft: '5px' }} />}
          </button>
        )
      )}
    </div>
  );
};

export default NavigationButtons;