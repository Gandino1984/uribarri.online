// src/components/info_management/InfoManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import InfoBoard from './components/InfoBoard.jsx';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Show top bar when info management is active
    setShowTopBar(true);
  }, [setShowTopBar]);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tablón Informativo</h1>
        <p className={styles.subtitle}>
          Mantente al día con las últimas novedades de tu barrio
        </p>
      </div>
      
      <div className={styles.content}>
        <InfoBoard />
      </div>
    </div>
  );
};

export default InfoManagement;