// src/components/info_management/InfoManagementUtils.jsx

/**
 * Handler for navigating back to ShopWindow
 * @param {Function} setShowInfoManagement - Context function to hide InfoManagement
 * @param {Function} setShowShopWindow - Context function to show ShopWindow
 */
export const handleBackToShopWindow = (setShowInfoManagement, setShowShopWindow) => {
  console.log('Navigating from InfoManagement back to ShopWindow');
  setShowInfoManagement(false);
  setShowShopWindow(true);
};

/**
 * Handler for redirecting to login with navigation intent
 * @param {string} intent - Navigation intent ('info')
 * @param {Function} setNavigationIntent - Context function to set navigation intent
 * @param {Function} setShowInfoManagement - Context function to hide InfoManagement
 * @param {Function} setShowLandingPage - Context function to hide LandingPage
 * @param {Function} setIsLoggingIn - Context function to show login form
 */
export const handleLoginRedirect = (
  intent,
  setNavigationIntent,
  setShowInfoManagement,
  setShowLandingPage,
  setIsLoggingIn
) => {
  console.log('Redirecting to login with intent:', intent);
  setNavigationIntent(intent);
  setShowInfoManagement(false);
  setShowLandingPage(false);
  setIsLoggingIn(true);
};

/**
 * Handler for when a transfer is processed
 * @param {Object} currentUser - Current logged in user
 * @param {Function} fetchUserOrganizations - Function to fetch user organizations
 * @param {Function} fetchAllOrganizations - Function to fetch all organizations
 */
export const handleTransferProcessed = (
  currentUser,
  fetchUserOrganizations,
  fetchAllOrganizations
) => {
  console.log('Transfer processed, refreshing organizations');
  if (currentUser?.id_user) {
    fetchUserOrganizations(currentUser.id_user);
    fetchAllOrganizations();
  }
};

/**
 * Handler for when an organization is created
 * @param {Object} newOrg - Newly created organization
 * @param {Function} setShowCreationForm - State setter for creation form visibility
 * @param {Function} setIsEditMode - State setter for edit mode
 * @param {Function} setEditingOrganization - State setter for editing organization
 * @param {Function} fetchAllOrganizations - Function to fetch all organizations
 * @param {Function} fetchUserOrganizations - Function to fetch user organizations
 * @param {Object} currentUser - Current logged in user
 * @param {Function} setActiveView - State setter for active view
 */
export const handleOrganizationCreated = (
  newOrg,
  setShowCreationForm,
  setIsEditMode,
  setEditingOrganization,
  fetchAllOrganizations,
  fetchUserOrganizations,
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
 * @param {Object} updatedOrg - Updated organization
 * @param {Function} setShowCreationForm - State setter for creation form visibility
 * @param {Function} setIsEditMode - State setter for edit mode
 * @param {Function} setEditingOrganization - State setter for editing organization
 * @param {Function} fetchAllOrganizations - Function to fetch all organizations
 * @param {Function} fetchUserOrganizations - Function to fetch user organizations
 * @param {Object} currentUser - Current logged in user
 */
export const handleOrganizationUpdated = (
  updatedOrg,
  setShowCreationForm,
  setIsEditMode,
  setEditingOrganization,
  fetchAllOrganizations,
  fetchUserOrganizations,
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
 * @param {Object} newPub - Newly created publication
 * @param {Function} setShowPublicationForm - State setter for publication form visibility
 * @param {Function} setEditingPublication - State setter for editing publication
 * @param {Function} setActiveView - State setter for active view
 */
export const handlePublicationCreated = (
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
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {boolean} showCreationForm - Current creation form visibility
 * @param {boolean} isEditMode - Current edit mode status
 * @param {Function} setIsEditMode - State setter for edit mode
 * @param {Function} setEditingOrganization - State setter for editing organization
 * @param {Function} setShowCreationForm - State setter for creation form visibility
 * @param {Function} handleLoginRedirect - Function to handle login redirect
 */
export const toggleCreationForm = (
  isLoggedIn,
  showCreationForm,
  isEditMode,
  setIsEditMode,
  setEditingOrganization,
  setShowCreationForm,
  handleLoginRedirect
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
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {Function} setShowPublicationForm - State setter for publication form visibility
 * @param {Object} editingPublication - Current editing publication
 * @param {Function} setEditingPublication - State setter for editing publication
 * @param {Function} handleLoginRedirect - Function to handle login redirect
 */
export const togglePublicationForm = (
  isLoggedIn,
  setShowPublicationForm,
  editingPublication,
  setEditingPublication,
  handleLoginRedirect
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
 * @param {Object} org - Organization to edit
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {Function} setEditingOrganization - State setter for editing organization
 * @param {Function} setIsEditMode - State setter for edit mode
 * @param {Function} setShowCreationForm - State setter for creation form visibility
 * @param {Function} handleLoginRedirect - Function to handle login redirect
 */
export const handleEditOrganization = (
  org,
  isLoggedIn,
  setEditingOrganization,
  setIsEditMode,
  setShowCreationForm,
  handleLoginRedirect
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
 * @param {Object} org - Organization to view publications for
 * @param {Function} setFilterByOrganization - Function to set organization filter
 * @param {Function} setSelectedOrgForManagement - State setter for selected organization
 * @param {Function} setActiveView - State setter for active view
 */
export const handleViewPublications = (
  org,
  setFilterByOrganization,
  setSelectedOrgForManagement,
  setActiveView
) => {
  console.log('View publications for organization:', org);
  setFilterByOrganization(org.id_organization);
  setSelectedOrgForManagement(org);
  setActiveView('management');
};

/**
 * Handler for opening management view
 * @param {Function} setActiveView - State setter for active view
 */
export const handleOpenManagement = (setActiveView) => {
  setActiveView('management');
};

/**
 * Handler for canceling organization form
 * @param {Function} setShowCreationForm - State setter for creation form visibility
 * @param {Function} setIsEditMode - State setter for edit mode
 * @param {Function} setEditingOrganization - State setter for editing organization
 */
export const handleCancelForm = (
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
 * @param {Function} setShowPublicationForm - State setter for publication form visibility
 * @param {Function} setEditingPublication - State setter for editing publication
 */
export const handleCancelPublicationForm = (
  setShowPublicationForm,
  setEditingPublication
) => {
  setShowPublicationForm(false);
  setEditingPublication(null);
};

/**
 * Get header title based on active view
 * @param {string} activeView - Current active view
 * @param {Object} selectedOrgForManagement - Selected organization for management
 * @returns {string} Header title
 */
export const getHeaderTitle = (activeView, selectedOrgForManagement) => {
  if (activeView === 'board') return 'Tablón Informativo de Uribarri';
  if (activeView === 'organizations') return 'Asociaciones de Uribarri';
  return 'Gestión de Publicaciones';
};

/**
 * Get header subtitle based on active view
 * @param {string} activeView - Current active view
 * @param {Object} selectedOrgForManagement - Selected organization for management
 * @returns {string} Header subtitle
 */
export const getHeaderSubtitle = (activeView, selectedOrgForManagement) => {
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
 * @param {Array} userOrganizations - User's organizations
 * @returns {boolean} Whether user manages any organization
 */
export const checkManagementPermissions = (userOrganizations) => {
  return userOrganizations?.some(participation => participation.org_managed) || false;
};

/**
 * Get managed organizations list
 * @param {Array} userOrganizations - User's organizations
 * @returns {Array} List of managed organizations
 */
export const getManagedOrganizations = (userOrganizations) => {
  if (!userOrganizations) return [];
  return userOrganizations.filter(p => p.org_managed && p.organization);
};