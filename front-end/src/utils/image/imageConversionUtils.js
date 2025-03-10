import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const convertToWebP = async (inputPath) => {
    try {
        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
        
        // Get file stats to check size
        const stats = await fs.promises.stat(inputPath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        // UPDATE: Skip conversion if already WebP and under 1MB
        if (parsedPath.ext.toLowerCase() === '.webp' && fileSizeInMB < 1) {
            console.log(`File is already WebP and under 1MB (${fileSizeInMB.toFixed(2)}MB), skipping conversion`);
            return { path: inputPath, converted: false };
        }
        
        // UPDATE: Determine quality based on original file size for better compression
        let quality = 80; // Default quality
        if (fileSizeInMB > 2) quality = 60;
        if (fileSizeInMB > 5) quality = 50;
        if (fileSizeInMB > 10) quality = 40;
        
        console.log(`Converting image to WebP (size: ${fileSizeInMB.toFixed(2)}MB, quality: ${quality})`);
        
        await sharp(inputPath)
            .resize({ 
                width: 1200, 
                height: 1200, 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .webp({ quality }) // Adjust quality based on file size
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
        // UPDATE: First convert to WebP
        const conversionResult = await convertToWebP(file.path);
        
        // If conversion happened, delete the original file
        if (conversionResult.converted) {
            await fs.unlink(conversionResult.originalPath);
            
            // Update the file object to reflect the new path
            file.path = conversionResult.path;
            file.filename = path.basename(conversionResult.path);
            file.mimetype = 'image/webp';
        }
        
        // UPDATE: Check file size after conversion
        const finalPath = conversionResult.path;
        const stats = await fs.promises.stat(finalPath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        // UPDATE: If still over 1MB, resize further
        if (fileSizeInMB > 1) {
            console.log(`WebP image still too large (${fileSizeInMB.toFixed(2)}MB), reducing quality further`);
            
            // Calculate a lower quality based on how far over the limit we are
            const quality = Math.max(30, Math.min(60, Math.floor(100 / (fileSizeInMB * 1.5))));
            
            // Create a temporary path for the further optimized image
            const parsedPath = path.parse(finalPath);
            const optimizedPath = path.join(parsedPath.dir, `${parsedPath.name}_optimized.webp`);
            
            // Use sharp to optimize further
            await sharp(finalPath)
                .resize({ 
                    width: 1000, // Further reduce dimensions
                    height: 1000, 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .webp({ quality }) // Lower quality
                .toFile(optimizedPath);
            
            // Delete the original WebP file and replace with the optimized one
            await fs.unlink(finalPath);
            await fs.rename(optimizedPath, finalPath);
            
            // Verify final size
            const finalStats = await fs.promises.stat(finalPath);
            const finalSizeInMB = finalStats.size / (1024 * 1024);
            console.log(`Final optimized image size: ${finalSizeInMB.toFixed(2)}MB`);
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