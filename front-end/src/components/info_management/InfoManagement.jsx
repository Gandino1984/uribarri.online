// src/components/info_management/InfoManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import { usePublication } from '../../app_context/PublicationContext.jsx';
import InfoBoard from './components/InfoBoard.jsx';
import FiltersForOrganizations from './components/FiltersForOrganizations.jsx';
import OrganizationsList from './components/OrganizationsList.jsx';
import OrganizationCreationForm from './components/OrganizationCreationForm.jsx';
import PublicationCreationForm from './components/PublicationCreationForm.jsx';
import PublicationManagement from './components/PublicationManagement.jsx';
import { Plus, X, FileText, Users, Settings, ArrowLeft, LogIn } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { 
    setShowTopBar,
    setShowInfoManagement,
    setShowShopWindow,
    //update: Add setShowLandingPage for login redirect
    setShowLandingPage,
    //update: Add navigation intent
    setNavigationIntent
  } = useUI();
  const { currentUser, setIsLoggingIn } = useAuth();
  const { fetchUserOrganizations, userOrganizations, fetchAllOrganizations } = useOrganization();
  const { setFilterByOrganization } = usePublication();
  
  const [activeView, setActiveView] = useState('board');
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editingPublication, setEditingPublication] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrgForManagement, setSelectedOrgForManagement] = useState(null);
  const [showManagementButton, setShowManagementButton] = useState(false);
  
  useEffect(() => {
    setShowTopBar(true);
  }, [setShowTopBar]);
  
  //update: Only fetch user organizations if logged in
  useEffect(() => {
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  }, [currentUser, fetchUserOrganizations]);
  
  useEffect(() => {
    if (userOrganizations && userOrganizations.length > 0) {
      const hasManagement = userOrganizations.some(p => p.org_managed);
      setShowManagementButton(hasManagement);
      
      const managedOrgs = userOrganizations.filter(p => p.org_managed);
      if (managedOrgs.length === 1 && managedOrgs[0].organization) {
        setSelectedOrgForManagement(managedOrgs[0].organization);
      }
    }
  }, [userOrganizations]);
  
  const handleBackToShopWindow = () => {
    console.log('Navigating from InfoManagement back to ShopWindow');
    setShowInfoManagement(false);
    setShowShopWindow(true);
  };
  
  //update: Helper to redirect to login with intent
  const handleLoginRedirect = (intent) => {
    console.log('Redirecting to login with intent:', intent);
    setNavigationIntent(intent);
    setShowInfoManagement(false);
    setShowLandingPage(false);
    setIsLoggingIn(true);
  };
  
  const isLoggedIn = !!currentUser;
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  const belongsToOrganization = userOrganizations && userOrganizations.length > 0;
  const managesAnyOrganization = userOrganizations?.some(participation => participation.org_managed);
  
  const handleOrganizationCreated = (newOrg) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    fetchAllOrganizations();
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
    setActiveView('organizations');
  };
  
  const handleOrganizationUpdated = (updatedOrg) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    fetchAllOrganizations();
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  };
  
  const handlePublicationCreated = (newPub) => {
    setShowPublicationForm(false);
    setEditingPublication(null);
    setActiveView('board');
  };
  
  const toggleCreationForm = () => {
    //update: Check if logged in before allowing creation
    if (!isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    
    if (showCreationForm && isEditMode) {
      setIsEditMode(false);
      setEditingOrganization(null);
    }
    setShowCreationForm(prev => !prev);
  };
  
  const togglePublicationForm = () => {
    //update: Check if logged in before allowing publication creation
    if (!isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    
    setShowPublicationForm(prev => !prev);
    if (editingPublication) {
      setEditingPublication(null);
    }
  };
  
  const handleEditOrganization = (org) => {
    //update: Check if logged in before allowing edit
    if (!isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    
    console.log('Edit organization:', org);
    setEditingOrganization(org);
    setIsEditMode(true);
    setShowCreationForm(true);
  };
  
  const handleViewPublications = (org) => {
    console.log('View publications for organization:', org);
    setFilterByOrganization(org.id_organization);
    setSelectedOrgForManagement(org);
    setActiveView('management');
  };
  
  const handleOpenManagement = () => {
    setActiveView('management');
  };
  
  const handleCancelForm = () => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
  };
  
  const handleCancelPublicationForm = () => {
    setShowPublicationForm(false);
    setEditingPublication(null);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button 
          onClick={handleBackToShopWindow}
          className={styles.backButton}
          title="Volver al escaparate"
        >
          <ArrowLeft size={20} />
          <span>Al escaparate</span>
        </button>
        {/*update: Show login button if not logged in */}
        {!isLoggedIn && (
          <button 
            onClick={() => handleLoginRedirect('info')}
            className={styles.loginButton}
            title="Iniciar sesión para participar"
          >
            <LogIn size={18} />
            <span>Iniciar sesión</span>
          </button>
        )}
      </div>
      
      <div className={styles.header}>
        <h1 className={styles.title}>
          {activeView === 'board' ? 'Tablón Informativo de Uribarri' : 
           activeView === 'organizations' ? 'Asociaciones de Uribarri' :
           'Gestión de Publicaciones'}
        </h1>
        <p className={styles.subtitle}>
          {activeView === 'board' 
            ? 'Mantente al día con las últimas novedades de tu barrio'
            : activeView === 'organizations' 
            ? 'Busca y únete a las asociaciones de tu comunidad'
            : selectedOrgForManagement 
              ? `Gestionando: ${selectedOrgForManagement.name_org}`
              : 'Gestiona las publicaciones de tu organización'
          }
        </p>
        {/*update: Show info message for non-logged users */}
        {!isLoggedIn && activeView === 'board' && (
          <p className={styles.publicAccessNote}>
            Estás viendo el tablón en modo público. <button onClick={() => handleLoginRedirect('info')} className={styles.inlineLoginLink}>Inicia sesión</button> para crear publicaciones y unirte a asociaciones.
          </p>
        )}
      </div>
      
      {/*update: Show tabs for everyone, but some actions require login */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeView === 'board' ? styles.activeTab : ''}`}
          onClick={() => {
            setActiveView('board');
            setFilterByOrganization(null);
            setSelectedOrgForManagement(null);
          }}
        >
          Publicaciones
        </button>
        <button
          className={`${styles.tabButton} ${activeView === 'organizations' ? styles.activeTab : ''}`}
          onClick={() => {
            //update: Check if logged in before showing organizations
            if (!isLoggedIn) {
              handleLoginRedirect('info');
              return;
            }
            setActiveView('organizations');
            setSelectedOrgForManagement(null);
          }}
        >
          Asociaciones
          {!isLoggedIn && <span className={styles.loginRequiredBadge}>🔒</span>}
        </button>
      </div>
      
      {activeView === 'management' && (
        <div className={styles.backButtonContainer}>
          <button
            className={styles.backButton}
            onClick={() => {
              setActiveView('board');
              setSelectedOrgForManagement(null);
            }}
          >
            <ArrowLeft size={18} />
            <span>Volver al tablón</span>
          </button>
          {managesAnyOrganization && userOrganizations.filter(p => p.org_managed).length > 1 && (
            <div className={styles.orgSelector}>
              <label>Organización:</label>
              <select 
                value={selectedOrgForManagement?.id_organization || ''}
                onChange={(e) => {
                  const orgId = parseInt(e.target.value);
                  const org = userOrganizations.find(p => p.organization?.id_organization === orgId)?.organization;
                  setSelectedOrgForManagement(org);
                }}
                className={styles.orgSelect}
              >
                <option value="">-- Selecciona --</option>
                {userOrganizations
                  .filter(p => p.org_managed && p.organization)
                  .map(p => (
                    <option key={p.organization.id_organization} value={p.organization.id_organization}>
                      {p.organization.name_org}
                    </option>
                  ))
                }
              </select>
            </div>
          )}
        </div>
      )}
      
      {isLoggedIn && isManager && activeView === 'organizations' && !isEditMode && (
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
                <span>Crear Asociación</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {isLoggedIn && activeView === 'board' && (
        <div className={styles.boardActions}>
          {belongsToOrganization && (
            <button
              className={`${styles.createButton} ${showPublicationForm ? styles.createButtonActive : ''}`}
              onClick={togglePublicationForm}
              title={showPublicationForm ? "Cerrar formulario" : "Crear nueva publicación"}
            >
              {showPublicationForm ? (
                <>
                  <X size={18} />
                  <span>Cerrar formulario</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Crear Publicación</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      <div className={styles.content}>
        {activeView === 'board' ? (
          <>
            {showPublicationForm && (
              <PublicationCreationForm 
                onSuccess={handlePublicationCreated}
                onCancel={handleCancelPublicationForm}
                editMode={!!editingPublication}
                publicationData={editingPublication}
              />
            )}
            {/*update: Show InfoBoard for everyone (public access) */}
            <InfoBoard />
          </>
        ) : activeView === 'organizations' ? (
          isLoggedIn ? (
            <>
              {showCreationForm && (
                <OrganizationCreationForm 
                  onSuccess={isEditMode ? handleOrganizationUpdated : handleOrganizationCreated}
                  onCancel={handleCancelForm}
                  editMode={isEditMode}
                  organizationData={editingOrganization}
                />
              )}
              <FiltersForOrganizations />
              <OrganizationsList 
                onEditOrganization={handleEditOrganization}
                onViewPublications={handleViewPublications}
              />
            </>
          ) : (
            <div className={styles.loginMessage}>
              <LogIn size={48} />
              <p>Debes iniciar sesión para ver y unirte a las asociaciones.</p>
              <button onClick={() => handleLoginRedirect('info')} className={styles.loginCTA}>
                Iniciar sesión
              </button>
            </div>
          )
        ) : activeView === 'management' ? (
          <>
            {selectedOrgForManagement ? (
              <PublicationManagement organizationId={selectedOrgForManagement.id_organization} />
            ) : (
              <div className={styles.noOrgSelected}>
                <Users size={48} />
                <p>Por favor, selecciona una organización para gestionar sus publicaciones</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default InfoManagement;