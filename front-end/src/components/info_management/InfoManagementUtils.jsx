// src/components/info_management/InfoManagementUtils.jsx
//update: Refactored as custom hook following TopBarUtils pattern

import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import { usePublication } from '../../app_context/PublicationContext.jsx';

export const InfoManagementUtils = () => {
  const { 
    setShowInfoManagement,
    setShowShopWindow,
    setNavigationIntent,
    setShowLandingPage
  } = useUI();
  
  const { setIsLoggingIn } = useAuth();
  const { fetchUserOrganizations, fetchAllOrganizations } = useOrganization();
  const { resetFilters } = usePublication();

  /**
   * Handler for navigating back to ShopWindow
   */
  const handleBackToShopWindow = () => {
    console.log('Navigating from InfoManagement back to ShopWindow');
    setShowInfoManagement(false);
    setShowShopWindow(true);
  };

  /**
   * Handler for redirecting to login with navigation intent
   */
  const handleLoginRedirect = (intent) => {
    console.log('Redirecting to login with intent:', intent);
    setNavigationIntent(intent);
    setShowInfoManagement(false);
    setShowLandingPage(false);
    setIsLoggingIn(true);
  };

  /**
   * Handler for when a transfer is processed
   */
  const handleTransferProcessed = (currentUser) => {
    console.log('Transfer processed, refreshing organizations');
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
      fetchAllOrganizations();
    }
  };

  /**
   * Handler for when an organization is created
   */
  const handleOrganizationCreated = (
    newOrg,
    setShowCreationForm,
    setIsEditMode,
    setEditingOrganization,
    currentUser,
    setActiveView
  ) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    fetchAllOrganizations();
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
    setActiveView('organizations');
  };

  /**
   * Handler for when an organization is updated
   */
  const handleOrganizationUpdated = (
    updatedOrg,
    setShowCreationForm,
    setIsEditMode,
    setEditingOrganization,
    currentUser
  ) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
    fetchAllOrganizations();
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  };

  /**
   * Handler for when a publication is created
   */
  const handlePublicationCreated = (
    newPub,
    setShowPublicationForm,
    setEditingPublication,
    setActiveView
  ) => {
    setShowPublicationForm(false);
    setEditingPublication(null);
    setActiveView('board');
  };

  /**
   * Toggle creation form visibility
   */
  const toggleCreationForm = (
    isLoggedIn,
    showCreationForm,
    isEditMode,
    setIsEditMode,
    setEditingOrganization,
    setShowCreationForm
  ) => {
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

  /**
   * Toggle publication form visibility
   */
  const togglePublicationForm = (
    isLoggedIn,
    setShowPublicationForm,
    editingPublication,
    setEditingPublication
  ) => {
    if (!isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    
    setShowPublicationForm(prev => !prev);
    if (editingPublication) {
      setEditingPublication(null);
    }
  };

  /**
   * Handler for editing an organization
   */
  const handleEditOrganization = (
    org,
    isLoggedIn,
    setEditingOrganization,
    setIsEditMode,
    setShowCreationForm
  ) => {
    if (!isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    
    console.log('Edit organization:', org);
    setEditingOrganization(org);
    setIsEditMode(true);
    setShowCreationForm(true);
  };

  /**
   * Handler for viewing publications of an organization
   */
  const handleViewPublications = (
    org,
    setSelectedOrgForManagement,
    setActiveView
  ) => {
    console.log('View publications for organization:', org);
    setSelectedOrgForManagement(org);
    setActiveView('management');
  };

  /**
   * Handler for opening management view
   */
  const handleOpenManagement = (setActiveView) => {
    setActiveView('management');
  };

  /**
   * Handler for canceling organization form
   */
  const handleCancelForm = (
    setShowCreationForm,
    setIsEditMode,
    setEditingOrganization
  ) => {
    setShowCreationForm(false);
    setIsEditMode(false);
    setEditingOrganization(null);
  };

  /**
   * Handler for canceling publication form
   */
  const handleCancelPublicationForm = (
    setShowPublicationForm,
    setEditingPublication
  ) => {
    setShowPublicationForm(false);
    setEditingPublication(null);
  };

  /**
   * Get header title based on active view
   */
  const getHeaderTitle = (activeView, selectedOrgForManagement) => {
    if (activeView === 'board') return 'Tablón Informativo de Uribarri';
    if (activeView === 'organizations') return 'Asociaciones de Uribarri';
    return 'Gestión de Publicaciones';
  };

  /**
   * Get header subtitle based on active view
   */
  const getHeaderSubtitle = (activeView, selectedOrgForManagement) => {
    if (activeView === 'board') {
      return 'Mantente al día con las últimas novedades de tu barrio';
    }
    if (activeView === 'organizations') {
      return 'Busca y únete a las asociaciones de tu comunidad';
    }
    return selectedOrgForManagement 
      ? `Gestionando: ${selectedOrgForManagement.name_org}`
      : 'Gestiona las publicaciones de tu organización';
  };

  /**
   * Check if user has management permissions
   */
  const checkManagementPermissions = (userOrganizations) => {
    return userOrganizations?.some(participation => participation.org_managed) || false;
  };

  /**
   * Get managed organizations list
   */
  const getManagedOrganizations = (userOrganizations) => {
    if (!userOrganizations) return [];
    return userOrganizations.filter(p => p.org_managed && p.organization);
  };

  /**
   * Handler for view change with filter reset
   */
  const handleViewChange = (view, isLoggedIn, setActiveView, setSelectedOrgForManagement) => {
    if (view === 'organizations' && !isLoggedIn) {
      handleLoginRedirect('info');
      return;
    }
    setActiveView(view);
    resetFilters();
    setSelectedOrgForManagement(null);
  };

  /**
   * Handler for back to board with filter reset
   */
  const handleBackToBoard = (setActiveView, setSelectedOrgForManagement) => {
    setActiveView('board');
    setSelectedOrgForManagement(null);
    resetFilters();
  };

  return {
    handleBackToShopWindow,
    handleLoginRedirect,
    handleTransferProcessed,
    handleOrganizationCreated,
    handleOrganizationUpdated,
    handlePublicationCreated,
    toggleCreationForm,
    togglePublicationForm,
    handleEditOrganization,
    handleViewPublications,
    handleOpenManagement,
    handleCancelForm,
    handleCancelPublicationForm,
    getHeaderTitle,
    getHeaderSubtitle,
    checkManagementPermissions,
    getManagedOrganizations,
    handleViewChange,
    handleBackToBoard
  };
};