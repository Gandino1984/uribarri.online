import React from 'react';
import styles from '../../../../public/css/ShopCreationForm.module.css';

const StepTracker = ({ currentStep, totalSteps }) => {
  return (
    <div className={styles.stepTracker}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`${styles.stepDot} ${currentStep === index + 1 ? styles.active : ''}`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
};

export default StepTracker;