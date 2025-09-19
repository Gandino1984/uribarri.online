// src/components/info_management/InfoManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import InfoBoard from './components/InfoBoard.jsx';
import FiltersForOrganizations from './components/filters_for_organizations/FiltersForOrganizations.jsx';
import OrganizationsList from './components/organizations_list/OrganizationsList.jsx';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  const { fetchUserOrganizations } = useOrganization();
  
  const [activeView, setActiveView] = useState('board'); // 'board' or 'organizations'
  
  useEffect(() => {
    // Show top bar when info management is active
    setShowTopBar(true);
  }, [setShowTopBar]);
  
  useEffect(() => {
    // Fetch user's organizations if they're an organization manager
    if (currentUser?.id_user && currentUser?.type_user === 'organization_manager') {
      fetchUserOrganizations(currentUser.id_user);
    }
  }, [currentUser, fetchUserOrganizations]);
  
  // Check if user is organization manager to show organizations tab
  const isOrganizationManager = currentUser?.type_user === 'organization_manager';
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {activeView === 'board' ? 'Tablón Informativo' : 'Gestión de Asociaciones'}
        </h1>
        <p className={styles.subtitle}>
          {activeView === 'board' 
            ? 'Mantente al día con las últimas novedades de tu barrio'
            : 'Busca y únete a las asociaciones de tu comunidad'
          }
        </p>
      </div>
      
      {/* Tab navigation for organization managers */}
      {isOrganizationManager && (
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeView === 'board' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('board')}
          >
            Publicaciones
          </button>
          <button
            className={`${styles.tabButton} ${activeView === 'organizations' ? styles.activeTab : ''}`}
            onClick={() => setActiveView('organizations')}
          >
            Asociaciones
          </button>
        </div>
      )}
      
      <div className={styles.content}>
        {activeView === 'board' ? (
          <InfoBoard />
        ) : (
          <>
            <FiltersForOrganizations />
            <OrganizationsList />
          </>
        )}
      </div>
    </div>
  );
};

export default InfoManagement;