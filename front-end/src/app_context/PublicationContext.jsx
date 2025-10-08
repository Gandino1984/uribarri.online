// front-end/src/app_context/PublicationContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../utils/app/axiosConfig.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';

const PublicationContext = createContext();

export const PublicationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  // Publication state
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [userPublications, setUserPublications] = useState([]);
  const [organizationPublications, setOrganizationPublications] = useState([]);
  const [publicationsLoading, setPublicationsLoading] = useState(false);
  
  //update: Unified filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    filterByOrganization: null,
    filterByUser: null,
    sortOrder: 'newest'
  });

  //update: Apply filters function - similar to ProductContext pattern
  const applyFilters = useCallback(() => {
    if (!publications || publications.length === 0) {
      setFilteredPublications([]);
      return;
    }

    let filtered = [...publications];

    // Apply search term filter
    if (filters.searchTerm.trim() !== '') {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(pub => {
        return (
          (pub.title_pub && pub.title_pub.toLowerCase().includes(searchLower)) ||
          (pub.content_pub && pub.content_pub.toLowerCase().includes(searchLower)) ||
          (pub.publisher?.name_user && pub.publisher.name_user.toLowerCase().includes(searchLower)) ||
          (pub.organization?.name_org && pub.organization.name_org.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply organization filter
    if (filters.filterByOrganization) {
      filtered = filtered.filter(pub => pub.id_org === filters.filterByOrganization);
    }

    // Apply user filter
    if (filters.filterByUser) {
      filtered = filtered.filter(pub => pub.id_user_pub === filters.filterByUser);
    }

    // Apply sort order
    if (filters.sortOrder === 'oldest') {
      filtered.reverse();
    }

    setFilteredPublications(filtered);
  }, [publications, filters]);

  //update: Effect to apply filters whenever publications or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch all publications
  const fetchAllPublications = useCallback(async () => {
    try {
      setPublicationsLoading(true);
      const response = await axiosInstance.get('/publication');
      
      if (response.data && !response.data.error) {
        let pubs = response.data.data || [];
        
        // Sort by newest first by default
        pubs.sort((a, b) => {
          const dateA = new Date(`${a.date_pub}T${a.time_pub || '00:00:00'}`);
          const dateB = new Date(`${b.date_pub}T${b.time_pub || '00:00:00'}`);
          return dateB - dateA;
        });
        
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
  }, [setError]);

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
        return orgPubs;
      } else {
        setOrganizationPublications([]);
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

  //update: Reset all filters to default
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterByOrganization: null,
      filterByUser: null,
      sortOrder: 'newest'
    });
  }, []);

  //update: Update individual filter
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const value = {
    // State
    publications,
    setPublications,
    filteredPublications,
    setFilteredPublications,
    selectedPublication,
    setSelectedPublication,
    userPublications,
    setUserPublications,
    organizationPublications,
    setOrganizationPublications,
    publicationsLoading,
    //update: Expose filters state
    filters,
    setFilters,
    
    // Actions
    fetchAllPublications,
    fetchPublicationsByOrganization,
    fetchPublicationsByUser,
    createPublication,
    updatePublication,
    deletePublication,
    //update: New filter actions
    resetFilters,
    updateFilter,
    applyFilters
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