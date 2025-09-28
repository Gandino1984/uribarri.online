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
import PublicationManagement from './components/Publicationmanagement.jsx';
import { Plus, X, FileText, Users } from 'lucide-react';
import styles from '../../../../public/css/InfoManagement.module.css';

const InfoManagement = () => {
  const { setShowTopBar } = useUI();
  const { currentUser } = useAuth();
  const { fetchUserOrganizations, userOrganizations, fetchAllOrganizations } = useOrganization();
  const { setFilterByOrganization } = usePublication();
  
  const [activeView, setActiveView] = useState('board'); // 'board', 'organizations', or 'publications'
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  //update: Add state for editing
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editingPublication, setEditingPublication] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrgForManagement, setSelectedOrgForManagement] = useState(null);
  
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
  
  // Check if user has is_manager permission from their user profile
  const isManager = currentUser?.is_manager === true || currentUser?.is_manager === 1;
  
  //update: Check if user belongs to any organization
  const belongsToOrganization = userOrganizations && userOrganizations.length > 0;
  
  //update: Check if user manages any organization
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
  
  //update: Handle successful organization update
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
  
  //update: Handle successful publication creation
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
  
  //update: Toggle publication form
  const togglePublicationForm = () => {
    setShowPublicationForm(prev => !prev);
    if (editingPublication) {
      setEditingPublication(null);
    }
  };
  
  //update: Handle edit organization
  const handleEditOrganization = (org) => {
    console.log('Edit organization:', org);
    setEditingOrganization(org);
    setIsEditMode(true);
    setShowCreationForm(true);
  };
  
  //update: Handle view organization publications
  const handleViewPublications = (org) => {
    console.log('View publications for organization:', org);
    // Set the filter to show only this organization's publications
    setFilterByOrganization(org.id_organization);
    setSelectedOrgForManagement(org);
    // Switch to the publications view
    setActiveView('publications');
  };
  
  //update: Handle cancel form
  const handleCancelForm = () => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
  };
  
  //update: Handle cancel publication form
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
            : 'Gestiona las publicaciones de tu organización'
          }
        </p>
      </div>
      
      {/* Tab navigation only for logged-in users */}
      {isLoggedIn && (
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
          {managesAnyOrganization && (
            <button
              className={`${styles.tabButton} ${activeView === 'publications' ? styles.activeTab : ''}`}
              onClick={() => setActiveView('publications')}
            >
              Gestionar Publicaciones
            </button>
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
                <span>Crear Organización</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* update: Show create publication button for users who belong to organizations */}
      {isLoggedIn && belongsToOrganization && activeView === 'board' && (
        <div className={styles.publicationActions}>
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
        </div>
      )}
      
      <div className={styles.content}>
        {activeView === 'board' ? (
          <>
            {/* update: Show publication creation form if toggled */}
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
        ) : activeView === 'publications' ? (
          // update: Show publication management for managers
          <>
            {managesAnyOrganization ? (
              <>
                <div className={styles.orgSelector}>
                  <label>Selecciona una organización para gestionar:</label>
                  <select 
                    value={selectedOrgForManagement?.id_organization || ''}
                    onChange={(e) => {
                      const orgId = parseInt(e.target.value);
                      const org = userOrganizations.find(p => p.organization?.id_organization === orgId)?.organization;
                      setSelectedOrgForManagement(org);
                    }}
                    className={styles.orgSelect}
                  >
                    <option value="">-- Selecciona una organización --</option>
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
                {selectedOrgForManagement && (
                  <PublicationManagement organizationId={selectedOrgForManagement.id_organization} />
                )}
              </>
            ) : (
              <div className={styles.noAccessMessage}>
                <Users size={48} />
                <p>No gestionas ninguna organización.</p>
                <p>Solo los gestores pueden aprobar publicaciones.</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default InfoManagement;