// front-end/src/app_context/ParticipantContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../utils/app/axiosConfig.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const ParticipantContext = createContext();

export const ParticipantProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  // State for participant requests
  const [organizationRequests, setOrganizationRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  //update: Create a join request
  const createJoinRequest = useCallback(async (organizationId, message = null) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        authError: 'Debes iniciar sesión para solicitar unirte' 
      }));
      return null;
    }
    
    try {
      const response = await axiosInstance.post('/participant-request/create', {
        id_user: currentUser.id_user,
        id_org: organizationId,
        request_message: message
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          requestSuccess: response.data.success || '¡Solicitud enviada exitosamente!' 
        }));
        return response.data.data;
      } else {
        setError(prev => ({ 
          ...prev, 
          requestError: response.data.error || 'Error al enviar la solicitud' 
        }));
        return null;
      }
    } catch (err) {
      console.error('Error creating join request:', err);
      setError(prev => ({ 
        ...prev, 
        requestError: 'Error al enviar la solicitud' 
      }));
      return null;
    }
  }, [currentUser, setError, setSuccess]);
  
  //update: Get organization requests (for managers)
  const fetchOrganizationRequests = useCallback(async (organizationId, status = 'pending') => {
    try {
      setRequestsLoading(true);
      const response = await axiosInstance.post('/participant-request/by-organization', {
        id_org: organizationId,
        status: status
      });
      
      if (response.data && !response.data.error) {
        const requests = response.data.data || [];
        setOrganizationRequests(requests);
        
        // Count pending requests
        if (status === 'all' || status === 'pending') {
          const pending = requests.filter(r => r.request_status === 'pending');
          setPendingRequestsCount(pending.length);
        }
        
        return requests;
      } else {
        setOrganizationRequests([]);
        setPendingRequestsCount(0);
        return [];
      }
    } catch (err) {
      console.error('Error fetching organization requests:', err);
      setOrganizationRequests([]);
      setPendingRequestsCount(0);
      return [];
    } finally {
      setRequestsLoading(false);
    }
  }, []);
  
  //update: Get user's requests
  const fetchUserRequests = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const response = await axiosInstance.post('/participant-request/by-user', {
        id_user: userId
      });
      
      if (response.data && !response.data.error) {
        const requests = response.data.data || [];
        setUserRequests(requests);
        return requests;
      } else {
        setUserRequests([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching user requests:', err);
      setUserRequests([]);
      return [];
    }
  }, []);
  
  //update: Approve a request
  const approveRequest = useCallback(async (requestId, message = null) => {
    try {
      const response = await axiosInstance.post('/participant-request/approve', {
        id_request: requestId,
        response_message: message
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          approveSuccess: response.data.success || 'Solicitud aprobada' 
        }));
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          approveError: response.data.error || 'Error al aprobar la solicitud' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error approving request:', err);
      setError(prev => ({ 
        ...prev, 
        approveError: 'Error al aprobar la solicitud' 
      }));
      return false;
    }
  }, [setError, setSuccess]);
  
  //update: Reject a request
  const rejectRequest = useCallback(async (requestId, message = null) => {
    try {
      const response = await axiosInstance.post('/participant-request/reject', {
        id_request: requestId,
        response_message: message
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          rejectSuccess: response.data.success || 'Solicitud rechazada' 
        }));
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          rejectError: response.data.error || 'Error al rechazar la solicitud' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(prev => ({ 
        ...prev, 
        rejectError: 'Error al rechazar la solicitud' 
      }));
      return false;
    }
  }, [setError, setSuccess]);
  
  //update: Cancel a pending request
  const cancelRequest = useCallback(async (organizationId) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        authError: 'Debes iniciar sesión' 
      }));
      return false;
    }
    
    try {
      const response = await axiosInstance.post('/participant-request/cancel', {
        id_user: currentUser.id_user,
        id_org: organizationId
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          cancelSuccess: response.data.success || 'Solicitud cancelada' 
        }));
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          cancelError: response.data.error || 'Error al cancelar la solicitud' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error canceling request:', err);
      setError(prev => ({ 
        ...prev, 
        cancelError: 'Error al cancelar la solicitud' 
      }));
      return false;
    }
  }, [currentUser, setError, setSuccess]);
  
  const value = {
    // State
    organizationRequests,
    userRequests,
    requestsLoading,
    pendingRequestsCount,
    
    // Actions
    createJoinRequest,
    fetchOrganizationRequests,
    fetchUserRequests,
    approveRequest,
    rejectRequest,
    cancelRequest
  };
  
  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (context === undefined) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

export default ParticipantContext;