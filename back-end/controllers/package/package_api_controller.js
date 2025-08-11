// back-end/controllers/package/package_api_controller.js
import packageController from "./package_controller.js";
import package_model from "../../models/package_model.js";
import shop_model from "../../models/shop_model.js";
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAll(req, res) {
    try {
        const {error, data, success} = await packageController.getAll();
        res.json({error, data, success});
    } catch (err) {
        console.error("-> package_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los paquetes", 
            data: null
        });
    }
}

async function create(req, res) {
    try {
        const {
            id_shop,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            discount_package,
            image_package
        } = req.body;

        // Validate required fields
        if (!id_shop || !id_product1) {
            return res.status(400).json({
                error: "El ID del comercio y al menos un producto son obligatorios"
            });
        }

        const {error, data, success} = await packageController.create({
            id_shop,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            discount_package,
            image_package
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.status(201).json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - create() - Error =", err);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            error: "Error al crear un paquete",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_package,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            active_package,
            discount_package,
            image_package
        } = req.body;

        if (!id_package) {
            return res.status(400).json({
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.update(
            id_package, 
            {
                id_product1,
                id_product2,
                id_product3,
                id_product4,
                id_product5,
                name_package,
                active_package,
                discount_package,
                image_package
            }
        );   

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({
            error,
            data,
            success
        }); 
    } catch (err) {
        console.error("-> package_api_controller.js - update() - Error =", err);
        res.status(500).json({ 
            error: "Error al actualizar el paquete", 
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_package } = req.params;

        if (!id_package) {
            return res.status(400).json({ 
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.getById(id_package);

        if (error) {
            return res.status(404).json({ error });
        }

        res.json({
            error,
            data,
            success
        });
    } catch (err) {
        console.error("-> package_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el paquete", 
            details: err.message
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({ 
                error: "El ID del comercio es obligatorio"
            });
        }

        const {error, data, success} = await packageController.getByShopId(id_shop);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los paquetes del comercio", 
            details: err.message
        });
    }
}

async function getActiveByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({
                error: "El ID del comercio es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.getActiveByShopId(id_shop);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - getActiveByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener los paquetes activos del comercio",
            details: err.message
        });
    }
}

async function getInactiveByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({
                error: "El ID del comercio es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.getInactiveByShopId(id_shop);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - getInactiveByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener los paquetes inactivos del comercio",
            details: err.message
        });
    }
}

async function toggleActiveStatus(req, res) {
    try {
        const { id_package } = req.params;
        
        if (!id_package) {
            return res.status(400).json({
                error: "El ID del paquete es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.toggleActiveStatus(id_package);
        
        if (error) {
            return res.status(404).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - toggleActiveStatus() - Error =", err);
        res.status(500).json({
            error: "Error al cambiar el estado del paquete",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_package } = req.params;
        
        if (!id_package) {
            return res.status(400).json({ 
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.removeById(id_package);
        
        if (error) {
            return res.status(404).json({ error });
        }
        
        res.json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el paquete", 
            details: err.message
        });
    }
}

//update: Enhanced function to handle package image upload with WebP conversion
async function uploadPackageImage(req, res) {
    try {
        console.log('Package image upload endpoint called');
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        if (!req.file) {
            return res.status(400).json({
                error: "No se ha proporcionado ninguna imagen"
            });
        }

        const shopId = req.headers['x-shop-id'];
        let packageId = req.headers['x-package-id'];
        
        if (!shopId) {
            // Clean up uploaded file
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err);
            }
            
            return res.status(400).json({
                error: "El ID del comercio es obligatorio"
            });
        }

        // Get shop information
        const shop = await shop_model.findByPk(shopId);
        if (!shop) {
            // Clean up uploaded file
            try {
                await fs.unlink(req.file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err);
            }
            
            return res.status(404).json({
                error: "Comercio no encontrado"
            });
        }

        // Build relative path to the image
        // The file has already been processed to WebP by the middleware
        const relativePath = path.join(
            'images',
            'uploads',
            'shops',
            shop.name_shop,
            'package_images',
            req.file.filename
        ).replace(/\\/g, '/'); // Convert Windows-style paths to URL-style paths
        
        console.log('Package image uploaded and processed successfully:', {
            filename: req.file.filename,
            relativePath: relativePath,
            packageId: packageId,
            size: Math.round(req.file.size / 1024) + 'KB'
        });

        // If packageId is provided, update the package with the image path
        if (packageId) {
            const updateResult = await packageController.updatePackageImage(packageId, relativePath);
            
            if (updateResult.error) {
                // Don't delete the file, it might be used later
                console.error('Failed to update package with image:', updateResult.error);
            }
        }
        
        // Always return success with the image path
        // The frontend will handle associating it with the package
        res.json({
            error: null,
            data: {
                image_package: relativePath,
                id_package: packageId || null,
                filename: req.file.filename
            },
            success: "Imagen del paquete subida con éxito"
        });
    } catch (err) {
        console.error("-> package_api_controller.js - uploadPackageImage() - Error =", err);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        res.status(500).json({
            error: "Error al subir la imagen del paquete",
            details: err.message
        });
    }
}

//update: Function to rename package image after package creation (for new packages)
async function renamePackageImage(req, res) {
    try {
        const { packageId, tempFilename, shopName } = req.body;
        
        if (!packageId || !tempFilename || !shopName) {
            return res.status(400).json({
                error: "Faltan parámetros requeridos"
            });
        }
        
        const oldPath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
            'uploads',
            'shops',
            shopName,
            'package_images',
            tempFilename
        );
        
        const newFilename = `package_${packageId}.webp`;
        const newPath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
            'uploads',
            'shops',
            shopName,
            'package_images',
            newFilename
        );
        
        // Check if old file exists
        try {
            await fs.access(oldPath);
        } catch (err) {
            return res.status(404).json({
                error: "Archivo temporal no encontrado"
            });
        }
        
        // Delete any existing file with the new name
        try {
            await fs.unlink(newPath);
        } catch (err) {
            // File doesn't exist, which is fine
        }
        
        // Rename the file
        await fs.rename(oldPath, newPath);
        
        // Build new relative path
        const relativePath = path.join(
            'images',
            'uploads',
            'shops',
            shopName,
            'package_images',
            newFilename
        ).replace(/\\/g, '/'); // Convert Windows-style paths to URL-style paths
        
        // Update package with new image path
        const updateResult = await packageController.updatePackageImage(packageId, relativePath);
        
        if (updateResult.error) {
            return res.status(400).json({
                error: updateResult.error
            });
        }
        
        res.json({
            error: null,
            data: {
                image_package: relativePath,
                id_package: packageId
            },
            success: "Imagen del paquete actualizada con éxito"
        });
    } catch (err) {
        console.error("-> package_api_controller.js - renamePackageImage() - Error =", err);
        res.status(500).json({
            error: "Error al renombrar la imagen del paquete",
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus,
    uploadPackageImage,
    renamePackageImage
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus,
    uploadPackageImage,
    renamePackageImage
}