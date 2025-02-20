import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const convertToWebP = async (inputPath) => {
    try {
        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

        // Skip conversion if already WebP
        if (parsedPath.ext.toLowerCase() === '.webp') {
            return { path: inputPath, converted: false };
        }

        await sharp(inputPath)
            .webp({ quality: 50 }) // Adjust quality as needed
            .toFile(outputPath);

        return {
            path: outputPath,
            converted: true,
            originalPath: inputPath
        };
    } catch (error) {
        throw new Error(`Error converting image to WebP: ${error.message}`);
    }
};

export const processUploadedImage = async (file) => {
    try {
        const conversionResult = await convertToWebP(file.path);
        
        // If conversion happened, delete the original file
        if (conversionResult.converted) {
            await fs.unlink(conversionResult.originalPath);
            
            // Update the file object to reflect the new path
            file.path = conversionResult.path;
            file.filename = path.basename(conversionResult.path);
            file.mimetype = 'image/webp';
        }
        
        return file;
    } catch (error) {
        // Cleanup in case of error
        try {
            if (file.path) {
                await fs.unlink(file.path);
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
        throw error;
    }
};