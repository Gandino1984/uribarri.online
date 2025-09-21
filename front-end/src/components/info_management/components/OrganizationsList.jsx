// src/components/info_management/components/organizations_list/OrganizationsList.jsx
import React, { useEffect, useState } from 'react';
import { useOrganization } from '../../../../src/app_context/OrganizationContext.jsx';
import { useAuth } from '../../../../src/app_context/AuthContext.jsx';
import { useUI } from '../../../../src/app_context/UIContext.jsx';
import { Users, MapPin, User, AlertCircle } from 'lucide-react';
import styles from '../../../../../public/css/OrganizationsList.module.css';

const OrganizationsList = () => {
  const {
    organizations,
    userOrganizations,
    organizationsLoading,
    joinOrganization,
    leaveOrganization,
    fetchUserOrganizations
  } = useOrganization();
  
  const { currentUser } = useAuth();
  const { setError, setSuccess, openImageModal } = useUI();
  
  const [joinedOrgs, setJoinedOrgs] = useState(new Set());
  const [joiningOrg, setJoiningOrg] = useState(null);
  const [leavingOrg, setLeavingOrg] = useState(null);

  // Load user's organizations on mount
  useEffect(() => {
    if (currentUser?.id_user) {
      fetchUserOrganizations(currentUser.id_user).then(participations => {
        // Create a set of organization IDs the user has joined
        const joined = new Set(
          participations
            .filter(p => p.id_org)
            .map(p => p.id_org)
        );
        setJoinedOrgs(joined);
      });
    }
  }, [currentUser, fetchUserOrganizations]);

  // Check if user has already joined an organization
  const hasJoined = (orgId) => {
    return joinedOrgs.has(orgId);
  };

  // Check if user is manager of an organization
  const isManager = (orgId) => {
    const participation = userOrganizations.find(p => p.id_org === orgId);
    return participation?.org_managed || false;
  };

  // Handle join organization
  const handleJoinOrganization = async (orgId) => {
    if (!currentUser) {
      setError(prev => ({ 
        ...prev, 
        authError: 'Debes iniciar sesión para unirte a una organización' 
      }));
      return;
    }

    setJoiningOrg(orgId);
    
    try {
      const success = await joinOrganization(orgId);
      if (success) {
        setJoinedOrgs(prev => new Set([...prev, orgId]));
        setSuccess(prev => ({ 
          ...prev, 
          joinSuccess: '¡Te has unido a la organización exitosamente!' 
        }));
      }
    } catch (error) {
      console.error('Error joining organization:', error);
    } finally {
      setJoiningOrg(null);
    }
  };

  // Handle leave organization
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
      }
    } catch (error) {
      console.error('Error leaving organization:', error);
    } finally {
      setLeavingOrg(null);
    }
  };

  // Handle image click
  const handleImageClick = (imagePath) => {
    if (imagePath) {
      const fullImagePath = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${imagePath}`;
      openImageModal(fullImagePath);
    }
  };

  // Loading state
  if (organizationsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Cargando organizaciones...</p>
      </div>
    );
  }

  // Empty state
  if (!organizations || organizations.length === 0) {
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
        {organizations.map(org => {
          const joined = hasJoined(org.id_organization);
          const manager = isManager(org.id_organization);
          const isJoining = joiningOrg === org.id_organization;
          const isLeaving = leavingOrg === org.id_organization;
          
          return (
            <div key={org.id_organization} className={styles.organizationCard}>
              <div className={styles.cardHeader}>
                {org.image_org ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${org.image_org}`}
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
                {manager ? (
                  <div className={styles.managerBadge}>
                    <span>Eres gestor/a</span>
                  </div>
                ) : joined ? (
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
                ) : (
                  <button
                    className={`${styles.actionButton} ${styles.joinButton}`}
                    onClick={() => handleJoinOrganization(org.id_organization)}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <span className={styles.buttonLoader}></span>
                        <span>Uniéndose...</span>
                      </>
                    ) : (
                      <span>Unirme</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={styles.resultsCount}>
        <p>
          Mostrando {organizations.length} {organizations.length === 1 ? 'organización' : 'organizaciones'}
        </p>
      </div>
    </div>
  );
};

export default OrganizationsList;