import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';

const useShopValorationForm = (shop, currentUser, setError, setSuccess, onClose, onSubmitSuccess) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [rateMessage, setRateMessage] = useState('');
  const [existingValoration, setExistingValoration] = useState(null);
  //update: Add state for purchase verification
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(true);

  //update: Check if user can rate this shop
  const checkCanRate = useCallback(async () => {
    if (!currentUser || currentUser.type_user !== 'user') {
      setCanRate(false);
      setRateMessage('Solo los usuarios pueden valorar comercios');
      setPurchaseCheckLoading(false);
      return;
    }

    try {
      setPurchaseCheckLoading(true);
      
      //update: First check if user has made a successful purchase from this shop using the correct endpoint
      console.log('Checking purchase for user:', currentUser.id_user, 'shop:', shop.id_shop);
      
      const purchaseResponse = await axiosInstance.get('/order/check-purchase', {
        params: {
          id_user: currentUser.id_user,
          id_shop: shop.id_shop
        }
      });

      console.log('Purchase check response:', purchaseResponse.data);
      
      const hasMadePurchase = purchaseResponse.data.hasPurchased || false;
      setHasPurchased(hasMadePurchase);

      if (!hasMadePurchase) {
        setCanRate(false);
        setRateMessage('Debes realizar una compra en este comercio antes de poder valorarlo');
        setPurchaseCheckLoading(false);
        return;
      }

      //update: If user has purchased, check if they can rate (haven't rated yet or can update)
      const response = await axiosInstance.post('/shop-valoration/can-rate', {
        id_user: currentUser.id_user,
        id_shop: shop.id_shop
      });

      if (response.data.canRate) {
        setCanRate(true);
        setRateMessage('');
      } else {
        setCanRate(false);
        setRateMessage(response.data.reason || 'No puedes valorar este comercio');
        
        if (response.data.existingValoration) {
          setExistingValoration(response.data.existingValoration);
          setRating(response.data.existingValoration.calification_shop);
          setComment(response.data.existingValoration.comment_shop || '');
          //update: Allow editing existing valoration
          setCanRate(true);
        }
      }
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      setCanRate(false);
      setRateMessage('Error al verificar permisos');
    } finally {
      setPurchaseCheckLoading(false);
    }
  }, [currentUser, shop.id_shop]);

  //update: Handle rating click
  const handleRatingClick = useCallback((value) => {
    if (canRate || existingValoration) {
      setRating(value);
    }
  }, [canRate, existingValoration]);

  //update: Handle mouse hover on stars
  const handleRatingHover = useCallback((value) => {
    if (canRate || existingValoration) {
      setHoveredRating(value);
    }
  }, [canRate, existingValoration]);

  //update: Handle mouse leave from stars
  const handleRatingLeave = useCallback(() => {
    setHoveredRating(0);
  }, []);

  //update: Handle comment change
  const handleCommentChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setComment(value);
    }
  }, []);

  //update: Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError({ valorationError: 'Por favor selecciona una calificación' });
      return;
    }

    //update: Double-check purchase status before submitting
    if (!hasPurchased && !existingValoration) {
      setError({ valorationError: 'Debes realizar una compra antes de valorar' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let response;
      
      if (existingValoration) {
        //update: Update existing valoration
        response = await axiosInstance.patch('/shop-valoration/update', {
          id_valoration: existingValoration.id_valoration,
          id_user: currentUser.id_user,
          id_shop: shop.id_shop,
          calification_shop: rating,
          comment_shop: comment.trim() || null
        });
      } else {
        //update: Create new valoration
        response = await axiosInstance.post('/shop-valoration/create', {
          id_user: currentUser.id_user,
          id_shop: shop.id_shop,
          calification_shop: rating,
          comment_shop: comment.trim() || null
        });
      }

      if (response.data.success) {
        setSuccess(existingValoration ? 'Valoración actualizada exitosamente' : 'Valoración creada exitosamente');
        
        // Call success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        
        // Close form after short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting valoration:', error);
      setError({ 
        valorationError: error.response?.data?.error || 'Error al enviar la valoración' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, existingValoration, hasPurchased, currentUser, shop.id_shop, setError, setSuccess, onSubmitSuccess, onClose]);

  //update: Initialize on mount
  useEffect(() => {
    checkCanRate();
  }, [checkCanRate]);

  return {
    // State
    rating,
    hoveredRating,
    comment,
    isSubmitting,
    canRate,
    rateMessage,
    existingValoration,
    hasPurchased,
    purchaseCheckLoading,
    
    // Methods
    handleRatingClick,
    handleRatingHover,
    handleRatingLeave,
    handleCommentChange,
    handleSubmit
  };
};

export default useShopValorationForm;