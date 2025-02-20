export const useUsernameValidation = () => {

  const getValidationErrors = (name_user) => {
    const errors = [];
    if (name_user.length < 3) { 
        errors.push('El nombre debe tener al menos 3 caracteres');
    }
    if (name_user.length > 50) {  
        errors.push('El nombre no puede exceder 50 caracteres');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name_user)) {
        errors.push('El nombre solo puede contener letras, números o guiones bajos');
    }
    if (name_user.trim().length === 0) {
        errors.push('El nombre de usuaria es requerido');
    }
    return errors;
  };

  const cleanupUsername = (name_user) => {
    if (!name_user) return '';
    
    // Create a mapping for accented characters
    const accentMap = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
    };
    
    // Replace accented characters with their non-accented equivalents
    let cleanedUsername = name_user
      .split('')
      .map(char => accentMap[char] || char)
      .join('');
    
    // Only allow letters, numbers, underscores, and spaces
    cleanedUsername = cleanedUsername.replace(/[^a-zA-Z0-9_ ]/g, '');
    // Trim spaces from start and end
    cleanedUsername = cleanedUsername.trim();
    // Replace multiple spaces with a single space
    cleanedUsername = cleanedUsername.replace(/\s+/g, ' ');
    
    return cleanedUsername;
  };

  const validateUsername = (name_user) => {
    const cleanedUsername = cleanupUsername(name_user);
    return {
        isValid: cleanedUsername.length >= 2 && cleanedUsername.length <= 100,
        cleanedUsername,
        errors: getValidationErrors(cleanedUsername)
    };
  };

  return {
    validateUsername,
    cleanupUsername
  };
};