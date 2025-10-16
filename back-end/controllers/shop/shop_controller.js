//update: Updated to handle shop images in back-end/assets/images/shops
import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";
import shop_type_model from "../../models/shop_type_model.js";
import shop_subtype_model from "../../models/shop_subtype_model.js";
import product_model from "../../models/product_model.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateType(id_type) {
    try {
        const type = await shop_type_model.findOne({
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
        
        return {
            isValid: true,
            type: type
        };
    } catch (err) {
        console.error("Error validating type:", err);
        return {
            isValid: false,
            error: "Error al validar el tipo"
        };
    }
}

async function validateSubtype(id_subtype, id_type) {
    try {
        const subtype = await shop_subtype_model.findOne({
            where: {
                id_subtype: id_subtype,
                id_type: id_type,
                verified_subtype: true
            }
        });
        
        if (!subtype) {
            return {
                isValid: false,
                error: "El subtipo seleccionado no existe o no pertenece al tipo seleccionado"
            };
        }
        
        return {
            isValid: true,
            subtype: subtype
        };
    } catch (err) {
        console.error("Error validating subtype:", err);
        return {
            isValid: false,
            error: "Error al validar el subtipo"
        };
    }
}

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

async function getSubtypesByType(id_type) {
    try {
        const subtypes = await shop_subtype_model.findAll({
            where: {
                id_type: id_type,
                verified_subtype: true
            }
        });
        
        return subtypes.map(subtype => ({
            id_subtype: subtype.id_subtype,
            name_subtype: subtype.name_subtype
        }));
    } catch (err) {
        console.error("Error getting subtypes:", err);
        return [];
    }
}

async function getAll() {
    try {
        const shops = await shop_model.findAll();

        if (!shops || shops.length === 0) {
            return { error: "No hay comercios registrados" };
        }

        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await shop_type_model.findByPk(shop.id_type);
            const subtype = shop.id_subtype ? await shop_subtype_model.findByPk(shop.id_subtype) : null;
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                type_shop: type ? type.name_type : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
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

async function getByType(id_type) {
    try {
        if (!id_type) {
            return { error: "El tipo es obligatorio" };
        }

        const typeValidation = await validateType(id_type);
        
        if (!typeValidation.isValid) {
            return { error: typeValidation.error };
        }

        const shops = await shop_model.findAll({
            where: { id_type: id_type }
        });

        if (!shops || shops.length === 0) {
            return { 
                error: "No hay comercios registrados para este tipo"
            };
        }

        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await shop_type_model.findByPk(shop.id_type);
            const subtype = shop.id_subtype ? await shop_subtype_model.findByPk(shop.id_subtype) : null;
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                type_shop: type ? type.name_type : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
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

        const type = await shop_type_model.findByPk(shop.id_type);
        const subtype = shop.id_subtype ? await shop_subtype_model.findByPk(shop.id_subtype) : null;
        
        const shopWithTypeInfo = {
            ...shop.toJSON(),
            type_shop: type ? type.name_type : null,
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null,
            subtype_shop: subtype ? subtype.name_subtype : null,
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

        const shopsWithTypeInfo = [];
        for (const shop of shops) {
            const type = await shop_type_model.findByPk(shop.id_type);
            const subtype = shop.id_subtype ? await shop_subtype_model.findByPk(shop.id_subtype) : null;
            
            shopsWithTypeInfo.push({
                ...shop.toJSON(),
                type_shop: type ? type.name_type : null,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                subtype_shop: subtype ? subtype.name_subtype : null,
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

        const userValidation = await validateUser(shopData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const typeValidation = await validateType(shopData.id_type);
        
        if (!typeValidation.isValid) {
            return { error: typeValidation.error };
        }

        let subtypeValidation = null;
        if (shopData.id_subtype) {
            subtypeValidation = await validateSubtype(shopData.id_subtype, shopData.id_type);
            if (!subtypeValidation.isValid) {
                return { error: subtypeValidation.error };
            }
        }

        // Create the shop with the validated data
        const shop = await shop_model.create(shopData);
        
        const shopWithTypeInfo = {
            ...shop.toJSON(),
            type_shop: typeValidation.type.name_type,
            type: {
                id_type: typeValidation.type.id_type,
                name_type: typeValidation.type.name_type
            },
            subtype_shop: subtypeValidation ? subtypeValidation.subtype.name_subtype : null,
            subtype: subtypeValidation ? {
                id_subtype: subtypeValidation.subtype.id_subtype,
                name_subtype: subtypeValidation.subtype.name_subtype
            } : null
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

        if (shopData.id_user !== undefined && shopData.id_user !== shop.id_user) {
            const userValidation = await validateUser(shopData.id_user);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        if (shopData.id_type !== undefined && shopData.id_type !== shop.id_type) {
            const typeValidation = await validateType(shopData.id_type);
            
            if (!typeValidation.isValid) {
                return { error: typeValidation.error };
            }
        }

        if (shopData.id_subtype !== undefined && shopData.id_subtype !== shop.id_subtype) {
            if (shopData.id_subtype) {
                const subtypeValidation = await validateSubtype(shopData.id_subtype, shopData.id_type || shop.id_type);
                if (!subtypeValidation.isValid) {
                    return { error: subtypeValidation.error };
                }
            }
        }

        await shop.update(shopData);
        
        // Fetch updated shop with type and subtype information
        const updatedShop = await shop_model.findByPk(id);
        const type = await shop_type_model.findByPk(updatedShop.id_type);
        const subtype = updatedShop.id_subtype ? await shop_subtype_model.findByPk(updatedShop.id_subtype) : null;
        
        const shopWithTypeInfo = {
            ...updatedShop.toJSON(),
            type_shop: type ? type.name_type : null,
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null,
            subtype_shop: subtype ? subtype.name_subtype : null,
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
        console.log('__dirname value:', __dirname);
        
        const shop = await shop_model.findByPk(id);
        
        if (!shop) {
            console.log("Comercio no encontrado con id:", id);
            return { error: "Comercio no encontrado" };
        }

        if (shopData.id_user !== undefined && shopData.id_user !== shop.id_user) {
            const userValidation = await validateUser(shopData.id_user);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        if (shopData.id_type !== undefined && shopData.id_type !== shop.id_type) {
            const typeValidation = await validateType(shopData.id_type);
            
            if (!typeValidation.isValid) {
                return { error: typeValidation.error };
            }
        }

        if (shopData.id_subtype !== undefined && shopData.id_subtype !== shop.id_subtype) {
            if (shopData.id_subtype) {
                const subtypeValidation = await validateSubtype(shopData.id_subtype, shopData.id_type || shop.id_type);
                if (!subtypeValidation.isValid) {
                    return { error: subtypeValidation.error };
                }
            }
        }

        //update: Handle folder renaming for backend assets storage
        if (shopData.name_shop && shopData.name_shop !== oldName) {
            // Update path for backend assets folder
            const oldPath = path.join(__dirname, '..', '..', 'assets', 'images', 'shops', oldName);
            const newPath = path.join(__dirname, '..', '..', 'assets', 'images', 'shops', shopData.name_shop);
            
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
       const type = await shop_type_model.findByPk(updatedShop.id_type);
       const subtype = updatedShop.id_subtype ? await shop_subtype_model.findByPk(updatedShop.id_subtype) : null;
       
       const shopWithTypeInfo = {
           ...updatedShop.toJSON(),
           type_shop: type ? type.name_type : null,
           type: type ? {
               id_type: type.id_type,
               name_type: type.name_type
           } : null,
           subtype_shop: subtype ? subtype.name_subtype : null,
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

       const products = await product_model.findAll({
           where: { id_shop: id_shop }
       });
       
       if (products && products.length > 0) {
           return { 
               error: `No se puede eliminar el comercio porque tiene ${products.length} producto(s) asociados`
           };
       }

       //update: Delete shop folder from backend assets if exists
       const shopPath = path.join(__dirname, '..', '..', 'assets', 'images', 'shops', shop.name_shop);
       
       if (fs.existsSync(shopPath)) {
           try {
               fs.rmSync(shopPath, { recursive: true, force: true });
               console.log(`Carpeta del comercio ${shop.name_shop} eliminada de assets`);
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

       //update: Delete shop folder from backend assets if exists
       const shopPath = path.join(__dirname, '..', '..', 'assets', 'images', 'shops', shop.name_shop);
       
       if (fs.existsSync(shopPath)) {
           try {
               fs.rmSync(shopPath, { recursive: true, force: true });
               console.log(`Carpeta del comercio ${shop.name_shop} eliminada de assets`);
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
       // Get all unique type ids from shops
       const shops = await shop_model.findAll({
           attributes: ['id_type'],
           group: ['id_type']
       });

       if (!shops || shops.length === 0) {
           return { error: "No hay tipos de comercios registrados", data: [] };
       }

       // Build a list of types that have shops
       const types = [];
       
       for (const shop of shops) {
           const type = await shop_type_model.findOne({
               where: {
                   id_type: shop.id_type,
                   verified_type: true
               }
           });
           
           if (type) {
               types.push({
                   id_type: type.id_type,
                   name_type: type.name_type
               });
           }
       }

       return { data: types };
   } catch (err) {
       console.error("Error al obtener tipos de comercios =", err);
       return { error: "Error al obtener tipos de comercios" };
   }
}

async function getSubtypesForType(id_type) {
   try {
       if (!id_type) {
           return { error: "El ID del tipo es obligatorio" };
       }

       const typeValidation = await validateType(id_type);
       if (!typeValidation.isValid) {
           return { error: typeValidation.error };
       }

       const subtypes = await getSubtypesByType(id_type);
       
       return { 
           data: {
               type: {
                   id_type: typeValidation.type.id_type,
                   name_type: typeValidation.type.name_type
               },
               subtypes: subtypes
           }
       };
   } catch (err) {
       console.error("Error al obtener subtipos =", err);
       return { error: "Error al obtener subtipos" };
   }
}

async function verifyShop(id_shop, verified_shop, requesting_user) {
   try {
       // Check if shop exists
       const shop = await shop_model.findByPk(id_shop);
       
       if (!shop) {
           return { error: "Comercio no encontrado" };
       }

       // Check if requesting user has permission (admin or authorized user)
       // This validation should be done in the API controller level with proper auth middleware
       // For now, we'll just update the shop
       
       await shop.update({ verified_shop });
       
       // Fetch updated shop with type and subtype information
       const updatedShop = await shop_model.findByPk(id_shop);
       const type = await shop_type_model.findByPk(updatedShop.id_type);
       const subtype = updatedShop.id_subtype ? await shop_subtype_model.findByPk(updatedShop.id_subtype) : null;
       
       const shopWithTypeInfo = {
           ...updatedShop.toJSON(),
           type_shop: type ? type.name_type : null,
           type: type ? {
               id_type: type.id_type,
               name_type: type.name_type
           } : null,
           subtype_shop: subtype ? subtype.name_subtype : null,
           subtype: subtype ? {
               id_subtype: subtype.id_subtype,
               name_subtype: subtype.name_subtype
           } : null
       };
       
       return { 
           data: shopWithTypeInfo,
           message: verified_shop ? "Comercio verificado exitosamente" : "Verificación del comercio removida"
       };
   } catch (err) {
       console.error("Error al verificar el comercio =", err);
       return { error: "Error al verificar el comercio" };
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
   getTypesOfShops,
   getSubtypesForType,
   verifyShop
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
   getTypesOfShops,
   getSubtypesForType,
   verifyShop
}