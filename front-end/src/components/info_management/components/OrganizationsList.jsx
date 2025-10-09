// src/components/info_management/components/organizations_list/OrganizationsList.jsx
import React, { useEffect, useState } from 'react';
import { useOrganization } from '../../../../src/app_context/OrganizationContext.jsx';
import { usePublication } from '../../../../src/app_context/PublicationContext.jsx';
import { useAuth } from '../../../../src/app_context/AuthContext.jsx';
import { useUI } from '../../../../src/app_context/UIContext.jsx';
import { useParticipant } from '../../../../src/app_context/ParticipantContext.jsx';
import ParticipantRequests from './ParticipantRequests.jsx';
//update: Import TransferOrganization component
import TransferOrganization from '../components/TransferOrganization.jsx';
//update: Import ArrowRightLeft icon for transfer button
import { Users, MapPin, User, AlertCircle, Shield, Clock, CheckCircle, XCircle, Edit, FileText, UserPlus, ArrowRightLeft } from 'lucide-react';
import axiosInstance from '../../../../src/utils/app/axiosConfig.js';
import styles from '../../../../../public/css/OrganizationsList.module.css';

const OrganizationsList = ({ onEditOrganization, onViewPublications }) => {
  const {
    organizations,
    userOrganizations,
    organizationsLoading,
    leaveOrganization,
    fetchUserOrganizations,
    fetchAllOrganizations
  } = useOrganization();
  
  const { setFilterByOrganization } = usePublication();
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  
  const { 
    createJoinRequest,
    fetchUserRequests,
    userRequests,
    fetchOrganizationRequests
  } = useParticipant();
  
  const [joinedOrgs, setJoinedOrgs] = useState(new Set());
  const [leavingOrg, setLeavingOrg] = useState(null);
  const [approvingOrg, setApprovingOrg] = useState(null);
  const [rejectingOrg, setRejectingOrg] = useState(null);
  const [requestingJoin, setRequestingJoin] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedOrgForRequests, setSelectedOrgForRequests] = useState(null);
  const [pendingRequestsCounts, setPendingRequestsCounts] = useState({});
  //update: Add state for transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrgForTransfer, setSelectedOrgForTransfer] = useState(null);

  const isAdmin = currentUser?.type_user === 'admin';

  // Load user's organizations on mount
  useEffect(() => {
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user).then(participations => {
        const joined = new Set(
          participations
            .filter(p => p.id_org)
            .map(p => p.id_org)
        );
        setJoinedOrgs(joined);
      });
      fetchUserRequests(currentUser.id_user);
    }
  }, [currentUser, fetchUserOrganizations, fetchUserRequests]);

  useEffect(() => {
    const fetchPendingCounts = async () => {
      const counts = {};
      for (const participation of userOrganizations) {
        if (participation.org_managed && participation.organization) {
          const requests = await fetchOrganizationRequests(participation.organization.id_organization, 'pending');
          const pendingCount = requests.filter(r => r.request_status === 'pending').length;
          counts[participation.organization.id_organization] = pendingCount;
        }
      }
      setPendingRequestsCounts(counts);
    };
    
    if (userOrganizations && userOrganizations.length > 0) {
      fetchPendingCounts();
    }
  }, [userOrganizations, fetchOrganizationRequests]);

  const hasJoined = (orgId) => {
    return joinedOrgs.has(orgId);
  };

  const isManager = (orgId) => {
    const participation = userOrganizations.find(p => p.id_org === orgId);
    return participation?.org_managed || false;
  };

  const isCreator = (org) => {
    return org.id_user === currentUser?.id_user;
  };

  const hasPendingRequest = (orgId) => {
    return userRequests.some(req => 
      req.id_org === orgId && req.request_status === 'pending'
    );
  };

  const handleEditOrganization = (org) => {
    if (onEditOrganization) {
      onEditOrganization(org);
    }
  };

  const handleViewPublications = (org) => {
    setFilterByOrganization(org.id_organization);
    if (onViewPublications) {
      onViewPublications(org);
    }
  };

  const handleViewRequests = (org) => {
    setSelectedOrgForRequests(org);
    setShowRequestsModal(true);
  };

  //update: Handle opening transfer modal
  const handleOpenTransferModal = (org) => {
    console.log('Opening transfer modal for organization:', org);
    setSelectedOrgForTransfer(org);
    setShowTransferModal(true);
  };

  //update: Handle successful transfer request creation
  const handleTransferSuccess = () => {
    console.log('Transfer request created successfully');
    setShowTransferModal(false);
    setSelectedOrgForTransfer(null);
    // Refresh organizations to update UI
    fetchAllOrganizations();
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user);
    }
  };

  const handleJoinOrganization = async (orgId) => {
    if (!currentUser) {
      setError(prev => ({ 
        ...prev, 
        authError: 'Debes iniciar sesión para solicitar unirte a una organización' 
      }));
      return;
    }

    setRequestingJoin(orgId);
    
    try {
      const request = await createJoinRequest(orgId);
      if (request) {
        await fetchUserRequests(currentUser.id_user);
        setSuccess(prev => ({ 
          ...prev, 
          requestSuccess: '¡Solicitud enviada! El gestor de la organización revisará tu solicitud.' 
        }));
      }
    } catch (error) {
      console.error('Error creating join request:', error);
    } finally {
      setRequestingJoin(null);
    }
  };

  const handleLeaveOrganization = async (orgId) => {
    setLeavingOrg(orgId);
    
    try {
      const success = await leaveOrganization(orgId);
      if (success) {
        setJoinedOrgs(prev => {
          const newSet = new Set(prev);
          newSet.delete(orgId);
          return newSet;
        });
        setSuccess(prev => ({ 
          ...prev, 
          leaveSuccess: 'Has salido de la organización' 
        }));
        if (currentUser?.id_user) {
          await fetchUserOrganizations(currentUser.id_user);
        }
      }
    } catch (error) {
      console.error('Error leaving organization:', error);
    } finally {
      setLeavingOrg(null);
    }
  };

  const handleApproveOrganization = async (orgId) => {
    setApprovingOrg(orgId);
    
    try {
      const response = await axiosInstance.patch('/organization/approve', {
        id_organization: orgId,
        approved: true,
        admin_user_id: currentUser.id_user
      });
      
      if (!response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          approveSuccess: 'Organización aprobada exitosamente' 
        }));
        await fetchAllOrganizations();
      } else {
        setError(prev => ({ 
          ...prev, 
          approveError: response.data.error 
        }));
      }
    } catch (error) {
      console.error('Error approving organization:', error);
      setError(prev => ({ 
        ...prev, 
        approveError: 'Error al aprobar la organización' 
      }));
    } finally {
      setApprovingOrg(null);
    }
  };

  const handleRejectOrganization = async (orgId) => {
    setRejectingOrg(orgId);
    
    try {
      const response = await axiosInstance.patch('/organization/approve', {
        id_organization: orgId,
        approved: false,
        admin_user_id: currentUser.id_user
      });
      
      if (!response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          rejectSuccess: 'Organización rechazada' 
        }));
        await fetchAllOrganizations();
      } else {
        setError(prev => ({ 
          ...prev, 
          rejectError: response.data.error 
        }));
      }
    } catch (error) {
      console.error('Error rejecting organization:', error);
      setError(prev => ({ 
        ...prev, 
        rejectError: 'Error al rechazar la organización' 
      }));
    } finally {
      setRejectingOrg(null);
    }
  };

  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = `${import.meta.env.VITE_API_URL}/${imagePath}`;
      openImageModal(fullImagePath);
    }
  };

  const getFilteredOrganizations = () => {
    if (!organizations) return [];
    
    return organizations.filter(org => {
      if (isAdmin) return true;
      if (org.org_approved) return true;
      if (!org.org_approved && isCreator(org)) return true;
      return false;
    });
  };

  const filteredOrganizations = getFilteredOrganizations();

  if (organizationsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando organizaciones...</p>
      </div>
    );
  }

  if (!filteredOrganizations || filteredOrganizations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <AlertCircle size={48} className={styles.emptyIcon} />
        <p className={styles.emptyText}>
          No se encontraron organizaciones
        </p>
        <p className={styles.emptySubtext}>
          Intenta buscar con otros términos o revisa más tarde
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.organizationsGrid}>
        {filteredOrganizations.map(org => {
          const joined = hasJoined(org.id_organization);
          const manager = isManager(org.id_organization);
          const creator = isCreator(org);
          const isRequesting = requestingJoin === org.id_organization;
          const isLeaving = leavingOrg === org.id_organization;
          const isApproving = approvingOrg === org.id_organization;
          const isRejecting = rejectingOrg === org.id_organization;
          const pendingRequest = hasPendingRequest(org.id_organization);
          const pendingCount = pendingRequestsCounts[org.id_organization] || 0;
          
          return (
            <div key={org.id_organization} className={`${styles.organizationCard} ${!org.org_approved ? styles.pendingCard : ''}`}>
              {!org.org_approved && (
                <div className={styles.approvalBadge}>
                  <Clock size={16} />
                  <span>Pendiente de aprobación</span>
                </div>
              )}
              
              {isAdmin && (
                <div className={styles.adminBadge}>
                  <Shield size={14} />
                  <span>Vista de administrador</span>
                </div>
              )}
              
              <div className={styles.cardHeader}>
                {org.image_org ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${org.image_org}`}
                    alt={org.name_org}
                    className={styles.orgImage}
                    onClick={() => handleImageClick(org.image_org)}
                  />
                ) : (
                  <div className={styles.orgImagePlaceholder}>
                    <Users size={32} />
                  </div>
                )}
                
                <div className={styles.orgInfo}>
                  <h3 className={styles.orgName}>{org.name_org}</h3>
                  
                  {org.scope_org && (
                    <p className={styles.orgScope}>
                      <MapPin size={14} />
                      <span>{org.scope_org}</span>
                    </p>
                  )}
                  
                  {org.manager && (
                    <p className={styles.orgManager}>
                      <User size={14} />
                      <span>Gestiona: {org.manager.name_user}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                {manager && org.org_approved && (
                  <div className={styles.managerActions}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => handleEditOrganization(org)}
                      title="Editar organización"
                    >
                      <Edit size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.requestsButton}`}
                      onClick={() => handleViewRequests(org)}
                      title="Ver solicitudes"
                    >
                      <UserPlus size={16} />
                      <span>Solicitudes</span>
                      {pendingCount > 0 && (
                        <span className={styles.requestsBadge}>{pendingCount}</span>
                      )}
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.publicationsButton}`}
                      onClick={() => handleViewPublications(org)}
                      title="Ver publicaciones"
                    >
                      <FileText size={16} />
                      <span>Publicaciones</span>
                    </button>
                    {/*update: Add transfer button for managers */}
                    <button
                      className={`${styles.actionButton} ${styles.transferButton}`}
                      onClick={() => handleOpenTransferModal(org)}
                      title="Traspasar asociación"
                    >
                      <ArrowRightLeft size={16} />
                      <span>Traspasar</span>
                    </button>
                  </div>
                )}
                
                {isAdmin && !org.org_approved ? (
                  <div className={styles.adminActions}>
                    <button
                      className={`${styles.actionButton} ${styles.approveButton}`}
                      onClick={() => handleApproveOrganization(org.id_organization)}
                      disabled={isApproving || isRejecting}
                      title="Aprobar organización"
                    >
                      {isApproving ? (
                        <>
                          <span className={styles.buttonLoader}></span>
                          <span>Aprobando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>Aprobar</span>
                        </>
                      )}
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.rejectButton}`}
                      onClick={() => handleRejectOrganization(org.id_organization)}
                      disabled={isApproving || isRejecting}
                      title="Rechazar organización"
                    >
                      {isRejecting ? (
                        <>
                          <span className={styles.buttonLoader}></span>
                          <span>Rechazando...</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Rechazar</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : !org.org_approved && creator ? (
                  <div className={styles.pendingMessage}>
                    <Clock size={14} />
                    <span>Esperando aprobación del administrador</span>
                  </div>
                ) : manager && !org.org_approved ? (
                  <div className={styles.managerBadge}>
                    <span>Eres gestor/a (pendiente aprobación)</span>
                  </div>
                ) : joined && !manager ? (
                  <button
                    className={`${styles.actionButton} ${styles.leaveButton}`}
                    onClick={() => handleLeaveOrganization(org.id_organization)}
                    disabled={isLeaving}
                  >
                    {isLeaving ? (
                      <>
                        <span className={styles.buttonLoader}></span>
                        <span>Saliendo...</span>
                      </>
                    ) : (
                      <span>Salir</span>
                    )}
                  </button>
                ) : org.org_approved && !joined && !pendingRequest ? (
                  <button
                    className={`${styles.actionButton} ${styles.joinButton}`}
                    onClick={() => handleJoinOrganization(org.id_organization)}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <>
                        <span className={styles.buttonLoader}></span>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Solicitar Unirme</span>
                    )}
                  </button>
                ) : pendingRequest ? (
                  <div className={styles.pendingRequestBadge}>
                    <Clock size={14} />
                    <span>Solicitud pendiente</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.resultsCount}>
        <p>
          Mostrando {filteredOrganizations.length} {filteredOrganizations.length === 1 ? 'organización' : 'organizaciones'}
          {isAdmin && organizations.some(org => !org.org_approved) && (
            <span className={styles.pendingCount}>
              {' '}({organizations.filter(org => !org.org_approved).length} pendientes de aprobación)
            </span>
          )}
        </p>
      </div>
      
      {showRequestsModal && selectedOrgForRequests && (
        <ParticipantRequests
          organizationId={selectedOrgForRequests.id_organization}
          organizationName={selectedOrgForRequests.name_org}
          onClose={() => {
            setShowRequestsModal(false);
            setSelectedOrgForRequests(null);
            fetchUserOrganizations(currentUser.id_user);
          }}
        />
      )}
      
      {/*update: Add TransferOrganization modal */}
      {showTransferModal && selectedOrgForTransfer && (
        <TransferOrganization
          organization={selectedOrgForTransfer}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedOrgForTransfer(null);
          }}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
};

export default OrganizationsList;