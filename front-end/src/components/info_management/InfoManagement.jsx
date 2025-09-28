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
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  const { fetchUserOrganizations, userOrganizations, fetchAllOrganizations } = useOrganization();
  const { setFilterByOrganization } = usePublication();
  
  const [activeView, setActiveView] = useState('board'); // 'board', 'organizations', or 'management'
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editingPublication, setEditingPublication] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrgForManagement, setSelectedOrgForManagement] = useState(null);
  const [showManagementButton, setShowManagementButton] = useState(false);
  
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
  
  //update: Check if user manages any organization to show management button
  useEffect(() => {
    if (userOrganizations && userOrganizations.length > 0) {
      const hasManagement = userOrganizations.some(p => p.org_managed);
      setShowManagementButton(hasManagement);
      
      // If user manages only one org, auto-select it
      const managedOrgs = userOrganizations.filter(p => p.org_managed);
      if (managedOrgs.length === 1 && managedOrgs[0].organization) {
        setSelectedOrgForManagement(managedOrgs[0].organization);
      }
    }
  }, [userOrganizations]);
  
  // Check if user is logged in
  const isLoggedIn = !!currentUser;
  
  // Check if user has is_manager permission from their user profile
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  
  // Check if user belongs to any organization
  const belongsToOrganization = userOrganizations && userOrganizations.length > 0;
  
  // Check if user manages any organization
  const managesAnyOrganization = userOrganizations?.some(participation => participation.org_managed);
  
  // Handle successful organization creation
  const handleOrganizationCreated = (newOrg) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    // Refresh organizations list
    fetchAllOrganizations();
    // Refresh user's organizations
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
    // Optionally switch to organizations view
    setActiveView('organizations');
  };
  
  // Handle successful organization update
  const handleOrganizationUpdated = (updatedOrg) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    // Refresh organizations list
    fetchAllOrganizations();
    // Refresh user's organizations
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  };
  
  // Handle successful publication creation
  const handlePublicationCreated = (newPub) => {
    setShowPublicationForm(false);
    setEditingPublication(null);
    // Optionally refresh publications
    setActiveView('board');
  };
  
  // Toggle creation form
  const toggleCreationForm = () => {
    if (showCreationForm && isEditMode) {
      // If closing edit mode, reset everything
      setIsEditMode(false);
      setEditingOrganization(null);
    }
    setShowCreationForm(prev => !prev);
  };
  
  // Toggle publication form
  const togglePublicationForm = () => {
    setShowPublicationForm(prev => !prev);
    if (editingPublication) {
      setEditingPublication(null);
    }
  };
  
  // Handle edit organization
  const handleEditOrganization = (org) => {
    console.log('Edit organization:', org);
    setEditingOrganization(org);
    setIsEditMode(true);
    setShowCreationForm(true);
  };
  
  // Handle view organization publications
  const handleViewPublications = (org) => {
    console.log('View publications for organization:', org);
    // Set the filter to show only this organization's publications
    setFilterByOrganization(org.id_organization);
    setSelectedOrgForManagement(org);
    // Switch to the management view
    setActiveView('management');
  };
  
  //update: Handle open management view
  const handleOpenManagement = () => {
    setActiveView('management');
  };
  
  // Handle cancel form
  const handleCancelForm = () => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
  };
  
  // Handle cancel publication form
  const handleCancelPublicationForm = () => {
    setShowPublicationForm(false);
    setEditingPublication(null);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {activeView === 'board' ? 'Tablón Informativo' : 
           activeView === 'organizations' ? 'Asociaciones de la Comunidad' :
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
      
      {/* Tab navigation only for logged-in users */}
      {isLoggedIn && activeView !== 'management' && (
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeView === 'board' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveView('board');
              // Clear organization filter when switching to board
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
      
      {/* Back button for management view */}
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
      
      {/* Show creation button for organizations view */}
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
      
      {/* Show create publication button and management access for board view */}
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
          
          {/* Show management button for managers */}
          {showManagementButton && (
            <button
              className={styles.managementButton}
              onClick={handleOpenManagement}
              title="Gestionar publicaciones de tu organización"
            >
              <Settings size={18} />
              <span>Gestionar mis publicaciones</span>
            </button>
          )}
        </div>
      )}
      
      <div className={styles.content}>
        {activeView === 'board' ? (
          <>
            {/* Show publication creation form if toggled */}
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
          // Show organizations view with conditional creation form
          isLoggedIn ? (
            <>
              {/* Show creation/edit form if toggled */}
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
          // Show publication management
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