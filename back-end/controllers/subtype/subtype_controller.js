import shop_subtype_model from "../../models/shop_subtype_model.js";
import shop_type_model from "../../models/shop_type_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const subtypes = await shop_subtype_model.findAll({
            order: [['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { error: "No hay subtipos registrados", data: [] };
        }

        // Manually fetch type information for each subtype
        const subtypesWithType = [];
        for (const subtype of subtypes) {
            const type = await shop_type_model.findByPk(subtype.id_type);
            subtypesWithType.push({
                ...subtype.toJSON(),
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null
            });
        }

        console.log("-> subtype_controller.js - getAll() - subtipos encontrados = ", subtypesWithType.length);

        return { data: subtypesWithType };
    } catch (err) {
        console.error("-> subtype_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los subtipos" };
    }
}

async function getVerified() {
    try {
        const subtypes = await shop_subtype_model.findAll({
            where: { verified_subtype: true },
            order: [['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { error: "No hay subtipos verificados registrados", data: [] };
        }

        // Manually fetch type information for each subtype
        const subtypesWithType = [];
        for (const subtype of subtypes) {
            const type = await shop_type_model.findByPk(subtype.id_type);
            subtypesWithType.push({
                ...subtype.toJSON(),
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null
            });
        }

        console.log("-> subtype_controller.js - getVerified() - subtipos verificados encontrados = ", subtypesWithType.length);

        return { data: subtypesWithType };
    } catch (err) {
        console.error("-> subtype_controller.js - getVerified() - Error = ", err);
        return { error: "Error al obtener subtipos verificados" };
    }
}

async function getUnverified() {
    try {
        const subtypes = await shop_subtype_model.findAll({
            where: { verified_subtype: false },
            order: [['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { error: "No hay subtipos no verificados registrados", data: [] };
        }

        // Manually fetch type information for each subtype
        const subtypesWithType = [];
        for (const subtype of subtypes) {
            const type = await shop_type_model.findByPk(subtype.id_type);
            subtypesWithType.push({
                ...subtype.toJSON(),
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null
            });
        }

        console.log("-> subtype_controller.js - getUnverified() - subtipos no verificados encontrados = ", subtypesWithType.length);

        return { data: subtypesWithType };
    } catch (err) {
        console.error("-> subtype_controller.js - getUnverified() - Error = ", err);
        return { error: "Error al obtener subtipos no verificados" };
    }
}

async function getByTypeId(id_type) {
    try {
        const subtypes = await shop_subtype_model.findAll({
            where: { 
                id_type: id_type,
                verified_subtype: true 
            },
            order: [['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { error: "No hay subtipos registrados para este tipo", data: [] };
        }

        return { data: subtypes };
    } catch (err) {
        console.error("-> subtype_controller.js - getByTypeId() - Error = ", err);
        return { error: "Error al obtener subtipos por tipo" };
    }
}

async function getById(id_subtype) {
    try {
        const subtype = await shop_subtype_model.findByPk(id_subtype);

        if (!subtype) {
            return { error: "Subtipo no encontrado" };
        }

        // Manually fetch the type
        const type = await shop_type_model.findByPk(subtype.id_type);
        
        const subtypeWithType = {
            ...subtype.toJSON(),
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null
        };

        return { data: subtypeWithType };
    } catch (err) {
        console.error("-> subtype_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el subtipo" };
    }
}

async function create(subtypeData) {
    try {
        // Check if subtype already exists for this type
        const existingSubtype = await shop_subtype_model.findOne({ 
            where: { 
                name_subtype: subtypeData.name_subtype,
                id_type: subtypeData.id_type
            } 
        });

        if (existingSubtype) {
            console.error("Ya existe un subtipo con ese nombre para este tipo");
            return { 
                error: "Ya existe un subtipo con ese nombre para este tipo"
            };
        }

        // Verify that the type exists
        const type = await shop_type_model.findByPk(subtypeData.id_type);
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Create the subtype with verified_subtype: false by default
        const subtype = await shop_subtype_model.create({
            ...subtypeData,
            verified_subtype: false
        });
        
        return { 
            success: "¡Subtipo creado!",
            data: subtype
        };
    } catch (err) {
        console.error("-> subtype_controller.js - create() - Error al crear el subtipo =", err);
        return { error: "Error al crear el subtipo." };
    }
}

//update: Modified to check for shops using this subtype
async function update(id, subtypeData) {
    try {
        const subtype = await shop_subtype_model.findByPk(id);
        
        if (!subtype) {
            console.log("Subtipo no encontrado con id:", id);
            return { error: "Subtipo no encontrado" };
        }

        // Check if new name already exists for this type (if name is being changed)
        if (subtypeData.name_subtype && 
            (subtypeData.name_subtype !== subtype.name_subtype || 
             subtypeData.id_type !== subtype.id_type)) {
            
            const existingSubtype = await shop_subtype_model.findOne({ 
                where: { 
                    name_subtype: subtypeData.name_subtype,
                    id_type: subtypeData.id_type || subtype.id_type,
                    id_subtype: { [Op.ne]: id }
                } 
            });

            if (existingSubtype) {
                return { error: "Ya existe un subtipo con ese nombre para este tipo" };
            }
        }

        // If changing type, verify the new type exists
        if (subtypeData.id_type && subtypeData.id_type !== subtype.id_type) {
            const type = await shop_type_model.findByPk(subtypeData.id_type);
            if (!type) {
                return { error: "El tipo especificado no existe" };
            }
        }

        //update: Check if there are shops using this subtype
        const shopsUsingSubtype = await shop_model.findAll({
            where: { id_subtype: id }
        });
        
        if (shopsUsingSubtype && shopsUsingSubtype.length > 0) {
            return { 
                error: `No se puede actualizar el subtipo porque hay ${shopsUsingSubtype.length} comercio(s) que lo utilizan`,
                warning: true,
                affectedShops: shopsUsingSubtype.length
            };
        }

        await subtype.update(subtypeData);
        
        // Fetch updated subtype with type info
        const updatedSubtype = await shop_subtype_model.findByPk(id);
        const type = await shop_type_model.findByPk(updatedSubtype.id_type);
        
        const subtypeWithType = {
            ...updatedSubtype.toJSON(),
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null
        };
        
        return { 
            data: subtypeWithType,
            success: "Subtipo actualizado correctamente"
        };
    } catch (err) {
        console.error("Error al actualizar el subtipo =", err);
        return { error: "Error al actualizar el subtipo" };
    }
}

//update: New function for cascade update
async function updateCascade(id, subtypeData) {
    try {
        const subtype = await shop_subtype_model.findByPk(id);
        
        if (!subtype) {
            console.log("Subtipo no encontrado con id:", id);
            return { error: "Subtipo no encontrado" };
        }

        // Store the old subtype data for logging
        const oldSubtypeName = subtype.name_subtype;
        const oldVerifiedStatus = subtype.verified_subtype;
        const oldTypeId = subtype.id_type;

        // Check if new name already exists for this type (if name is being changed)
        if (subtypeData.name_subtype && 
            (subtypeData.name_subtype !== subtype.name_subtype || 
             subtypeData.id_type !== subtype.id_type)) {
            
            const existingSubtype = await shop_subtype_model.findOne({ 
                where: { 
                    name_subtype: subtypeData.name_subtype,
                    id_type: subtypeData.id_type || subtype.id_type,
                    id_subtype: { [Op.ne]: id }
                } 
            });

            if (existingSubtype) {
                return { error: "Ya existe un subtipo con ese nombre para este tipo" };
            }
        }

        // If changing type, verify the new type exists
        if (subtypeData.id_type && subtypeData.id_type !== subtype.id_type) {
            const type = await shop_type_model.findByPk(subtypeData.id_type);
            if (!type) {
                return { error: "El tipo especificado no existe" };
            }
        }

        //update: Get all shops that will be affected by this change
        const shopsUsingSubtype = await shop_model.findAll({
            where: { id_subtype: id },
            attributes: ['id_shop', 'name_shop']
        });

        // Update the subtype itself
        await subtype.update(subtypeData);
        
        // Fetch updated subtype with type info
        const updatedSubtype = await shop_subtype_model.findByPk(id);
        const type = await shop_type_model.findByPk(updatedSubtype.id_type);
        
        const subtypeWithType = {
            ...updatedSubtype.toJSON(),
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null
        };
        
        // Log the changes
        const changes = [];
        if (subtypeData.name_subtype && subtypeData.name_subtype !== oldSubtypeName) {
            changes.push(`nombre cambiado de "${oldSubtypeName}" a "${subtypeData.name_subtype}"`);
        }
        if (subtypeData.verified_subtype !== undefined && subtypeData.verified_subtype !== oldVerifiedStatus) {
            changes.push(`estado de verificación cambiado a ${subtypeData.verified_subtype ? 'verificado' : 'no verificado'}`);
        }
        if (subtypeData.id_type && subtypeData.id_type !== oldTypeId) {
            changes.push(`tipo cambiado`);
        }
        
        return { 
            data: subtypeWithType,
            success: `Subtipo actualizado correctamente (${changes.join(', ')}). ${shopsUsingSubtype.length} comercio(s) reflejan estos cambios automáticamente.`,
            affectedShops: shopsUsingSubtype.length,
            affectedShopsList: shopsUsingSubtype.map(shop => ({
                id_shop: shop.id_shop,
                name_shop: shop.name_shop
            }))
        };
    } catch (err) {
        console.error("Error al actualizar el subtipo en cascada =", err);
        return { error: "Error al actualizar el subtipo en cascada" };
    }
}

//update: Modified to check for shops using this subtype
async function removeById(id_subtype) {
    try {
        if (!id_subtype) {
            return { error: "ID del subtipo no proporcionado" };
        }

        const subtype = await shop_subtype_model.findByPk(id_subtype);
        
        if (!subtype) {
            return { 
                error: "Subtipo no encontrado",
            };
        }

        //update: Check if there are shops using this subtype
        const shops = await shop_model.findAll({
            where: { id_subtype: id_subtype }
        });
        
        if (shops && shops.length > 0) {
            return { 
                error: `No se puede eliminar el subtipo porque hay ${shops.length} comercio(s) que lo utilizan`,
                warning: true,
                affectedShops: shops.length
            };
        }

        // Delete the subtype
        await subtype.destroy();

        return { 
            data: id_subtype,
            success: "El subtipo se ha eliminado correctamente."
        };
    } catch (err) {
        console.error("-> subtype_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el subtipo" };
    }
}

//update: New function for cascade delete (deletes subtype and all shops using it)
async function removeCascade(id_subtype) {
    try {
        if (!id_subtype) {
            return { error: "ID del subtipo no proporcionado" };
        }

        const subtype = await shop_subtype_model.findByPk(id_subtype);
        
        if (!subtype) {
            return { 
                error: "Subtipo no encontrado",
            };
        }

        //update: Get all shops using this subtype before deletion
        const shops = await shop_model.findAll({
            where: { id_subtype: id_subtype }
        });
        
        const shopCount = shops ? shops.length : 0;
        
        //update: Delete all shops using this subtype
        if (shops && shops.length > 0) {
            console.log(`Eliminando ${shops.length} comercio(s) que usan el subtipo ${id_subtype}`);
            
            for (const shop of shops) {
                await shop.destroy();
            }
        }

        // Delete the subtype
        await subtype.destroy();

        return { 
            data: id_subtype,
            success: `El subtipo ha sido eliminado junto con ${shopCount} comercio(s).`,
            warning: shopCount > 0 ? `ADVERTENCIA: Se han eliminado ${shopCount} comercio(s) permanentemente.` : null,
            deletedShops: shopCount
        };
    } catch (err) {
        console.error("-> subtype_controller.js - removeCascade() - Error = ", err);
        return { error: "Error al eliminar el subtipo en cascada" };
    }
}

//update: Modified to check for shops before deleting all subtypes
async function removeByTypeId(id_type) {
    try {
        if (!id_type) {
            return { error: "El ID del tipo es obligatorio" };
        }

        // Verify that the type exists
        const type = await shop_type_model.findByPk(id_type);
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Find all subtypes for this type
        const subtypes = await shop_subtype_model.findAll({
            where: { id_type: id_type }
        });

        if (!subtypes || subtypes.length === 0) {
            return { 
                error: "No hay subtipos para eliminar en este tipo",
                data: { count: 0 }
            };
        }

        //update: Check if any shops are using these subtypes
        const subtypeIds = subtypes.map(s => s.id_subtype);
        const shopsUsingSubtypes = await shop_model.findAll({
            where: { 
                id_subtype: {
                    [Op.in]: subtypeIds
                }
            }
        });

        if (shopsUsingSubtypes && shopsUsingSubtypes.length > 0) {
            return { 
                error: `No se pueden eliminar los subtipos porque hay ${shopsUsingSubtypes.length} comercio(s) que los utilizan`,
                warning: true,
                affectedShops: shopsUsingSubtypes.length
            };
        }

        // Delete all subtypes
        const deletedCount = await shop_subtype_model.destroy({
            where: { id_type: id_type }
        });

        return { 
            data: { 
                count: deletedCount,
                id_type: id_type
            },
            success: `Se han eliminado ${deletedCount} subtipo(s) del tipo especificado.` 
        };
    } catch (err) {
        console.error("-> subtype_controller.js - removeByTypeId() - Error = ", err);
        return { error: "Error al eliminar los subtipos del tipo" };
    }
}

//update: New function for cascade delete by type (deletes all subtypes and shops using them)
async function removeByTypeIdCascade(id_type) {
    try {
        if (!id_type) {
            return { error: "El ID del tipo es obligatorio" };
        }

        // Verify that the type exists
        const type = await shop_type_model.findByPk(id_type);
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Find all subtypes for this type
        const subtypes = await shop_subtype_model.findAll({
            where: { id_type: id_type }
        });

        if (!subtypes || subtypes.length === 0) {
            return { 
                error: "No hay subtipos para eliminar en este tipo",
                data: { count: 0 }
            };
        }

        //update: Get all shops using these subtypes before deletion
        const subtypeIds = subtypes.map(s => s.id_subtype);
        const shopsUsingSubtypes = await shop_model.findAll({
            where: { 
                id_subtype: {
                    [Op.in]: subtypeIds
                }
            }
        });

        const shopCount = shopsUsingSubtypes ? shopsUsingSubtypes.length : 0;

        //update: Delete all shops using these subtypes
        if (shopsUsingSubtypes && shopsUsingSubtypes.length > 0) {
            console.log(`Eliminando ${shopsUsingSubtypes.length} comercio(s) que usan subtipos del tipo ${id_type}`);
            
            for (const shop of shopsUsingSubtypes) {
                await shop.destroy();
            }
        }

        // Delete all subtypes
        const deletedCount = await shop_subtype_model.destroy({
            where: { id_type: id_type }
        });

        return { 
            data: { 
                count: deletedCount,
                id_type: id_type
            },
            success: `Se han eliminado ${deletedCount} subtipo(s) y ${shopCount} comercio(s) del tipo especificado.`,
            warning: shopCount > 0 ? `ADVERTENCIA: Se han eliminado ${shopCount} comercio(s) permanentemente.` : null,
            deletedShops: shopCount
        };
    } catch (err) {
        console.error("-> subtype_controller.js - removeByTypeIdCascade() - Error = ", err);
        return { error: "Error al eliminar los subtipos del tipo en cascada" };
    }
}

//update: New function to check shops affected by subtype operations
async function checkAffectedShops(id_subtype) {
    try {
        const shops = await shop_model.findAll({
            where: { id_subtype: id_subtype },
            attributes: ['id_shop', 'name_shop']
        });
        
        return {
            count: shops ? shops.length : 0,
            shops: shops || []
        };
    } catch (err) {
        console.error("-> subtype_controller.js - checkAffectedShops() - Error = ", err);
        return {
            count: 0,
            shops: []
        };
    }
}

//update: New function to migrate shops from one subtype to another
async function migrateShopsToNewSubtype(oldSubtypeId, newSubtypeId) {
    try {
        // Verify both subtypes exist
        const oldSubtype = await shop_subtype_model.findByPk(oldSubtypeId);
        const newSubtype = await shop_subtype_model.findByPk(newSubtypeId);
        
        if (!oldSubtype) {
            return { error: "El subtipo origen no existe" };
        }
        
        if (!newSubtype) {
            return { error: "El subtipo destino no existe" };
        }
        
        // Get all shops with the old subtype
        const shopsToMigrate = await shop_model.findAll({
            where: { id_subtype: oldSubtypeId }
        });
        
        if (!shopsToMigrate || shopsToMigrate.length === 0) {
            return { 
                error: "No hay comercios para migrar",
                data: []
            };
        }
        
        // Update all shops to the new subtype
        const updatePromises = shopsToMigrate.map(shop => 
            shop.update({ id_subtype: newSubtypeId })
        );
        
        await Promise.all(updatePromises);
        
        console.log(`-> subtype_controller.js - migrateShopsToNewSubtype() - ${shopsToMigrate.length} comercios migrados del subtipo ${oldSubtypeId} al subtipo ${newSubtypeId}`);
        
        return { 
            success: `${shopsToMigrate.length} comercio(s) migrados exitosamente de "${oldSubtype.name_subtype}" a "${newSubtype.name_subtype}"`,
            migratedShops: shopsToMigrate.length,
            fromSubtype: {
                id_subtype: oldSubtype.id_subtype,
                name_subtype: oldSubtype.name_subtype
            },
            toSubtype: {
                id_subtype: newSubtype.id_subtype,
                name_subtype: newSubtype.name_subtype
            }
        };
    } catch (err) {
        console.error("-> subtype_controller.js - migrateShopsToNewSubtype() - Error = ", err);
        return { error: "Error al migrar comercios a nuevo subtipo" };
    }
}

export { 
    getAll, 
    getVerified,
    getUnverified,
    getByTypeId,
    getById,
    create, 
    update,
    updateCascade,
    removeById,
    removeCascade,
    removeByTypeId,
    removeByTypeIdCascade,
    checkAffectedShops,
    migrateShopsToNewSubtype
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getByTypeId,
    getById,
    create, 
    update,
    updateCascade,
    removeById,
    removeCascade,
    removeByTypeId,
    removeByTypeIdCascade,
    checkAffectedShops,
    migrateShopsToNewSubtype
}