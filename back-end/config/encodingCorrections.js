// encoding_utils.js
const encodingCorrections = {
    'Ã±': 'ñ', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú', 'Ã': 'Ñ'
  };
  
  export function correctEncoding(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        Object.entries(encodingCorrections).forEach(([wrong, correct]) => {
          obj[key] = obj[key].replace(new RegExp(wrong, 'g'), correct);
        });
      }
    });
    return obj;
  }