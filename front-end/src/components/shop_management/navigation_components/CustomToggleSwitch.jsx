import React from 'react';
import styles from '../../../../../public/css/CustomToggleSwitch.module.css';

const CustomToggleSwitch = ({ checked, onChange, leftLabel, rightLabel }) => {
  return (
    <div className={styles.toggleContainer}>
      <span className={`${styles.toggleLabel} ${!checked ? styles.active : ''}`}>
        {leftLabel}
      </span>
      
      <label className={styles.toggleSwitch}>
        <input 
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={styles.toggleInput}
        />
        <span className={styles.toggleSlider}>
          <span className={styles.toggleKnob}></span>
        </span>
      </label>
      
      <span className={`${styles.toggleLabel} ${checked ? styles.active : ''}`}>
        {rightLabel}
      </span>
    </div>
  );
};

export default CustomToggleSwitch;