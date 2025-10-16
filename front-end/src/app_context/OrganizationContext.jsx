import { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../utils/app/axiosConfig.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  // Organization state
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [managedOrganization, setManagedOrganization] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);

  // Fetch all organizations
  const fetchAllOrganizations = useCallback(async () => {
    try {
      setOrganizationsLoading(true);
      const response = await axiosInstance.get('/organization');
      
      if (response.data && !response.data.error) {
        setOrganizations(response.data.data || []);
        return response.data.data;
      } else {
        setError(prev => ({ 
          ...prev, 
          organizationError: response.data.error || 'Error al cargar organizaciones' 
        }));
        return [];
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(prev => ({ 
        ...prev, 
        organizationError: 'Error al cargar las organizaciones' 
      }));
      return [];
    } finally {
      setOrganizationsLoading(false);
    }
  }, [setError]);

  // Search organizations by name
  const searchOrganizations = useCallback(async (searchQuery) => {
    try {
      setIsSearching(true);
      
      // If no search query, fetch all
      if (!searchQuery || searchQuery.trim() === '') {
        return await fetchAllOrganizations();
      }
      
      const response = await axiosInstance.post('/organization/search', {
        search_term: searchQuery
      });
      
      if (response.data && !response.data.error) {
        const results = response.data.data || [];
        setOrganizations(results);
        return results;
      } else {
        setError(prev => ({ 
          ...prev, 
          searchError: response.data.error || 'Error en la búsqueda' 
        }));
        return [];
      }
    } catch (err) {
      console.error('Error searching organizations:', err);
      setError(prev => ({ 
        ...prev, 
        searchError: 'Error al buscar organizaciones' 
      }));
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [setError, fetchAllOrganizations]);

  // Fetch user's organizations (where they participate)
  const fetchUserOrganizations = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const response = await axiosInstance.post('/participant/by-user', {
        id_user: userId
      });
      
      if (response.data && !response.data.error) {
        const participations = response.data.data || [];
        setUserOrganizations(participations);
        
        // Check if user manages any organization
        const managed = participations.find(p => p.org_managed);
        if (managed && managed.organization) {
          setManagedOrganization(managed.organization);
        }
        
        return participations;
      } else {
        // No organizations is not an error for display
        setUserOrganizations([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching user organizations:', err);
      return [];
    }
  }, []);

  //update: Create a new organization
  const createOrganization = useCallback(async (organizationData) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        createError: 'Debes iniciar sesión para crear una asociación' 
      }));
      return null;
    }
    
    try {
      const response = await axiosInstance.post('/organization/create', {
        ...organizationData,
        id_user: currentUser.id_user
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          createSuccess: response.data.success || '¡asociación creada exitosamente!' 
        }));
        
        // Refresh organizations list
        await fetchAllOrganizations();
        
        // Refresh user's organizations
        await fetchUserOrganizations(currentUser.id_user);
        
        return response.data.data;
      } else {
        setError(prev => ({ 
          ...prev, 
          createError: response.data.error || 'Error al crear la asociación' 
        }));
        return null;
      }
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(prev => ({ 
        ...prev, 
        createError: 'Error al crear la asociación' 
      }));
      return null;
    }
  }, [currentUser, setError, setSuccess, fetchAllOrganizations, fetchUserOrganizations]);

  // Join an organization
  const joinOrganization = useCallback(async (organizationId) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        joinError: 'Debes iniciar sesión para unirte a una asociación' 
      }));
      return false;
    }
    
    try {
      const response = await axiosInstance.post('/participant/create', {
        id_org: organizationId,
        id_user: currentUser.id_user
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          joinSuccess: response.data.success || '¡Te has unido a la asociación!' 
        }));
        
        // Refresh user's organizations
        await fetchUserOrganizations(currentUser.id_user);
        
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          joinError: response.data.error || 'Error al unirse a la asociación' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error joining organization:', err);
      setError(prev => ({ 
        ...prev, 
        joinError: 'Error al unirse a la asociación' 
      }));
      return false;
    }
  }, [currentUser, setError, setSuccess, fetchUserOrganizations]);

  // Leave an organization
  const leaveOrganization = useCallback(async (organizationId) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        leaveError: 'Debes iniciar sesión' 
      }));
      return false;
    }
    
    try {
      const response = await axiosInstance.post('/participant/remove-by-user-org', {
        id_user: currentUser.id_user,
        id_org: organizationId
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          leaveSuccess: response.data.message || 'Has salido de la asociación' 
        }));
        
        // Refresh user's organizations
        await fetchUserOrganizations(currentUser.id_user);
        
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          leaveError: response.data.error || 'Error al salir de la asociación' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error leaving organization:', err);
      setError(prev => ({ 
        ...prev, 
        leaveError: 'Error al salir de la asociación' 
      }));
      return false;
    }
  }, [currentUser, setError, setSuccess, fetchUserOrganizations]);

  const value = {
    // State
    organizations,
    setOrganizations,
    selectedOrganization,
    setSelectedOrganization,
    userOrganizations,
    setUserOrganizations,
    managedOrganization,
    setManagedOrganization,
    searchTerm,
    setSearchTerm,
    isSearching,
    organizationsLoading,
    
    // Actions
    fetchAllOrganizations,
    searchOrganizations,
    fetchUserOrganizations,
    createOrganization, //update: Added createOrganization
    joinOrganization,
    leaveOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;