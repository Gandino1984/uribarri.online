import { useUI } from '../../app_context/UIContext.jsx';

export const CardDisplayUtils = () => {
    // UI context values
    const {
        setError, setSuccess, setInfo,
        setShowErrorCard, setShowSuccessCard, setShowInfoCard,
        clearError, clearSuccess, clearInfo
    } = useUI();

    // 🎴 UPDATE: Function to handle card animations
    const handleCardAnimation = (cardType) => {
        // Function to handle any animation-related behaviors for different card types
        switch (cardType) {
            case 'error':
                // Any specific animation behavior for error cards
                break;
            case 'success':
                // Any specific animation behavior for success cards
                break;
            case 'info':
                // Any specific animation behavior for info cards
                break;
            default:
                break;
        }
    };
    
    // 🎴 UPDATE: Function to automatically hide cards after a specified duration
    const autoHideCards = (cardType) => {
        // Auto-dismiss based on card type
        switch (cardType) {
            case 'success':
                setTimeout(() => {
                    setShowSuccessCard(false);
                    // After animation completes, clear the content
                    setTimeout(() => {
                        clearSuccess();
                    }, 300);
                }, 5000); // Auto-dismiss success messages after 5 seconds
                break;
            case 'error':
                setTimeout(() => {
                    setShowErrorCard(false);
                    // After animation completes, clear the content
                    setTimeout(() => {
                        clearError();
                    }, 300);
                }, 8000); // Keep error messages longer - 8 seconds
                break;
            case 'info':
                setTimeout(() => {
                    setShowInfoCard(false);
                    // After animation completes, clear the content
                    setTimeout(() => {
                        clearInfo();
                    }, 300);
                }, 4000); // Info messages dismiss quicker - 4 seconds
                break;
            default:
                break;
        }
    };

    return {
        handleCardAnimation,
        autoHideCards
    };
};