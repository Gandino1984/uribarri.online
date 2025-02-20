// imageValidationUtils.js
export const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    return new Promise((resolve, reject) => {
        // Check file type
        if (!validTypes.includes(file.type)) {
            reject(new Error('Tipo de archivo no permitido. Solo se permiten archivos JPG, JPEG, PNG o WebP'));
            return;
        }

        // Check file size
        if (file.size > maxSize) {
            reject(new Error('El tamaño máximo de imagen es 2MB'));
            return;
        }

        // Create an image object to check dimensions if needed
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve({
                valid: true,
                width: img.width,
                height: img.height
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Error al procesar la imagen'));
        };
    });
};