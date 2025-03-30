import { useState } from 'react';
import axiosInstance from '../app/axiosConfig.js';
import { useUI } from '../../app_context/UIContext.jsx';

export const useIPValidation = () => {
  // UPDATE: Using useUI hook instead of AppContext
  const { setError } = useUI();

  const validateIPRegistration = async () => {
    try {
      const response = await axiosInstance.get('/user/ip/check');
      console.log('Response:', response.data);
      // If the response indicates that registration is not allowed
      if (!response.data.canRegister) {
        const hoursLeft = Math.ceil(response.data.hoursUntilReset);

        setError(prevError => ({ ...prevError, ipError: 'Demasiados registros.'}));
        return false;
      }
      return true;
    } catch (err) {
      console.error('-> useIpValidation.jsx - validateIPRegistration() - Error validating IP:', err);
      return false;
    }
  };

  // Return the IP error state and the validateIPRegistration function
  return {
    validateIPRegistration
  };
};