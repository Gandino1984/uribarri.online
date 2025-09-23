// front-end/src/app_context/PublicationContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../utils/app/axiosConfig.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const PublicationContext = createContext();

export const PublicationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  // Publication state
  const [publications, setPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [userPublications, setUserPublications] = useState([]);
  const [organizationPublications, setOrganizationPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  const [filterByOrganization, setFilterByOrganization] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch all publications
  const fetchAllPublications = useCallback(async () => {
    try {
      setPublicationsLoading(true);
      const response = await axiosInstance.get('/publication');
      
      if (response.data && !response.data.error) {
        let pubs = response.data.data || [];
        
        // Apply organization filter if active
        if (filterByOrganization) {
          pubs = pubs.filter(pub => pub.id_org === filterByOrganization);
        }
        
        // Apply sort order
        if (sortOrder === 'oldest') {
          pubs.reverse();
        }
        
        setPublications(pubs);
        return pubs;
      } else {
        setError(prev => ({ 
          ...prev, 
          publicationError: response.data.error || 'Error al cargar publicaciones' 
        }));
        return [];
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(prev => ({ 
        ...prev, 
        publicationError: 'Error al cargar las publicaciones' 
      }));
      return [];
    } finally {
      setPublicationsLoading(false);
    }
  }, [filterByOrganization, sortOrder, setError]);

  // Fetch publications by organization
  const fetchPublicationsByOrganization = useCallback(async (orgId) => {
    if (!orgId) return [];
    
    try {
      setPublicationsLoading(true);
      const response = await axiosInstance.post('/publication/by-organization', {
        id_org: orgId
      });
      
      if (response.data && !response.data.error) {
        const orgPubs = response.data.data || [];
        setOrganizationPublications(orgPubs);
        setPublications(orgPubs); // Also set main publications array
        return orgPubs;
      } else {
        setOrganizationPublications([]);
        setPublications([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching organization publications:', err);
      return [];
    } finally {
      setPublicationsLoading(false);
    }
  }, []);

  // Fetch publications by user
  const fetchPublicationsByUser = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const response = await axiosInstance.post('/publication/by-user-id', {
        id_user: userId
      });
      
      if (response.data && !response.data.error) {
        const userPubs = response.data.data || [];
        setUserPublications(userPubs);
        return userPubs;
      } else {
        setUserPublications([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching user publications:', err);
      return [];
    }
  }, []);

  // Create a new publication
  const createPublication = useCallback(async (publicationData) => {
    if (!currentUser?.id_user) {
      setError(prev => ({ 
        ...prev, 
        createError: 'Debes iniciar sesión para crear una publicación' 
      }));
      return null;
    }
    
    try {
      const response = await axiosInstance.post('/publication/create', {
        ...publicationData,
        id_user_pub: currentUser.id_user
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          createSuccess: response.data.success || '¡Publicación creada exitosamente!' 
        }));
        
        // Refresh publications list
        await fetchAllPublications();
        
        return response.data.data;
      } else {
        setError(prev => ({ 
          ...prev, 
          createError: response.data.error || 'Error al crear la publicación' 
        }));
        return null;
      }
    } catch (err) {
      console.error('Error creating publication:', err);
      setError(prev => ({ 
        ...prev, 
        createError: 'Error al crear la publicación' 
      }));
      return null;
    }
  }, [currentUser, setError, setSuccess, fetchAllPublications]);

  // Update a publication
  const updatePublication = useCallback(async (publicationId, updateData) => {
    try {
      const response = await axiosInstance.patch('/publication/update', {
        id_publication: publicationId,
        ...updateData
      });
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          updateSuccess: 'Publicación actualizada exitosamente' 
        }));
        
        // Refresh publications
        await fetchAllPublications();
        
        return response.data.data;
      } else {
        setError(prev => ({ 
          ...prev, 
          updateError: response.data.error || 'Error al actualizar la publicación' 
        }));
        return null;
      }
    } catch (err) {
      console.error('Error updating publication:', err);
      setError(prev => ({ 
        ...prev, 
        updateError: 'Error al actualizar la publicación' 
      }));
      return null;
    }
  }, [setError, setSuccess, fetchAllPublications]);

  // Delete a publication
  const deletePublication = useCallback(async (publicationId) => {
    try {
      const response = await axiosInstance.delete(`/publication/remove-by-id/${publicationId}`);
      
      if (response.data && !response.data.error) {
        setSuccess(prev => ({ 
          ...prev, 
          deleteSuccess: response.data.message || 'Publicación eliminada' 
        }));
        
        // Refresh publications
        await fetchAllPublications();
        
        return true;
      } else {
        setError(prev => ({ 
          ...prev, 
          deleteError: response.data.error || 'Error al eliminar la publicación' 
        }));
        return false;
      }
    } catch (err) {
      console.error('Error deleting publication:', err);
      setError(prev => ({ 
        ...prev, 
        deleteError: 'Error al eliminar la publicación' 
      }));
      return false;
    }
  }, [setError, setSuccess, fetchAllPublications]);

  const value = {
    // State
    publications,
    setPublications,
    selectedPublication,
    setSelectedPublication,
    userPublications,
    setUserPublications,
    organizationPublications,
    setOrganizationPublications,
    publicationsLoading,
    filterByOrganization,
    setFilterByOrganization,
    sortOrder,
    setSortOrder,
    
    // Actions
    fetchAllPublications,
    fetchPublicationsByOrganization,
    fetchPublicationsByUser,
    createPublication,
    updatePublication,
    deletePublication
  };

  return (
    <PublicationContext.Provider value={value}>
      {children}
    </PublicationContext.Provider>
  );
};

export const usePublication = () => {
  const context = useContext(PublicationContext);
  if (context === undefined) {
    throw new Error('usePublication must be used within a PublicationProvider');
  }
  return context;
};

export default PublicationContext;