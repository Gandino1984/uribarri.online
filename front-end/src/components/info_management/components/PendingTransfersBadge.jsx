// front-end/src/components/info_management/components/PendingTransfersBadge.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from '../../../../public/css/PendingTransfersBadge.module.css';

const PendingTransfersBadge = ({ onTransferProcessed }) => {
  const { currentUser } = useAuth();
  //update: Use correct modal state from UIContext
  const { 
    setError, 
    setSuccess,
    setIsModalOpen,
    setModalMessage,
    setModalConfirmCallback
  } = useUI();
  
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [showTransfers, setShowTransfers] = useState(false);
  const [processingTransfer, setProcessingTransfer] = useState(null);
  
  const fetchPendingTransfers = async () => {
    if (!currentUser?.id_user) return;
    
    try {
      const response = await axiosInstance.post('/organization-transfer/by-to-user', {
        id_user: currentUser.id_user
      });
      
      if (response.data && !response.data.error) {
        const transfers = response.data.data || [];
        const pending = transfers.filter(t => t.request_status === 'pending');
        setPendingTransfers(pending);
      }
    } catch (err) {
      console.error('Error fetching pending transfers:', err);
    }
  };
  
  useEffect(() => {
    fetchPendingTransfers();
  }, [currentUser]);
  
  //update: Fixed to use your modal system
  const handleAccept = (transfer) => {
    console.log('=== handleAccept called ===');
    console.log('Transfer:', transfer);
    
    //update: Set modal message
    setModalMessage(`¿Aceptar el traspaso de "${transfer.organization?.name_org}" de ${transfer.from_user?.name_user}?`);
    
    //update: Set callback for when user confirms
    setModalConfirmCallback(() => async (confirmed) => {
      console.log('Accept modal callback, confirmed:', confirmed);
      
      if (!confirmed) {
        console.log('Accept cancelled by user');
        return;
      }
      
      console.log('=== Accepting transfer ===');
      setProcessingTransfer(transfer.id_transfer_request);
      
      try {
        const response = await axiosInstance.post('/organization-transfer/accept', {
          id_transfer_request: transfer.id_transfer_request,
          response_message: null
        });
        
        console.log('Accept response:', response.data);
        
        if (response.data && !response.data.error) {
          setSuccess(prev => ({
            ...prev,
            transferSuccess: '¡Traspaso aceptado! Ahora eres el gestor de la organización.'
          }));
          await fetchPendingTransfers();
          if (onTransferProcessed) {
            onTransferProcessed();
          }
        } else {
          setError(prev => ({
            ...prev,
            transferError: response.data.error || 'Error al aceptar el traspaso'
          }));
        }
      } catch (err) {
        console.error('Error accepting transfer:', err);
        setError(prev => ({
          ...prev,
          transferError: 'Error al aceptar el traspaso'
        }));
      } finally {
        setProcessingTransfer(null);
      }
    });
    
    //update: Open modal
    setIsModalOpen(true);
  };
  
  //update: Fixed to use your modal system
  const handleReject = (transfer) => {
    console.log('=== handleReject called ===');
    console.log('Transfer:', transfer);
    
    //update: Set modal message
    setModalMessage(`¿Rechazar el traspaso de "${transfer.organization?.name_org}"?`);
    
    //update: Set callback for when user confirms
    setModalConfirmCallback(() => async (confirmed) => {
      console.log('Reject modal callback, confirmed:', confirmed);
      
      if (!confirmed) {
        console.log('Reject cancelled by user');
        return;
      }
      
      console.log('=== Rejecting transfer ===');
      setProcessingTransfer(transfer.id_transfer_request);
      
      try {
        const response = await axiosInstance.post('/organization-transfer/reject', {
          id_transfer_request: transfer.id_transfer_request,
          response_message: null
        });
        
        console.log('Reject response:', response.data);
        
        if (response.data && !response.data.error) {
          setSuccess(prev => ({
            ...prev,
            rejectSuccess: 'Solicitud de traspaso rechazada'
          }));
          await fetchPendingTransfers();
        } else {
          setError(prev => ({
            ...prev,
            rejectError: response.data.error || 'Error al rechazar el traspaso'
          }));
        }
      } catch (err) {
        console.error('Error rejecting transfer:', err);
        setError(prev => ({
          ...prev,
          rejectError: 'Error al rechazar el traspaso'
        }));
      } finally {
        setProcessingTransfer(null);
      }
    });
    
    //update: Open modal
    setIsModalOpen(true);
  };
  
  if (pendingTransfers.length === 0) return null;
  
  return (
    <div className={styles.container}>
      <button
        className={styles.badgeButton}
        onClick={() => setShowTransfers(!showTransfers)}
        title="Tienes solicitudes de traspaso pendientes"
      >
        <ArrowRightLeft size={18} />
        <span>Traspasos pendientes</span>
        <span className={styles.count}>{pendingTransfers.length}</span>
      </button>
      
      {showTransfers && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>Solicitudes de Traspaso Pendientes</h4>
          </div>
          <div className={styles.transfersList}>
            {pendingTransfers.map(transfer => (
              <div key={transfer.id_transfer_request} className={styles.transferItem}>
                <div className={styles.transferInfo}>
                  <strong>{transfer.organization?.name_org}</strong>
                  <span className={styles.fromUser}>
                    De: {transfer.from_user?.name_user}
                  </span>
                  {transfer.transfer_message && (
                    <p className={styles.message}>{transfer.transfer_message}</p>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(transfer)}
                    disabled={processingTransfer === transfer.id_transfer_request}
                    title="Aceptar traspaso"
                  >
                    {processingTransfer === transfer.id_transfer_request ? (
                      <span className={styles.loader}></span>
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(transfer)}
                    disabled={processingTransfer === transfer.id_transfer_request}
                    title="Rechazar traspaso"
                  >
                    {processingTransfer === transfer.id_transfer_request ? (
                      <span className={styles.loader}></span>
                    ) : (
                      <XCircle size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTransfersBadge;