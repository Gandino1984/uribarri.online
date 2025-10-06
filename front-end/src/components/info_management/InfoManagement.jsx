// src/components/info_management/InfoManagement.jsx
import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import { usePublication } from '../../app_context/PublicationContext.jsx';
import InfoBoard from './components/info_board/InfoBoard.jsx';
import FiltersForOrganizations from './components/FiltersForOrganizations.jsx';
import OrganizationsList from './components/OrganizationsList.jsx';
import OrganizationCreationForm from './components/OrganizationCreationForm.jsx';
import PublicationCreationForm from './components/PublicationCreationForm.jsx';
import PublicationManagement from './components/PublicationManagement.jsx';
import PendingTransfersBadge from './components/PendingTransfersBadge.jsx';
//update: Import all utility functions
import {
  handleBackToShopWindow as utilHandleBackToShopWindow,
  handleLoginRedirect as utilHandleLoginRedirect,
  handleTransferProcessed as utilHandleTransferProcessed,
  handleOrganizationCreated as utilHandleOrganizationCreated,
  handleOrganizationUpdated as utilHandleOrganizationUpdated,
  handlePublicationCreated as utilHandlePublicationCreated,
  toggleCreationForm as utilToggleCreationForm,
  togglePublicationForm as utilTogglePublicationForm,
  handleEditOrganization as utilHandleEditOrganization,
  handleViewPublications as utilHandleViewPublications,
  handleOpenManagement as utilHandleOpenManagement,
  handleCancelForm as utilHandleCancelForm,
  handleCancelPublicationForm as utilHandleCancelPublicationForm,
  getHeaderTitle,
  getHeaderSubtitle,
  checkManagementPermissions,
  getManagedOrganizations
} from './InfoManagementUtils.jsx';
import { Plus, X, FileText, Users, Settings, ArrowLeft, LogIn } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { 
    setShowTopBar,
    setShowInfoManagement,
    setShowShopWindow,
    setShowLandingPage,
    setNavigationIntent
  } = useUI();
  const { currentUser, setIsLoggingIn } = useAuth();
  const { fetchUserOrganizations, userOrganizations, fetchAllOrganizations } = useOrganization();
  //update: Use resetFilters from context
  const { resetFilters } = usePublication();
  
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
  
  //update: Wrapper functions using imported utilities
  const handleBackToShopWindow = () => {
    utilHandleBackToShopWindow(setShowInfoManagement, setShowShopWindow);
  };
  
  const handleLoginRedirect = (intent) => {
    utilHandleLoginRedirect(
      intent,
      setNavigationIntent,
      setShowInfoManagement,
      setShowLandingPage,
      setIsLoggingIn
    );
  };
  
  const handleTransferProcessed = () => {
    utilHandleTransferProcessed(currentUser, fetchUserOrganizations, fetchAllOrganizations);
  };
  
  const handleOrganizationCreated = (newOrg) => {
    utilHandleOrganizationCreated(
      newOrg,
      setShowCreationForm,
      setIsEditMode,
      setEditingOrganization,
      fetchAllOrganizations,
      fetchUserOrganizations,
      currentUser,
      setActiveView
    );
  };
  
  const handleOrganizationUpdated = (updatedOrg) => {
    utilHandleOrganizationUpdated(
      updatedOrg,
      setShowCreationForm,
      setIsEditMode,
      setEditingOrganization,
      fetchAllOrganizations,
      fetchUserOrganizations,
      currentUser
    );
  };
  
  const handlePublicationCreated = (newPub) => {
    utilHandlePublicationCreated(
      newPub,
      setShowPublicationForm,
      setEditingPublication,
      setActiveView
    );
  };
  
  const toggleCreationForm = () => {
    utilToggleCreationForm(
      isLoggedIn,
      showCreationForm,
      isEditMode,
      setIsEditMode,
      setEditingOrganization,
      setShowCreationForm,
      () => handleLoginRedirect('info')
    );
  };
  
  const togglePublicationForm = () => {
    utilTogglePublicationForm(
      isLoggedIn,
      setShowPublicationForm,
      editingPublication,
      setEditingPublication,
      () => handleLoginRedirect('info')
    );
  };
  
  const handleEditOrganization = (org) => {
    utilHandleEditOrganization(
      org,
      isLoggedIn,
      setEditingOrganization,
      setIsEditMode,
      setShowCreationForm,
      () => handleLoginRedirect('info')
    );
  };
  
  const handleViewPublications = (org) => {
    //update: Pass null instead of resetFilters since utils expects setFilterByOrganization
    utilHandleViewPublications(
      org,
      null,
      setSelectedOrgForManagement,
      setActiveView
    );
  };
  
  const handleOpenManagement = () => {
    utilHandleOpenManagement(setActiveView);
  };
  
  const handleCancelForm = () => {
    utilHandleCancelForm(setShowCreationForm, setIsEditMode, setEditingOrganization);
  };
  
  const handleCancelPublicationForm = () => {
    utilHandleCancelPublicationForm(setShowPublicationForm, setEditingPublication);
  };
  
  const isLoggedIn = !!currentUser;
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  const belongsToOrganization = userOrganizations && userOrganizations.length > 0;
  const managesAnyOrganization = checkManagementPermissions(userOrganizations);
  const managedOrganizations = getManagedOrganizations(userOrganizations);
  
  //update: Handler for radio button toggle - resets filters when changing views
  const handleViewChange = (view) => {
    if (view === 'organizations' && !isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    setActiveView(view);
    //update: Reset filters when switching views
    resetFilters();
    setSelectedOrgForManagement(null);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        {/*update: Modern radio button toggle for navigation */}
        <div className={styles.radioToggleContainer}>
          <div className={styles.radioToggle}>
            <input
              type="radio"
              id="viewBoard"
              name="viewToggle"
              value="board"
              checked={activeView === 'board'}
              onChange={() => handleViewChange('board')}
              className={styles.radioInput}
            />
            <label htmlFor="viewBoard" 
            className={styles.radioLabel}
             title="Ir al tablón informativo"
            >
              Publicaciones
            </label>
            
            <input
              type="radio"
              id="viewOrganizations"
              name="viewToggle"
              value="organizations"
                checked={activeView === 'organizations'}
                onChange={() => handleViewChange('organizations')}
              className={styles.radioInput}
            />
            <label htmlFor="viewOrganizations" 
            className={styles.radioLabel}
            title="Gestiona tus asociaciones"
            >
              Asociaciones
              {!isLoggedIn && <span className={styles.lockIcon}>🔒</span>}
            </label>
            
            <div className={styles.radioSlider}></div>
          </div>
        </div>

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
        {isLoggedIn && (
          <PendingTransfersBadge onTransferProcessed={handleTransferProcessed} />
        )}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {getHeaderTitle(activeView, selectedOrgForManagement)}
        </h1>
        <p className={styles.subtitle}>
          {getHeaderSubtitle(activeView, selectedOrgForManagement)}
        </p>
        {!isLoggedIn && activeView === 'board' && (
          <p className={styles.publicAccessNote}>
            Estás viendo el tablón en modo público. Inicia sesión para crear publicaciones y unirte a asociaciones.
          </p>
        )}
      </div>
      
      {activeView === 'management' && (
        <div className={styles.backButtonContainer}>
          <button
            className={styles.backButton}
            onClick={() => {
              setActiveView('board');
              setSelectedOrgForManagement(null);
              //update: Reset filters when going back to board
              resetFilters();
            }}
          >
            <ArrowLeft size={18} />
            <span>Volver al tablón</span>
          </button>
          {managesAnyOrganization && managedOrganizations.length > 1 && (
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
                {managedOrganizations.map(p => (
                  <option key={p.organization.id_organization} value={p.organization.id_organization}>
                    {p.organization.name_org}
                  </option>
                ))}
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