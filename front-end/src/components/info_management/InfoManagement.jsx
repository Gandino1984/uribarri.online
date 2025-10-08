// src/components/info_management/InfoManagement.jsx
//update: Refactored to use InfoManagementUtils hook pattern (like TopBar)

import React, { useState, useEffect } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import InfoBoard from './components/info_board/InfoBoard.jsx';
import FiltersForOrganizations from './components/FiltersForOrganizations.jsx';
import OrganizationsList from './components/OrganizationsList.jsx';
import OrganizationCreationForm from './components/OrganizationCreationForm.jsx';
import PublicationCreationForm from './components/PublicationCreationForm.jsx';
import PublicationManagement from './components/PublicationManagement.jsx';
import PendingTransfersBadge from './components/PendingTransfersBadge.jsx';
import { InfoManagementUtils } from './InfoManagementUtils.jsx';
import { Plus, X, FileText, Users, ArrowLeft, LogIn } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  const { fetchUserOrganizations, userOrganizations } = useOrganization();
  
  //update: Use InfoManagementUtils hook (following TopBar pattern)
  const {
    handleLoginRedirect,
    handleTransferProcessed,
    handleOrganizationCreated,
    handleOrganizationUpdated,
    handlePublicationCreated,
    toggleCreationForm,
    togglePublicationForm,
    handleEditOrganization,
    handleViewPublications,
    handleCancelForm,
    handleCancelPublicationForm,
    getHeaderTitle,
    getHeaderSubtitle,
    checkManagementPermissions,
    getManagedOrganizations,
    handleViewChange,
    handleBackToBoard
  } = InfoManagementUtils();
  
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
  
  const isLoggedIn = !!currentUser;
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  const belongsToOrganization = userOrganizations && userOrganizations.length > 0;
  const managesAnyOrganization = checkManagementPermissions(userOrganizations);
  const managedOrganizations = getManagedOrganizations(userOrganizations);
  
  //update: Local handlers that use state setters
  const onViewChange = (view) => {
    handleViewChange(view, isLoggedIn, setActiveView, setSelectedOrgForManagement);
  };

  const onBackToBoard = () => {
    handleBackToBoard(setActiveView, setSelectedOrgForManagement);
  };

  const onToggleCreationForm = () => {
    toggleCreationForm(
      isLoggedIn,
      showCreationForm,
      isEditMode,
      setIsEditMode,
      setEditingOrganization,
      setShowCreationForm
    );
  };

  const onTogglePublicationForm = () => {
    togglePublicationForm(
      isLoggedIn,
      setShowPublicationForm,
      editingPublication,
      setEditingPublication
    );
  };

  const onOrganizationCreated = (org) => {
    handleOrganizationCreated(
      org,
      setShowCreationForm,
      setIsEditMode,
      setEditingOrganization,
      currentUser,
      setActiveView
    );
  };

  const onOrganizationUpdated = (org) => {
    handleOrganizationUpdated(
      org,
      setShowCreationForm,
      setIsEditMode,
      setEditingOrganization,
      currentUser
    );
  };

  const onPublicationCreated = (newPub) => {
    handlePublicationCreated(
      newPub,
      setShowPublicationForm,
      setEditingPublication,
      setActiveView
    );
  };

  const onEditOrganization = (org) => {
    handleEditOrganization(
      org,
      isLoggedIn,
      setEditingOrganization,
      setIsEditMode,
      setShowCreationForm
    );
  };

  const onViewPublications = (org) => {
    handleViewPublications(
      org,
      setSelectedOrgForManagement,
      setActiveView
    );
  };

  const onCancelForm = () => {
    handleCancelForm(setShowCreationForm, setIsEditMode, setEditingOrganization);
  };

  const onCancelPublicationForm = () => {
    handleCancelPublicationForm(setShowPublicationForm, setEditingPublication);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <div className={styles.radioToggleContainer}>
          <div className={styles.radioToggle}>
            <input
              type="radio"
              id="viewBoard"
              name="viewToggle"
              value="board"
              checked={activeView === 'board'}
              onChange={() => onViewChange('board')}
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
              onChange={() => onViewChange('organizations')}
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
            <PendingTransfersBadge onTransferProcessed={() => handleTransferProcessed(currentUser)} />
          )}
        </div>
      </div>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {getHeaderTitle(activeView, selectedOrgForManagement)}
          </h1>
          <p className={styles.subtitle}>
            {getHeaderSubtitle(activeView, selectedOrgForManagement)}
          </p>
          {isLoggedIn && isManager && activeView === 'organizations' && !isEditMode && (
            <div className={styles.managerActions}>
              <button
                className={`${styles.createButton} ${showCreationForm ? styles.createButtonActive : ''}`}
                onClick={onToggleCreationForm}
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
        </div>
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
            onClick={onBackToBoard}
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
      
      {isLoggedIn && activeView === 'board' && (
        <div className={styles.boardActions}>
          {belongsToOrganization && (
            <button
              className={`${styles.createButton} ${showPublicationForm ? styles.createButtonActive : ''}`}
              onClick={onTogglePublicationForm}
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
                onSuccess={onPublicationCreated}
                onCancel={onCancelPublicationForm}
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
                  onSuccess={isEditMode ? onOrganizationUpdated : onOrganizationCreated}
                  onCancel={onCancelForm}
                  editMode={isEditMode}
                  organizationData={editingOrganization}
                />
              )}
              <FiltersForOrganizations />
              <OrganizationsList 
                onEditOrganization={onEditOrganization}
                onViewPublications={onViewPublications}
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