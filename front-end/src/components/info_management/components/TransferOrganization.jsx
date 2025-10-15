// front-end/src/components/info_management/components/TransferOrganization.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import axiosInstance from '../../../utils/app/axiosConfig.js';
import { X, Search, UserPlus, AlertCircle, Send } from 'lucide-react';
import styles from '../../../../css/TransferOrganization.module.css';

const TransferOrganization = ({ organization, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  //update: Use the correct modal state from UIContext
  const { 
    setError, 
    setSuccess, 
    setIsModalOpen,
    setModalMessage,
    setModalConfirmCallback
  } = useUI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferMessage, setTransferMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchType, setSearchType] = useState('name');
  
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setError(prev => ({
        ...prev,
        searchError: 'Ingresa al menos 2 caracteres para buscar'
      }));
      return;
    }
    
    setIsSearching(true);
    try {
      const endpoint = searchType === 'email' ? '/user/by-email' : '/user/search-by-name';
      const payload = {
        [searchType === 'email' ? 'email_user' : 'name_user']: searchTerm
      };
      
      console.log('Searching users:', { endpoint, payload });
      
      const response = await axiosInstance.post(endpoint, payload);
      
      if (response.data && !response.data.error) {
        const users = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        const filteredUsers = users.filter(user => 
          user.id_user !== currentUser.id_user
        );
        
        setSearchResults(filteredUsers);
        
        if (filteredUsers.length === 0) {
          setError(prev => ({
            ...prev,
            searchError: 'No se encontraron usuarios'
          }));
        }
      } else {
        setSearchResults([]);
        setError(prev => ({
          ...prev,
          searchError: response.data.error || 'No se encontraron usuarios'
        }));
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setError(prev => ({
        ...prev,
        searchError: 'Error al buscar usuarios'
      }));
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectUser = (user) => {
    console.log('User selected:', user);
    setSelectedUser(user);
    setSearchResults([]);
    setSearchTerm('');
  };
  
  //update: Fixed to use your modal system correctly
  const handleSendTransfer = () => {
    console.log('=== handleSendTransfer called ===');
    
    if (!selectedUser) {
      console.error('No user selected');
      setError(prev => ({
        ...prev,
        transferError: 'Debes seleccionar un usuario'
      }));
      return;
    }
    
    console.log('Setting up confirmation modal...');
    
    //update: Set the modal message
    setModalMessage(`¿Estás seguro de que deseas transferir la asociación "${organization.name_org}" a ${selectedUser.name_user}?`);
    
    //update: Set the callback function that will execute when user confirms
    setModalConfirmCallback(() => async (confirmed) => {
      console.log('Modal callback executed, confirmed:', confirmed);
      
      if (!confirmed) {
        console.log('Transfer cancelled by user');
        return;
      }
      
      console.log('=== Transfer confirmed, sending request ===');
      setIsSending(true);
      
      try {
        const payload = {
          id_org: organization.id_organization,
          id_from_user: currentUser.id_user,
          id_to_user: selectedUser.id_user,
          transfer_message: transferMessage || null
        };
        
        console.log('Sending transfer request with payload:', payload);
        
        const response = await axiosInstance.post('/organization-transfer/create', payload);
        
        console.log('Transfer response:', response.data);
        
        if (response.data && !response.data.error) {
          console.log('Transfer request created successfully');
          setSuccess(prev => ({
            ...prev,
            transferSuccess: 'Solicitud de traspaso enviada exitosamente'
          }));
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        } else {
          console.error('Transfer request failed:', response.data.error);
          setError(prev => ({
            ...prev,
            transferError: response.data.error || 'Error al enviar la solicitud'
          }));
        }
      } catch (error) {
        console.error('Error sending transfer request:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(prev => ({
          ...prev,
          transferError: 'Error al enviar la solicitud de traspaso'
        }));
      } finally {
        setIsSending(false);
      }
    });
    
    //update: Open the modal
    setIsModalOpen(true);
    console.log('Modal should be open now');
  };
  
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Traspasar asociación</h2>
          <button onClick={onClose} className={styles.closeButton} title="Cerrar">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.organizationInfo}>
          <p>Vas a traspasar la asociación:</p>
          <h3>{organization.name_org}</h3>
        </div>
        
        <div className={styles.searchSection}>
          <div className={styles.searchTypeToggle}>
            <button 
              className={searchType === 'name' ? styles.active : ''}
              onClick={() => setSearchType('name')}
            >
              Buscar por nombre
            </button>
            <button 
              className={searchType === 'email' ? styles.active : ''}
              onClick={() => setSearchType('email')}
            >
              Buscar por email
            </button>
          </div>
          
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder={searchType === 'email' ? "Email del usuario..." : "Nombre del usuario..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !searchTerm}
              className={styles.searchButton}
            >
              {isSearching ? (
                <span className={styles.loader}></span>
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map(user => (
              <div 
                key={user.id_user}
                className={styles.userCard}
                onClick={() => handleSelectUser(user)}
              >
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name_user}</span>
                  <span className={styles.userEmail}>{user.email_user}</span>
                </div>
                <UserPlus size={18} />
              </div>
            ))}
          </div>
        )}
        
        {selectedUser && (
          <div className={styles.selectedUser}>
            <h4>Usuario seleccionado:</h4>
            <div className={styles.selectedUserCard}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{selectedUser.name_user}</span>
                <span className={styles.userEmail}>{selectedUser.email_user}</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className={styles.removeButton}
                title="Quitar selección"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        
        {selectedUser && (
          <div className={styles.messageSection}>
            <label htmlFor="transfer-message">Mensaje (opcional):</label>
            <textarea
              id="transfer-message"
              value={transferMessage}
              onChange={(e) => setTransferMessage(e.target.value)}
              placeholder="Explica por qué deseas traspasar la asociación..."
              rows={3}
              className={styles.messageInput}
            />
          </div>
        )}
        
        <div className={styles.warning}>
          <AlertCircle size={18} />
          <p>
            Al traspasar la asociación, perderás todos los permisos de gestión sobre ella.
            El nuevo propietario deberá aceptar el traspaso para que se complete.
          </p>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSendTransfer}
            disabled={!selectedUser || isSending}
            className={styles.transferButton}
          >
            {isSending ? (
              <>
                <span className={styles.loader}></span>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Enviar Solicitud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferOrganization;