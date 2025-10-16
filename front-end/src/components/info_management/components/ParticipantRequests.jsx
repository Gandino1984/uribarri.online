// front-end/src/components/info_management/components/ParticipantRequests.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { useParticipant } from '../../../app_context/ParticipantContext.jsx';
import { User, Calendar, MapPin, CheckCircle, XCircle, Clock, MessageSquare, X } from 'lucide-react';
import styles from '../../../../css/ParticipantRequests.module.css';

const ParticipantRequests = ({ organizationId, organizationName, onClose }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  const { 
    organizationRequests,
    fetchOrganizationRequests,
    approveRequest,
    rejectRequest,
    requestsLoading,
    pendingRequestsCount
  } = useParticipant();
  
  const [filterStatus, setFilterStatus] = useState('pending');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState(null); // 'approve' or 'reject'
  
  // Load requests on mount and when filter changes
  useEffect(() => {
    if (organizationId) {
      fetchOrganizationRequests(organizationId, filterStatus);
    }
  }, [organizationId, filterStatus, fetchOrganizationRequests]);
  
  // Handle approve request
  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setResponseAction('approve');
    setShowResponseModal(true);
  };
  
  // Handle reject request
  const handleReject = async (request) => {
    setSelectedRequest(request);
    setResponseAction('reject');
    setShowResponseModal(true);
  };
  
  // Submit response (approve or reject with optional message)
  const handleSubmitResponse = async () => {
    if (!selectedRequest) return;
    
    setProcessingRequest(selectedRequest.id_request);
    setShowResponseModal(false);
    
    const success = responseAction === 'approve' 
      ? await approveRequest(selectedRequest.id_request, responseMessage || null)
      : await rejectRequest(selectedRequest.id_request, responseMessage || null);
    
    if (success) {
      // Refresh the requests list
      await fetchOrganizationRequests(organizationId, filterStatus);
    }
    
    setProcessingRequest(null);
    setSelectedRequest(null);
    setResponseMessage('');
    setResponseAction(null);
  };
  
  // Cancel response modal
  const handleCancelResponse = () => {
    setShowResponseModal(false);
    setSelectedRequest(null);
    setResponseMessage('');
    setResponseAction(null);
  };
  
  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  };
  
  // Get filtered requests
  const getFilteredRequests = () => {
    if (filterStatus === 'all') return organizationRequests;
    return organizationRequests.filter(req => req.request_status === filterStatus);
  };
  
  const filteredRequests = getFilteredRequests();
  
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Solicitudes de Participación</h2>
            <p className={styles.subtitle}>{organizationName}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton} title="Cerrar">
            <X size={20} />
          </button>
        </div>
        
        {/* Filter tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filterStatus === 'pending' ? styles.active : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pendientes ({organizationRequests.filter(r => r.request_status === 'pending').length})
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'approved' ? styles.active : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Aprobadas ({organizationRequests.filter(r => r.request_status === 'approved').length})
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'rejected' ? styles.active : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rechazadas ({organizationRequests.filter(r => r.request_status === 'rejected').length})
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todas ({organizationRequests.length})
          </button>
        </div>
        
        {/* Requests list */}
        {requestsLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className={styles.emptyContainer}>
            <Clock size={48} />
            <p>No hay solicitudes {filterStatus !== 'all' ? filterStatus === 'pending' ? 'pendientes' : filterStatus === 'approved' ? 'aprobadas' : 'rechazadas' : ''}</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {filteredRequests.map(request => (
              <div key={request.id_request} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.userInfo}>
                    {request.user?.image_user ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/${request.user.image_user}`}
                        alt={request.user.name_user}
                        className={styles.userAvatar}
                      />
                    ) : (
                      <div className={styles.userAvatarPlaceholder}>
                        <User size={20} />
                      </div>
                    )}
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>{request.user?.name_user || 'Usuario'}</h4>
                      <p className={styles.userEmail}>{request.user?.email_user}</p>
                      {request.user?.location_user && (
                        <p className={styles.userLocation}>
                          <MapPin size={12} />
                          {request.user.location_user}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`${styles.statusBadge} ${styles[request.request_status]}`}>
                    {request.request_status === 'pending' && <Clock size={14} />}
                    {request.request_status === 'approved' && <CheckCircle size={14} />}
                    {request.request_status === 'rejected' && <XCircle size={14} />}
                    <span>{
                      request.request_status === 'pending' ? 'Pendiente' :
                      request.request_status === 'approved' ? 'Aprobada' :
                      'Rechazada'
                    }</span>
                  </div>
                </div>
                
                {request.request_message && (
                  <div className={styles.requestMessage}>
                    <MessageSquare size={14} />
                    <p>{request.request_message}</p>
                  </div>
                )}
                
                {request.response_message && (
                  <div className={styles.responseMessage}>
                    <MessageSquare size={14} />
                    <p><strong>Respuesta:</strong> {request.response_message}</p>
                  </div>
                )}
                
                <div className={styles.requestFooter}>
                  <p className={styles.requestDate}>
                    <Calendar size={14} />
                    {formatDate(request.created_at)}
                  </p>
                  
                  {request.request_status === 'pending' && (
                    <div className={styles.requestActions}>
                      <button
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        onClick={() => handleApprove(request)}
                        disabled={processingRequest === request.id_request}
                      >
                        {processingRequest === request.id_request ? (
                          <>
                            <span className={styles.buttonLoader}></span>
                            <span>Procesando...</span>
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
                        onClick={() => handleReject(request)}
                        disabled={processingRequest === request.id_request}
                      >
                        <XCircle size={16} />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Response Modal */}
        {showResponseModal && selectedRequest && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>
                {responseAction === 'approve' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </h3>
              <p className={styles.modalSubtitle}>
                Solicitud de <strong>{selectedRequest.user?.name_user}</strong>
              </p>
              
              <div className={styles.modalContent}>
                <label htmlFor="response-message" className={styles.modalLabel}>
                  Mensaje de respuesta (opcional):
                </label>
                <textarea
                  id="response-message"
                  className={styles.modalTextarea}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={responseAction === 'approve' 
                    ? "¡Bienvenido/a a la asociación!..." 
                    : "Lamentamos informarte que..."}
                  rows={4}
                />
              </div>
              
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancelButton}
                  onClick={handleCancelResponse}
                >
                  Cancelar
                </button>
                <button
                  className={`${styles.modalSubmitButton} ${responseAction === 'approve' ? styles.approveAction : styles.rejectAction}`}
                  onClick={handleSubmitResponse}
                >
                  {responseAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantRequests; 