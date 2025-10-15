import React from 'react';
import styles from '../../../css/StepTracker.module.css';

// 📱 UPDATE: Enhanced StepTracker with improved responsive design and accessibility
const StepTracker = ({ currentStep, totalSteps }) => {
  return (
    <div 
      className={styles.stepTracker}
      role="progressbar" 
      aria-valuenow={currentStep} 
      aria-valuemin="1" 
      aria-valuemax={totalSteps}
      aria-label={`Paso ${currentStep} de ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        
        return (
          <div 
            key={index}
            className={`${styles.stepDot} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? "step" : undefined}
            title={`Paso ${stepNumber} de ${totalSteps}`}
          >
            {stepNumber}
          </div>
        );
      })}
    </div>
  );
};

export default StepTracker;