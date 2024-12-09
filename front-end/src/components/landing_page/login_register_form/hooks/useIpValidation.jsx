import { useState} from 'react';
import axiosInstance from '../../../../../utils/axiosConfig.js';
import { useContext } from 'react';
import AppContext from '../../../../app_context/AppContext.js';

export const useIPValidation = () => {

  const {
    ipError, setIpError
  } = useContext(AppContext);

  const validateIPRegistration = async () => {
    console.log('!!! -> useIpValidation.jsx - validateIPRegistration - Validación de IP para registro iniciada');
    try {
      // Send a GET request to the '/user/ip/check' endpoint to check the registration limit
      const response = await axiosInstance.get('/user/ip/check');
      console.log('-> validateIPRegistration -axiosInstance.get - Response from /user/ip/check = ', response);

      // If the response indicates that registration is not allowed
      if (!response.data.canRegister) {
        // Calculate the number of hours until the registration limit resets
        const hoursLeft = Math.ceil(response.data.hoursUntilReset);
        // Set the IP error message
        setIpError(`Demasiados registros desde esta IP. Intente nuevamente en ${hoursLeft} horas.`);
        console.log(`-> validateIPRegistration - Demasiados registros desde esta IP. Intente nuevamente en ${hoursLeft} horas`);
        return false;
      }

      // If registration is allowed, clear the IP error message
      setIpError('');
      console.log('-> validateIPRegistration - Registro permitido!');
      return true;
    } catch (error) {
      // If an error occurs during the validation process, set a generic error message
      setIpError('Error en el proceso de validación de registro.');
      console.log('-> validateIPRegistration - Error en el proceso de validación de registro');
      return false;
    }
  };

  // Return the IP error state and the validateIPRegistration function
  return {
    validateIPRegistration
  };
};