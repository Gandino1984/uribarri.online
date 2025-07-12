import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";
import type_model from "../../models/type_model.js";
import subtype_model from "../../models/subtype_model.js";
import product_model from "../../models/product_model.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//update: Define __filename and __dirname at module level
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//update: Function to validate type and subtype combination
async function validateTypeSubtypeCombination(id_type, id_subtype) {
    try {
        // Check if type exists and is active
        const type = await type_model.findOne({
            where: {
                id_type: id_type,
                verified_type: true
            }
        });
        
        if (!type) {
            return {
                isValid: false,
                error: "El tipo seleccionado no existe o no está activo"
            };
        }
        
        // Check if subtype exists, is active, AND belongs to the selected type
        const subtype = await subtype_model.findOne({
            where: {
                id_subtype: id_subtype,
                id_type: id_type, // This ensures the subtype belongs to the type
                verified_subtype: true
            }
        });
        
        if (!subtype) {
            return {
                isValid: false,
                error: "El subtipo seleccionado no existe, no está activo, o no pertenece al tipo seleccionado"
            };
        }
        
        return {
            isValid: true,
            type: type,
            subtype: subtype
        };
    } catch (err) {
        console.error("Error validating type/subtype combination:", err);
        return {
            isValid: false,
            error: "Error al validar la combinación de tipo y subtipo"
        };
    }
}

//update: Function to validate user exists and is a seller
async function validateUser(id_user) {
    try {
        const user = await user_model.findOne({
            where: {
                id_user: id_user,
                type_user: 'seller'
            }
        });
        
        if (!user) {
            return {
                isValid: false,
                error: "El usuario no existe o no es un vendedor"
            };
        }
        
        return {
            isValid: true,
            user: user
        };
    } catch (err) {
        console.error("Error validating user:", err);
        return {
            isValid: false,
            error: "Error al validar el usuario"
        };
    }
}

async function getAll() {
    try {
        const shops = await shop_model.findAll();

        if (!shops || shops.length === 0) {
            return { error: "No hay comercios registrados" };
        }

        //update: Fetch type and subtype information for each shop
        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await type_model.findByPk(shop.id_type);
            const subtype = await subtype_model.findByPk(shop.id_subtype);
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                //update: Add type_shop and subtype_shop as direct properties
                type_shop: type ? type.name_type : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype: subtype ? {
                    id_subtype: subtype.id_subtype,
                    name_subtype: subtype.name_subtype
                } : null
            });
        }

        console.log("-> shop_controller.js - getAll() - comercios encontrados = ", shopsWithTypeInfo.length);

        return { data: shopsWithTypeInfo };
    } catch (err) {
        console.error("-> shop_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los comercios" };
    }
}

async function getByType(id_type, id_subtype) {
    try {
        if (!id_type) {
            return { error: "El tipo es obligatorio" };
        }

        //update: Validate that the type exists and is active
        const typeValidation = await type_model.findOne({
            where: {
                id_type: id_type,
                verified_type: true
            }
        });
        
        if (!typeValidation) {
            return { error: "El tipo especificado no existe o no está activo" };
        }

        let whereCondition = { id_type: id_type };

        if (id_subtype) {
            //update: Validate subtype if provided
            const subtypeValidation = await subtype_model.findOne({
                where: {
                    id_subtype: id_subtype,
                    id_type: id_type,
                    verified_subtype: true
                }
            });
            
            if (!subtypeValidation) {
                return { error: "El subtipo especificado no existe, no está activo, o no pertenece al tipo seleccionado" };
            }
            
            whereCondition.id_subtype = id_subtype;
        }

        const shops = await shop_model.findAll({
            where: whereCondition
        });

        if (!shops || shops.length === 0) {
            return { 
                error: id_subtype 
                    ? "No hay comercios registrados para este tipo y subtipo" 
                    : "No hay comercios registrados para este tipo"
            };
        }

        //update: Include type and subtype information
        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await type_model.findByPk(shop.id_type);
            const subtype = await subtype_model.findByPk(shop.id_subtype);
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                //update: Add type_shop and subtype_shop as direct properties
                type_shop: type ? type.name_type : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype: subtype ? {
                    id_subtype: subtype.id_subtype,
                    name_subtype: subtype.name_subtype
                } : null
            });
        }

        console.log("-> shop_controller.js - getByType() - comercios encontrados = ", shopsWithTypeInfo.length);

        return { data: shopsWithTypeInfo };
    } catch (err) {
        console.error("-> shop_controller.js - getByType() - Error = ", err);
        return { error: "Error al obtener comercios por tipo" };
    }
}

async function getById(id_shop) {
    try {
        const shop = await shop_model.findByPk(id_shop);

        if (!shop) {
            return { error: "Comercio no encontrado" };
        }

        //update: Include type and subtype information
        const type = await type_model.findByPk(shop.id_type);
        const subtype = await subtype_model.findByPk(shop.id_subtype);
        
        const shopWithTypeInfo = {
            ...shop.toJSON(),
            //update: Add type_shop and subtype_shop as direct properties
            type_shop: type ? type.name_type : null,
            subtype_shop: subtype ? subtype.name_subtype : null,
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null,
            subtype: subtype ? {
                id_subtype: subtype.id_subtype,
                name_subtype: subtype.name_subtype
            } : null
        };

        return { data: shopWithTypeInfo };
    } catch (err) {
        console.error("-> shop_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el comercio" };
    }
}

async function getByUserId(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID del usuario es obligatorio" };
        }

        //update: Validate user exists and is a seller
        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const shops = await shop_model.findAll({
            where: { id_user: id_user }
        });

        if (!shops || shops.length === 0) {
            return { error: "No hay comercios registrados para este usuario", data: [] };
        }

        //update: Include type and subtype information for each shop
        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await type_model.findByPk(shop.id_type);
            const subtype = await subtype_model.findByPk(shop.id_subtype);
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                //update: Add type_shop and subtype_shop as direct properties
                type_shop: type ? type.name_type : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype: subtype ? {
                    id_subtype: subtype.id_subtype,
                    name_subtype: subtype.name_subtype
                } : null
            });
        }

        console.log("-> shop_controller.js - getByUserId() - comercios encontrados = ", shopsWithTypeInfo.length);

        return { data: shopsWithTypeInfo };
    } catch (err) {
        console.error("-> shop_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener comercios por usuario" };
    }
}

async function create(shopData) {
    try {
        // Check if shop already exists by name
        const existingShop = await shop_model.findOne({ 
            where: { name_shop: shopData.name_shop } 
        });

        if (existingShop) {
            console.error("Ya existe una comercio con ese nombre");
            return { 
                error: "Ya existe una comercio con ese nombre"
            };
        }

        //update: Validate user exists and is a seller
        const userValidation = await validateUser(shopData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        //update: Validate type and subtype combination
        const typeSubtypeValidation = await validateTypeSubtypeCombination(
            shopData.id_type, 
            shopData.id_subtype
        );
        
        if (!typeSubtypeValidation.isValid) {
            return { error: typeSubtypeValidation.error };
        }

        // Create the shop with the validated data
        const shop = await shop_model.create(shopData);
        
        //update: Return shop with type and subtype information
        const shopWithTypeInfo = {
            ...shop.toJSON(),
            //update: Add type_shop and subtype_shop as direct properties
            type_shop: typeSubtypeValidation.type.name_type,
            subtype_shop: typeSubtypeValidation.subtype.name_subtype,
            type: {
                id_type: typeSubtypeValidation.type.id_type,
                name_type: typeSubtypeValidation.type.name_type
            },
            subtype: {
                id_subtype: typeSubtypeValidation.subtype.id_subtype,
                name_subtype: typeSubtypeValidation.subtype.name_subtype
            }
        };
        
        return { 
            success: "¡Comercio creado!",
            data: shopWithTypeInfo
        };
    } catch (err) {
        console.error("-> shop_controller.js - create() - Error al crear el comercio =", err);
        return { error: "Error al crear el comercio." };
    }
}

async function update(id, shopData) {
    try {
        const shop = await shop_model.findByPk(id);
        
        if (!shop) {
            console.log("Comercio no encontrado con id:", id);
            return { error: "Comercio no encontrado" };
        }

        //update: If user is being changed, validate the new user
        if (shopData.id_user !== undefined && shopData.id_user !== shop.id_user) {
            const userValidation = await validateUser(shopData.id_user);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        //update: If type or subtype is being changed, validate the combination
        if (shopData.id_type !== undefined || shopData.id_subtype !== undefined) {
            const typeToValidate = shopData.id_type !== undefined ? shopData.id_type : shop.id_type;
            const subtypeToValidate = shopData.id_subtype !== undefined ? shopData.id_subtype : shop.id_subtype;
            
            const typeSubtypeValidation = await validateTypeSubtypeCombination(
                typeToValidate, 
                subtypeToValidate
            );
            
            if (!typeSubtypeValidation.isValid) {
                return { error: typeSubtypeValidation.error };
            }
        }

        await shop.update(shopData);
        
        // Fetch updated shop with type and subtype information
        const updatedShop = await shop_model.findByPk(id);
        const type = await type_model.findByPk(updatedShop.id_type);
        const subtype = await subtype_model.findByPk(updatedShop.id_subtype);
        
        const shopWithTypeInfo = {
            ...updatedShop.toJSON(),
            //update: Add type_shop and subtype_shop as direct properties
            type_shop: type ? type.name_type : null,
            subtype_shop: subtype ? subtype.name_subtype : null,
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null,
            subtype: subtype ? {
                id_subtype: subtype.id_subtype,
                name_subtype: subtype.name_subtype
            } : null
        };
        
        return { data: shopWithTypeInfo };
    } catch (err) {
        console.error("Error al actualizar el comercio =", err);
        return { error: "Error al actualizar el comercio" };
    }
}

async function updateWithFolder(id, shopData, oldName) {
    try {
        //update: Ensure __dirname is defined
        console.log('__dirname value:', __dirname);
        
        const shop = await shop_model.findByPk(id);
        
        if (!shop) {
            console.log("Comercio no encontrado con id:", id);
            return { error: "Comercio no encontrado" };
        }

        //update: If user is being changed, validate the new user
        if (shopData.id_user !== undefined && shopData.id_user !== shop.id_user) {
            const userValidation = await validateUser(shopData.id_user);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        //update: If type or subtype is being changed, validate the combination
        if (shopData.id_type !== undefined || shopData.id_subtype !== undefined) {
            const typeToValidate = shopData.id_type !== undefined ? shopData.id_type : shop.id_type;
            const subtypeToValidate = shopData.id_subtype !== undefined ? shopData.id_subtype : shop.id_subtype;
            
            const typeSubtypeValidation = await validateTypeSubtypeCombination(
                typeToValidate, 
                subtypeToValidate
            );
            
            if (!typeSubtypeValidation.isValid) {
                return { error: typeSubtypeValidation.error };
            }
        }

        // Handle folder renaming if shop name is changing
        if (shopData.name_shop && shopData.name_shop !== oldName) {
            //update: Fix the path construction issue
            const oldPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'uploads', 'shops', oldName);
            const newPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'uploads', 'shops', shopData.name_shop);
            
            console.log('Attempting to rename folder from:', oldPath, 'to:', newPath);
            
            if (fs.existsSync(oldPath)) {
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Carpeta renombrada de ${oldName} a ${shopData.name_shop}`);
                    
                    // Update image path if shop has an image
                    if (shop.image_shop) {
                        const updatedImagePath = shop.image_shop.replace(
                            `/shops/${oldName}/`,
                            `/shops/${shopData.name_shop}/`
                        );
                        shopData.image_shop = updatedImagePath;
                    }
                } catch (err) {
                    console.error("Error al renombrar la carpeta:", err);
                    return { error: "Error al renombrar la carpeta del comercio" };
                }
            }
        }

        await shop.update(shopData);
        
        // Fetch updated shop with type and subtype information
        const updatedShop = await shop_model.findByPk(id);
        const type = await type_model.findByPk(updatedShop.id_type);
        const subtype = await subtype_model.findByPk(updatedShop.id_subtype);
        
        const shopWithTypeInfo = {
            ...updatedShop.toJSON(),
            //update: Add type_shop and subtype_shop as direct properties
            type_shop: type ? type.name_type : null,
            subtype_shop: subtype ? subtype.name_subtype : null,
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null,
            subtype: subtype ? {
                id_subtype: subtype.id_subtype,
                name_subtype: subtype.name_subtype
            } : null
        };
        
        return { data: shopWithTypeInfo };
    } catch (err) {
        console.error("Error al actualizar el comercio con carpeta =", err);
        return { error: "Error al actualizar el comercio" };
    }
}

async function removeById(id_shop) {
    try {
        if (!id_shop) {
            return { error: "Comercio no encontrado" };
        }

        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { 
                error: "Comercio no encontrado",
            };
        }

        //update: Check if there are products associated with this shop
        const products = await product_model.findAll({
            where: { id_shop: id_shop }
        });
        
        if (products && products.length > 0) {
            return { 
                error: `No se puede eliminar el comercio porque tiene ${products.length} producto(s) asociados`
            };
        }

        // Delete shop folder if exists
        const shopPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'uploads', 'shops', shop.name_shop);
        
        if (fs.existsSync(shopPath)) {
            try {
                fs.rmSync(shopPath, { recursive: true, force: true });
                console.log(`Carpeta del comercio ${shop.name_shop} eliminada`);
            } catch (err) {
                console.error("Error al eliminar la carpeta del comercio:", err);
                // Continue with shop deletion even if folder deletion fails
            }
        }

        await shop.destroy();

        return { 
            data: id_shop,
            message: "El comercio se ha eliminado." 
        };
    } catch (err) {
        console.error("-> shop_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el comercio" };
    }
}

async function removeByIdWithProducts(id_shop) {
    try {
        if (!id_shop) {
            return { error: "Comercio no encontrado" };
        }

        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { 
                error: "Comercio no encontrado",
            };
        }

        // Delete all products associated with this shop
        const deletedProducts = await product_model.destroy({
            where: { id_shop: id_shop }
        });
        
        console.log(`${deletedProducts} productos eliminados del comercio ${shop.name_shop}`);

        // Delete shop folder if exists
        const shopPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'uploads', 'shops', shop.name_shop);
        
        if (fs.existsSync(shopPath)) {
            try {
                fs.rmSync(shopPath, { recursive: true, force: true });
                console.log(`Carpeta del comercio ${shop.name_shop} eliminada`);
            } catch (err) {
                console.error("Error al eliminar la carpeta del comercio:", err);
            }
        }

        await shop.destroy();

        return { 
            data: id_shop,
            message: `El comercio y sus ${deletedProducts} productos se han eliminado.`,
            deletedProducts: deletedProducts
        };
    } catch (err) {
        console.error("-> shop_controller.js - removeByIdWithProducts() - Error = ", err);
        return { error: "Error al eliminar el comercio y sus productos" };
    }
}

async function uploadCoverImage(id_shop, imagePath) {
    try {
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { error: "Comercio no encontrado" };
        }

        await shop.update({ image_shop: imagePath });
        
        return { 
            data: { 
                id_shop: id_shop,
                image_shop: imagePath 
            },
            message: "Imagen actualizada correctamente" 
        };
    } catch (err) {
        console.error("Error al actualizar imagen del comercio =", err);
        return { error: "Error al actualizar la imagen" };
    }
}

async function getTypesOfShops() {
    try {
        // Get all unique combinations of type and subtype from shops
        const shops = await shop_model.findAll({
            attributes: ['id_type', 'id_subtype'],
            group: ['id_type', 'id_subtype']
        });

        if (!shops || shops.length === 0) {
            return { error: "No hay tipos de comercios registrados", data: [] };
        }

        // Build a structure with types and their subtypes
        const typesMap = new Map();
        
        for (const shop of shops) {
            const type = await type_model.findOne({
                where: {
                    id_type: shop.id_type,
                    verified_type: true
                }
            });
            
            if (type) {
                if (!typesMap.has(type.id_type)) {
                    typesMap.set(type.id_type, {
                        id_type: type.id_type,
                        name_type: type.name_type,
                        subtypes: []
                    });
                }
                
                const subtype = await subtype_model.findOne({
                    where: {
                        id_subtype: shop.id_subtype,
                        verified_subtype: true
                    }
                });
                
                if (subtype) {
                    const typeEntry = typesMap.get(type.id_type);
                    // Check if subtype is not already in the array
                    if (!typeEntry.subtypes.find(s => s.id_subtype === subtype.id_subtype)) {
                        typeEntry.subtypes.push({
                            id_subtype: subtype.id_subtype,
                            name_subtype: subtype.name_subtype
                        });
                    }
                }
            }
        }

        const result = Array.from(typesMap.values());
        
        return { data: result };
    } catch (err) {
        console.error("Error al obtener tipos de comercios =", err);
        return { error: "Error al obtener tipos de comercios" };
    }
}

export { 
    getAll, 
    getByType, 
    getById,
    getByUserId,
    create, 
    update, 
    updateWithFolder,
    removeById,
    removeByIdWithProducts,
    uploadCoverImage,
    getTypesOfShops
}

export default { 
    getAll, 
    getByType, 
    getById,
    getByUserId,
    create, 
    update, 
    updateWithFolder,
    removeById,
    removeByIdWithProducts,
    uploadCoverImage,
    getTypesOfShops
}