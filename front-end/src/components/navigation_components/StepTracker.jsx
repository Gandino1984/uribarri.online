import React from 'react';
import styles from '../../../css/StepTracker.module.css';

// Enhanced StepTracker with connecting lines, active and completed states
const StepTracker = ({ currentStep, totalSteps }) => {
  return (
    <div
      className={styles.stepIndicator}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin="1"
      aria-valuemax={totalSteps}
      aria-label={`Paso ${currentStep} de ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={index}>
            <div
              className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              aria-current={isActive ? "step" : undefined}
              title={`Paso ${stepNumber} de ${totalSteps}`}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div className={styles.stepLine}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepTracker;