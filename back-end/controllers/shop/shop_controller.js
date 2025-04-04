import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";
import productController from "../product/product_controller.js";
import packageController from "../package/package_controller.js"; // ✨ UPDATE: Added import for package controller
import product_model from "../../models/product_model.js";
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyDirectory(src, dest) {
    // Create destination directory
    await fs.mkdir(dest, { recursive: true });
    
    // Read source directory
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively copy directories
            await copyDirectory(srcPath, destPath);
        } else {
            // Copy files
            await fs.copyFile(srcPath, destPath);
            // Set proper file permissions
            await fs.chmod(destPath, 0o644);
        }
    }
    
    // Set proper directory permissions
    await fs.chmod(dest, 0o755);
}

async function removeDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await removeDirectory(fullPath);
        } else {
            await fs.unlink(fullPath);
        }
    }
    
    await fs.rmdir(dir);
}

async function handleDirectoryRename(oldPath, newPath) {
    try {
        console.log(`Attempting to rename directory from ${oldPath} to ${newPath}`);
        
        // Check if old directory exists
        const oldDirExists = await fs.access(oldPath)
            .then(() => true)
            .catch(() => false);
            
        if (!oldDirExists) {
            console.warn(`Old directory not found: ${oldPath}`);
            return;
        }

        // Create parent directories if they don't exist
        await fs.mkdir(path.dirname(newPath), { recursive: true });

        try {
            // Try direct rename first
            await fs.rename(oldPath, newPath);
            console.log('Direct rename successful');
        } catch (renameErr) {
            console.log('Direct rename failed, falling back to copy and delete:', renameErr);
            
            // Copy directory contents
            await copyDirectory(oldPath, newPath);
            
            // Remove old directory after successful copy
            await removeDirectory(oldPath);
            
            console.log('Copy and delete completed successfully');
        }
    } catch (err) {
        console.error('File system operation failed:', err);
        throw new Error(`Failed to update directory structure: ${err.message}`);
    }
}

async function updateProductImagePaths(oldShopName, newShopName, transaction) {
    try {
        const products = await product_model.findAll({
            where: { 
                image_product: {
                    [Op.like]: `%/shops/${oldShopName}/%`
                }
            },
            transaction
        });

        for (const product of products) {
            const newImagePath = product.image_product.replace(
                `/shops/${oldShopName}/`,
                `/shops/${newShopName}/`
            );
            await product.update({ 
                image_product: newImagePath 
            }, { transaction });
        }

        return { success: true };
    } catch (err) {
        console.error("Error updating product image paths:", err);
        throw err;
    }
}

async function removeShopFolders(shopName) {
    try {
        // Go up to the project root (three levels up from the controller)
        const baseDir = path.resolve(__dirname, '..', '..', '..', 'public', 'images', 'uploads');
        const shopImagesPath = path.join(baseDir, 'shops', shopName);
        const productImagesPath = path.join(baseDir, 'products', shopName);

        // Check and remove shop images directory
        try {
            await fs.access(shopImagesPath);
            await fs.rm(shopImagesPath, { recursive: true, force: true });
            console.log(`Removed shop images directory: ${shopImagesPath}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            console.log(`Shop images directory does not exist: ${shopImagesPath}`);
        }

        // Check and remove product images directory
        try {
            await fs.access(productImagesPath);
            await fs.rm(productImagesPath, { recursive: true, force: true });
            console.log(`Removed product images directory: ${productImagesPath}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            console.log(`Product images directory does not exist: ${productImagesPath}`);
        }

        return { success: true };
    } catch (err) {
        console.error("Error removing shop folders:", err);
        throw err;
    }
}


// **********

async function getAll() {
    try {
        const shops = await shop_model.findAll();

        if (!shops || shops.length === 0) {
            return { error: "No hay comercios registrados", data: [] };
        }

        console.log("-> shop_controller.js - getAll() - comercios encontrados = ", shops);

        return { data: shops };
    } catch (err) {
        console.error("-> shop_controller.js - getAll() -Error = ", err);
        return { error: "Error al obtener todos los comercios" };
    }
}

async function create(shopData) {
    try {
        // Check if user already exists by name
        console.log('-> shop_controller.js - create() - Buscando shopData.name_shop en la DB = ', shopData.name_shop);

        const existingShop = await shop_model.findOne({ 
            where: { name_shop: shopData.name_shop } 
        });

        if (existingShop) {
            console.error("Ya existe una comercio con ese nombre");
            return { 
                error: "Ya existe una comercio con ese nombre"
            };
        }

        // Format time fields and include new fields with defaults if not provided
        const formattedData = {
            ...shopData,
            morning_open: shopData.morning_open || null,
            morning_close: shopData.morning_close || null,
            afternoon_open: shopData.afternoon_open || null,
            afternoon_close: shopData.afternoon_close || null,
            // UPDATE: Added delivery service field with default if not provided
            has_delivery: shopData.has_delivery !== undefined ? shopData.has_delivery : false,
            // UPDATE: Added days of week fields with defaults if not provided
            open_monday: shopData.open_monday !== undefined ? shopData.open_monday : true,
            open_tuesday: shopData.open_tuesday !== undefined ? shopData.open_tuesday : true,
            open_wednesday: shopData.open_wednesday !== undefined ? shopData.open_wednesday : true,
            open_thursday: shopData.open_thursday !== undefined ? shopData.open_thursday : true,
            open_friday: shopData.open_friday !== undefined ? shopData.open_friday : true,
            open_saturday: shopData.open_saturday !== undefined ? shopData.open_saturday : true,
            open_sunday: shopData.open_sunday !== undefined ? shopData.open_sunday : false
        };

        // If no existing shop, proceed with creation
        const shop = await shop_model.create(formattedData);
        
        return { 
            success: "¡Comercio creado!",
            data: shop
           
        };
    } catch (err) {
        console.error("-> shop_controller.js - create() - Error al crear el comercio =", err);
        return { error: "Error al crear el comercio." };
    }
}

async function getByType(shopType) {
    try {
        const shops = await shop_model.findAll({ 
            where: { type_shop: shopType }
        });

        if (shops.length === 0) {
            console.warn(`No hay comercios registrados de tipo =  ${shopType}`);
            return { error: "No hay comercios registrados de este tipo" }
             }

        return { data: shops };
    
    } catch (err) {
        console.error("-> shop_controller.js - getByType() - Error = ", err);
        return { error: "Error al obtener los comercios por tipo" };
    }
}

async function update(id, shopData) {
    try {
        console.log('Received shop data for update:', shopData);
        
        const shop = await shop_model.findByPk(id);
        
        if (!shop) {
            console.log("shop not found with id:", id);
            return { error: "shop not found" };
        }

        console.log('Current shop data:', shop.toJSON());

        // Create update data object including new fields
        const updateData = {
            name_shop: shopData.name_shop,
            location_shop: shopData.location_shop,
            type_shop: shopData.type_shop,
            subtype_shop: shopData.subtype_shop,
            calification_shop: shopData.calification_shop,
            image_shop: shopData.image_shop,
            id_user: shopData.id_user,
            morning_open: shopData.morning_open,
            morning_close: shopData.morning_close,
            afternoon_open: shopData.afternoon_open,
            afternoon_close: shopData.afternoon_close,
            // UPDATE: Added delivery field
            has_delivery: shopData.has_delivery !== undefined ? shopData.has_delivery : shop.has_delivery,
            // UPDATE: Added days of week fields
            open_monday: shopData.open_monday !== undefined ? shopData.open_monday : shop.open_monday,
            open_tuesday: shopData.open_tuesday !== undefined ? shopData.open_tuesday : shop.open_tuesday,
            open_wednesday: shopData.open_wednesday !== undefined ? shopData.open_wednesday : shop.open_wednesday,
            open_thursday: shopData.open_thursday !== undefined ? shopData.open_thursday : shop.open_thursday,
            open_friday: shopData.open_friday !== undefined ? shopData.open_friday : shop.open_friday,
            open_saturday: shopData.open_saturday !== undefined ? shopData.open_saturday : shop.open_saturday,
            open_sunday: shopData.open_sunday !== undefined ? shopData.open_sunday : shop.open_sunday
        };

        console.log('Update data being applied:', updateData);

        // Use the update method
        await shop.update(updateData);
        
        // Fetch fresh instance
        const updatedShop = await shop_model.findByPk(id);
        console.log('Shop after update:', updatedShop.toJSON());
        
        return { data: updatedShop };
    } catch (err) {
        console.error("Error al actualizar el comercio =", err);
        console.error("Error details:", err.stack);
        return { error: "Error al actualizar el comercio" };
    }
}

// UPDATE: Reimplemented updateWithFolder function to properly handle folder renaming and image paths
async function updateWithFolder(id, shopData) {
    const transaction = await shop_model.sequelize.transaction();
    
    try {
        console.log('Starting updateWithFolder operation:', { id, shopData });
        
        const shop = await shop_model.findByPk(id, { transaction });
        
        if (!shop) {
            await transaction.rollback();
            return { error: "Shop not found" };
        }

        const oldShopName = shopData.old_name_shop;
        const newShopName = shopData.name_shop;
        
        // Check if name actually changed
        if (oldShopName !== newShopName) {
            console.log(`Shop name changed from "${oldShopName}" to "${newShopName}"`);
            
            // Update image paths in database for this shop
            if (shop.image_shop && shop.image_shop.includes(oldShopName)) {
                shop.image_shop = shop.image_shop.replace(
                    `/shops/${oldShopName}/`, 
                    `/shops/${newShopName}/`
                );
                console.log(`Updated shop image path to: ${shop.image_shop}`);
            }
            
            // Update product image paths that reference this shop
            await updateProductImagePaths(oldShopName, newShopName, transaction);
            
            // Handle folder renaming
            try {
                // Define paths for both shop images and product images
                const basePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', 'uploads');
                
                // Shop images folder
                const oldShopImagesPath = path.join(basePath, 'shops', oldShopName);
                const newShopImagesPath = path.join(basePath, 'shops', newShopName);
                
                // Product images folder
                const oldProductImagesPath = path.join(basePath, 'products', oldShopName);
                const newProductImagesPath = path.join(basePath, 'products', newShopName);
                
                // Check and rename shop images folder
                const shopFolderExists = await fs.access(oldShopImagesPath)
                    .then(() => true)
                    .catch(() => false);
                    
                if (shopFolderExists) {
                    console.log(`Renaming shop images folder from ${oldShopImagesPath} to ${newShopImagesPath}`);
                    await handleDirectoryRename(oldShopImagesPath, newShopImagesPath);
                }
                
                // Check and rename product images folder
                const productFolderExists = await fs.access(oldProductImagesPath)
                    .then(() => true)
                    .catch(() => false);
                    
                if (productFolderExists) {
                    console.log(`Renaming product images folder from ${oldProductImagesPath} to ${newProductImagesPath}`);
                    await handleDirectoryRename(oldProductImagesPath, newProductImagesPath);
                }
            } catch (fsError) {
                console.error('File system operation failed:', fsError);
                // Continue with database update even if folder operations fail
                console.warn('Continuing with database update despite file system error');
            }
        }

        // Update shop data including schedule fields and new fields
        const updateData = { 
            ...shopData,
            morning_open: shopData.morning_open || shop.morning_open,
            morning_close: shopData.morning_close || shop.morning_close,
            afternoon_open: shopData.afternoon_open || shop.afternoon_open,
            afternoon_close: shopData.afternoon_close || shop.afternoon_close,
            // UPDATE: Added delivery field
            has_delivery: shopData.has_delivery !== undefined ? shopData.has_delivery : shop.has_delivery,
            // UPDATE: Added days of week fields
            open_monday: shopData.open_monday !== undefined ? shopData.open_monday : shop.open_monday,
            open_tuesday: shopData.open_tuesday !== undefined ? shopData.open_tuesday : shop.open_tuesday,
            open_wednesday: shopData.open_wednesday !== undefined ? shopData.open_wednesday : shop.open_wednesday,
            open_thursday: shopData.open_thursday !== undefined ? shopData.open_thursday : shop.open_thursday,
            open_friday: shopData.open_friday !== undefined ? shopData.open_friday : shop.open_friday,
            open_saturday: shopData.open_saturday !== undefined ? shopData.open_saturday : shop.open_saturday,
            open_sunday: shopData.open_sunday !== undefined ? shopData.open_sunday : shop.open_sunday
        };
        delete updateData.old_name_shop;
        
        await shop.update(updateData, { transaction });

        await transaction.commit();
        console.log('Transaction committed successfully');
        
        return { 
            data: shop,
            message: "Shop updated successfully with folder structure and image paths" 
        };
    } catch (err) {
        if (transaction) {
            await transaction.rollback();
            console.log('Transaction rolled back due to error');
        }
        console.error("Error updating shop with folder:", err);
        return { 
            error: "Error updating shop and associated data",
            details: err.message 
        };
    }
}

async function getByUserId(id) {
    try {
        const shops = await shop_model.findAll({ 
            where: { id_user: id }
        }); 

        console.log(`-> shop_controller.js - getByUserId() - Retrieved shops for user ${id}:`, shops);
        
        if (shops.length === 0) {
            console.log(`-> shop_controller.js - getByUserId() - No shops found for user ID: ${id}`);
            return { error: "No tienes comercios registrados" };
        }
        return { data: shops };
    } catch (err) {
        console.error("-> shop_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener los comercios" };
    }
}

async function removeById(id_shop) {
    try {
        if (!id_shop) {
            return { error: "comercio no encontrado" };
        }

        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { 
                error: "comercio no encontrado",
            };
        }
   
        await shop.destroy();

      return { 
        data:  id_shop,
        message: "El comercio se ha borrado ." 
        };
    } catch (err) {
      console.error("-> shop_controller.js - removeById() - Error = ", err);
      return { error: "Error al borrar el comercio" };
    }
}

