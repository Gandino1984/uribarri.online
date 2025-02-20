import { useState} from 'react';
import axiosInstance from '../app/axiosConfig.js';
import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';


export const useIPValidation = () => {
  const {
   setError
  } = useContext(AppContext);


  const validateIPRegistration = async () => {
    try {
      const response = await axiosInstance.get('/user/ip/check');
      console.log('Response:', response.data);
      // If the response indicates that registration is not allowed
      if (!response.data.canRegister) {
        const hoursLeft = Math.ceil(response.data.hoursUntilReset);

        setError(prevError => ({ ...prevError, ipError: `Demasiados registros en este dispositivo. Intente en ${hoursLeft} horas.` }));
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