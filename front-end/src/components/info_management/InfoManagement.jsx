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
import { Plus, X, FileText, Users, Settings, ArrowLeft } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  //update: Add navigation functions
  const { 
    setShowTopBar,
    setShowInfoManagement,
    setShowShopWindow
  } = useUI();
  const { currentUser } = useAuth();
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
  
  //update: Handle back to shop window
  const handleBackToShopWindow = () => {
    console.log('Navigating from InfoManagement back to ShopWindow');
    setShowInfoManagement(false);
    setShowShopWindow(true);
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
    if (showCreationForm && isEditMode) {
      setIsEditMode(false);
      setEditingOrganization(null);
    }
    setShowCreationForm(prev => !prev);
  };
  
  const togglePublicationForm = () => {
    setShowPublicationForm(prev => !prev);
    if (editingPublication) {
      setEditingPublication(null);
    }
  };
  
  const handleEditOrganization = (org) => {
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
      {/*update: Add back button at the top of the container */}
      <div className={styles.backButtonContainer}>
        <button 
          onClick={handleBackToShopWindow}
          className={styles.backButton}
          title="Volver al escaparate"
        >
          <ArrowLeft size={20} />
          <span>Al escaparate</span>
        </button>
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
      </div>
      
      {isLoggedIn && activeView !== 'management' && (
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
              setActiveView('organizations');
              setSelectedOrgForManagement(null);
            }}
          >
            Asociaciones
          </button>
        </div>
      )}
      
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
              <p>Debes iniciar sesión para ver y unirte a las asociaciones.</p>
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