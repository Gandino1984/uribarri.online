// src/components/info_management/InfoManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import InfoBoard from './components/InfoBoard.jsx';
import FiltersForOrganizations from './components/FiltersForOrganizations.jsx';
import OrganizationsList from './components/OrganizationsList.jsx';
import OrganizationCreationForm from './components/OrganizationCreationForm.jsx';
import { Plus, X } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  const { fetchUserOrganizations, userOrganizations, fetchAllOrganizations } = useOrganization();
  
  const [activeView, setActiveView] = useState('board'); // 'board' or 'organizations'
  const [showCreationForm, setShowCreationForm] = useState(false);
  
  useEffect(() => {
    // Show top bar when info management is active
    setShowTopBar(true);
  }, [setShowTopBar]);
  
  useEffect(() => {
    // Fetch user's organizations when component mounts
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  }, [currentUser, fetchUserOrganizations]);
  
  // Check if user is logged in
  const isLoggedIn = !!currentUser;
  
  //update: Enhanced debugging for is_manager
  console.log('=== InfoManagement is_manager Debug ===');
  console.log('currentUser:', currentUser);
  console.log('currentUser?.is_manager:', currentUser?.is_manager);
  console.log('Type of is_manager:', typeof currentUser?.is_manager);
  console.log('isLoggedIn:', isLoggedIn);
  
  // Check if user has is_manager permission from their user profile
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  console.log('isManager evaluated to:', isManager);
  console.log('activeView:', activeView);
  console.log('Should show create button?:', isLoggedIn && isManager && activeView === 'organizations');
  console.log('=======================================');
  
  // Handle successful organization creation
  const handleOrganizationCreated = (newOrg) => {
    setShowCreationForm(false);
    // Refresh organizations list
    fetchAllOrganizations();
    // Refresh user's organizations
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
    // Optionally switch to organizations view
    setActiveView('organizations');
  };
  
  // Toggle creation form
  const toggleCreationForm = () => {
    setShowCreationForm(prev => !prev);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {activeView === 'board' ? 'Tablón Informativo' : 'Asociaciones de la Comunidad'}
        </h1>
        <p className={styles.subtitle}>
          {activeView === 'board' 
            ? 'Mantente al día con las últimas novedades de tu barrio'
            : 'Busca y únete a las asociaciones de tu comunidad'
          }
        </p>
      </div>
      
      {/* Tab navigation only for logged-in users */}
      {isLoggedIn && (
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
      
      {/* Show creation button for users with is_manager=true in organizations view */}
      {isLoggedIn && isManager && activeView === 'organizations' && (
        <div className={styles.managerActions}>
          <button
            className={`${styles.createButton} ${showCreationForm ? styles.createButtonActive : ''}`}
            onClick={toggleCreationForm}
            title={showCreationForm ? "Cerrar formulario" : "Crear nueva organización"}
          >
            {showCreationForm ? (
              <>
                <X size={18} />
                <span>Cerrar formulario</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Crear Organización</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <div className={styles.content}>
        {activeView === 'board' ? (
          <InfoBoard />
        ) : (
          // Show organizations view with conditional creation form
          isLoggedIn ? (
            <>
              {/* Show creation form if toggled and user is a manager */}
              {showCreationForm && isManager && (
                <OrganizationCreationForm 
                  onSuccess={handleOrganizationCreated}
                  onCancel={() => setShowCreationForm(false)}
                />
              )}
              <FiltersForOrganizations />
              <OrganizationsList />
            </>
          ) : (
            <div className={styles.loginMessage}>
              <p>Debes iniciar sesión para ver y unirte a las asociaciones.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InfoManagement;