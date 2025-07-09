import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const convertToWebP = async (inputPath) => {
    try {
        const parsedPath = path.parse(inputPath);
        
        // Get file stats to check size
        const stats = await fs.promises.stat(inputPath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        //update: Check if file is already WebP and under 1MB
        if (parsedPath.ext.toLowerCase() === '.webp' && fileSizeInMB <= 1) {
            console.log(`File is already WebP and under 1MB (${fileSizeInMB.toFixed(2)}MB), no conversion needed`);
            return {
                path: inputPath,
                converted: false,
                originalPath: inputPath,
                finalSize: fileSizeInMB
            };
        }
        
        //update: Create a different output path if input is already WebP
        let outputPath;
        if (parsedPath.ext.toLowerCase() === '.webp') {
            // If already WebP, we'll create a temporary file with _compressed suffix
            outputPath = path.join(parsedPath.dir, `${parsedPath.name}_compressed.webp`);
        } else {
            // If not WebP, use the standard naming
            outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
        }
        
        console.log(`Converting/compressing image (original size: ${fileSizeInMB.toFixed(2)}MB)`);
        
        //update: Determine initial quality based on original file size
        let quality = 80; // Default quality
        if (fileSizeInMB > 2) quality = 60;
        if (fileSizeInMB > 5) quality = 50;
        
        // First conversion attempt
        await sharp(inputPath)
            .resize({ 
                width: 1200, 
                height: 1200, 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .webp({ quality })
            .toFile(outputPath);

        // Check if the converted file is still over 1MB
        const convertedStats = await fs.promises.stat(outputPath);
        const convertedSizeInMB = convertedStats.size / (1024 * 1024);
        
        if (convertedSizeInMB > 1) {
            console.log(`First conversion resulted in ${convertedSizeInMB.toFixed(2)}MB, optimizing further...`);
            
            // Delete the first attempt
            await fs.promises.unlink(outputPath);
            
            // Try with lower quality and smaller dimensions
            let finalQuality = 40;
            let maxDimension = 1000;
            
            // Keep trying until we get under 1MB
            while (convertedSizeInMB > 1 && finalQuality >= 20) {
                try {
                    await sharp(inputPath)
                        .resize({ 
                            width: maxDimension, 
                            height: maxDimension, 
                            fit: 'inside', 
                            withoutEnlargement: true 
                        })
                        .webp({ quality: finalQuality })
                        .toFile(outputPath);
                    
                    const tempStats = await fs.promises.stat(outputPath);
                    const tempSizeInMB = tempStats.size / (1024 * 1024);
                    
                    if (tempSizeInMB <= 1) {
                        console.log(`Successfully optimized to ${tempSizeInMB.toFixed(2)}MB with quality ${finalQuality}`);
                        break;
                    } else {
                        // Delete and try again with lower quality
                        await fs.promises.unlink(outputPath);
                        finalQuality -= 10;
                        if (finalQuality < 30) {
                            maxDimension = 800; // Reduce dimensions if quality is getting too low
                        }
                    }
                } catch (innerError) {
                    console.error('Error during optimization iteration:', innerError);
                    break;
                }
            }
        }
        
        // Final size check
        const finalStats = await fs.promises.stat(outputPath);
        const finalSizeInMB = finalStats.size / (1024 * 1024);
        console.log(`Final WebP image size: ${finalSizeInMB.toFixed(2)}MB`);

        //update: If we created a compressed version of a WebP file, replace the original
        if (parsedPath.ext.toLowerCase() === '.webp' && outputPath.includes('_compressed')) {
            // Delete the original and rename the compressed version
            await fs.promises.unlink(inputPath);
            const finalPath = inputPath; // Keep the original path
            await fs.promises.rename(outputPath, finalPath);
            
            return {
                path: finalPath,
                converted: true,
                originalPath: inputPath,
                finalSize: finalSizeInMB
            };
        }

        return {
            path: outputPath,
            converted: true,
            originalPath: inputPath,
            finalSize: finalSizeInMB
        };
    } catch (error) {
        throw new Error(`Error converting image to WebP: ${error.message}`);
    }
};

export const processUploadedImage = async (file) => {
    try {
        //update: Always convert to WebP
        const conversionResult = await convertToWebP(file.path);
        
        // Delete the original file if conversion happened
        if (conversionResult.converted && conversionResult.originalPath !== conversionResult.path) {
            await fs.promises.unlink(conversionResult.originalPath);
            console.log('Original file deleted after conversion');
        }
        
        // Update the file object to reflect the new path
        file.path = conversionResult.path;
        file.filename = path.basename(conversionResult.path);
        file.mimetype = 'image/webp';
        
        //update: Verify final size is under 1MB
        if (conversionResult.finalSize > 1) {
            console.warn(`Warning: Final image size is ${conversionResult.finalSize.toFixed(2)}MB, which exceeds the 1MB limit`);
        }
        
        return file;
    } catch (error) {
        // Cleanup in case of error
        try {
            if (file.path) {
                await fs.promises.unlink(file.path);
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
        throw error;
    }
};