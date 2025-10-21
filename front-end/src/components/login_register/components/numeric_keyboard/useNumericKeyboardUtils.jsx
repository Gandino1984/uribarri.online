import { useAuth } from '../../../../app_context/AuthContext.jsx';

export const useNumericKeyboardUtils = (value, onChange, onPasswordComplete, onClear) => {
    // UPDATE: Using useAuth hook instead of AppContext
    const {
        MAX_PASSWORD_LENGTH, 
        setDisplayedPassword,
        setPassword,
        setPasswordRepeat,
        setShowPasswordRepeat,
        setShowPasswordLabel,
        setKeyboardKey,
    } = useAuth();

    const handleKeyClick = (num, e) => {
        e.preventDefault();
        if (value.length < MAX_PASSWORD_LENGTH) {
            const newValue = value + num;
            //update: Update the actual password value
            onChange(newValue);
            //update: Update the displayed (masked) value
            setDisplayedPassword(''.repeat(newValue.length));

            //update: Pass newValue to onPasswordComplete so it can check the actual length
            if (newValue.length === MAX_PASSWORD_LENGTH) {
                onPasswordComplete(newValue);
            }
        }
    };

    const handleBackspace = (e) => {
        e.preventDefault();
        if (value.length > 0) {
          const newValue = value.slice(0, -1);
          // Update both actual and displayed values
          onChange(newValue);
          setDisplayedPassword(''.repeat(newValue.length));
        }
    };
      
    const handleClearPassword = (e) => {
        e.preventDefault();
        onChange('');
        setDisplayedPassword('');
        if (onClear) {
          onClear();
        }
    };

    const handleClear = (isLogin) => () => {
        if (!isLogin) {
            if (showPasswordRepeat) {
                setPassword('');
                setPasswordRepeat('');
                setDisplayedPassword('');
                setShowPasswordRepeat(false);
                setShowPasswordLabel(true);
                setKeyboardKey((prev) => prev + 1);
            } else {
                setPassword('');
                setDisplayedPassword('');
            }
        } else {
            setPassword('');
            setDisplayedPassword('');
            setShowPasswordLabel(true);
        }
    };

    return {
        handleKeyClick,
        handleBackspace,
        handleClearPassword,
        handleClear
    };
};