async function removeByIdWithProducts(id_shop) {
    try {
        if (!id_shop) {
            return { error: "ID de comercio no proporcionado" };
        }

        // First check if the shop exists
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { 
                error: "Comercio no encontrado"
            };
        }

        const transaction = await shop_model.sequelize.transaction();

        try {
            // ✨ UPDATE: First remove all packages using the package controller
            const packageResult = await packageController.removeByShopId(id_shop, transaction);
            
            if (packageResult.error) {
                await transaction.rollback();
                return { error: packageResult.error };
            }

            // Then remove all products using the product controller
            const productResult = await productController.removeByShopId(id_shop, transaction);
            
            if (productResult.error) {
                await transaction.rollback();
                return { error: productResult.error };
            }

            // Remove the image folders before deleting the shop record
            await removeShopFolders(shop.name_shop);

            // Then remove the shop
            await shop.destroy({ transaction });

            // If we get here, commit the transaction
            await transaction.commit();

            return { 
                data: id_shop,
                message: "El comercio, sus productos, paquetes y archivos se han borrado .", // ✨ UPDATE: Added packages to success message
                productsRemoved: productResult.count,
                packagesRemoved: packageResult.count // ✨ UPDATE: Added packages count to response
            };

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("-> shop_controller.js - removeByIdWithProducts() - Error = ", err);
        return { 
            error: "Error al borrar el comercio y sus productos",
            details: err.message
        };
    }
}

async function getTypesOfShops() {
    try {
      const shopTypes = await shop_model.findAll({
        attributes: ['type_shop'],
        group: ['type_shop'],
      });
      return { data: shopTypes.map((type) => type.type_shop) };
    } catch (err) {
      console.error('Error al obtener todos los tipos de comercios', err);
      return { error: 'Error al obtener todos los tipos de comercios' };
    }
}

export { 
    getAll, 
    create, 
    update, 
    removeById, 
    removeByIdWithProducts,
    getByType, 
    getByUserId, 
    getTypesOfShops,
    updateWithFolder 
}

export default { 
    getAll, 
    create, 
    update, 
    removeById,
    removeByIdWithProducts, 
    getByType, 
    getByUserId, 
    getTypesOfShops,
    updateWithFolder 
}