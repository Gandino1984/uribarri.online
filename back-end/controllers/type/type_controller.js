import shop_type_model from "../../models/shop_type_model.js"; 
import shop_subtype_model from "../../models/shop_subtype_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const types = await shop_type_model.findAll({
            order: [['name_type', 'ASC']]
        });

        if (!types || types.length === 0) {
            return { error: "No hay tipos registrados", data: [] };
        }

        console.log("-> type_controller.js - getAll() - tipos encontrados = ", types.length);

        return { data: types };
    } catch (err) {
        console.error("-> type_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los tipos" };
    }
}

async function getVerified() {
    try {
        const types = await shop_type_model.findAll({
            where: { verified_type: true },
            order: [['name_type', 'ASC']]
        });

        if (!types || types.length === 0) {
            return { error: "No hay tipos verificados registrados", data: [] };
        }

        console.log("-> type_controller.js - getVerified() - tipos verificados encontrados = ", types.length);

        return { data: types };
    } catch (err) {
        console.error("-> type_controller.js - getVerified() - Error = ", err);
        return { error: "Error al obtener tipos verificados" };
    }
}

async function getUnverified() {
    try {
        const types = await shop_type_model.findAll({
            where: { verified_type: false },
            order: [['name_type', 'ASC']]
        });

        if (!types || types.length === 0) {
            return { error: "No hay tipos no verificados registrados", data: [] };
        }

        console.log("-> type_controller.js - getUnverified() - tipos no verificados encontrados = ", types.length);

        return { data: types };
    } catch (err) {
        console.error("-> type_controller.js - getUnverified() - Error = ", err);
        return { error: "Error al obtener tipos no verificados" };
    }
}

async function getAllWithSubtypes() {
    try {
        const types = await shop_type_model.findAll({
            where: { verified_type: true },
            order: [['name_type', 'ASC']]
        });

        if (!types || types.length === 0) {
            return { error: "No hay tipos registrados", data: [] };
        }

        // Manually fetch subtypes for each type
        const typesAndSubtypes = {};
        
        for (const type of types) {
            const subtypes = await shop_subtype_model.findAll({
                where: { 
                    id_type: type.id_type,
                    verified_subtype: true 
                },
                order: [['name_subtype', 'ASC']]
            });
            
            typesAndSubtypes[type.name_type] = subtypes.map(subtype => subtype.name_subtype);
        }

        console.log("-> type_controller.js - getAllWithSubtypes() - tipos con subtipos encontrados");

        return { data: typesAndSubtypes };
    } catch (err) {
        console.error("-> type_controller.js - getAllWithSubtypes() - Error = ", err);
        return { error: "Error al obtener tipos con subtipos" };
    }
}

async function getById(id_type) {
    try {
        const type = await shop_type_model.findByPk(id_type);

        if (!type) {
            return { error: "Tipo no encontrado" };
        }

        return { data: type };
    } catch (err) {
        console.error("-> type_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el tipo" };
    }
}

async function getSubtypesByTypeId(id_type) {
    try {
        // Verify that the type exists
        const type = await shop_type_model.findByPk(id_type);
        
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Get all subtypes for this type (both verified and unverified)
        const subtypes = await shop_subtype_model.findAll({
            where: { 
                id_type: id_type
            },
            order: [['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { 
                error: "No hay subtipos registrados para este tipo", 
                data: [],
                type: {
                    id_type: type.id_type,
                    name_type: type.name_type
                }
            };
        }

        console.log(`-> type_controller.js - getSubtypesByTypeId() - ${subtypes.length} subtipos encontrados para el tipo ${id_type}`);

        return { 
            data: subtypes,
            type: {
                id_type: type.id_type,
                name_type: type.name_type
            }
        };
    } catch (err) {
        console.error("-> type_controller.js - getSubtypesByTypeId() - Error = ", err);
        return { error: "Error al obtener subtipos del tipo" };
    }
}

async function create(typeData) {
    try {
        // Check if type already exists (regardless of verified status)
        const existingType = await shop_type_model.findOne({ 
            where: { 
                name_type: typeData.name_type
            } 
        });

        if (existingType) {
            console.error("Ya existe un tipo con ese nombre");
            return { 
                error: "Ya existe un tipo con ese nombre"
            };
        }

        // Create the type with verified_type: false by default
        const type = await shop_type_model.create({
            ...typeData,
            verified_type: false
        });
        
        return { 
            success: "¡Tipo creado!",
            data: type
        };
    } catch (err) {
        console.error("-> type_controller.js - create() - Error al crear el tipo =", err);
        return { error: "Error al crear el tipo." };
    }
}

//update: Modified to check for shops using this type
async function update(id, typeData) {
    try {
        const type = await shop_type_model.findByPk(id);
        
        if (!type) {
            console.log("Tipo no encontrado con id:", id);
            return { error: "Tipo no encontrado" };
        }

        // Check if new name already exists (if name is being changed)
        if (typeData.name_type && typeData.name_type !== type.name_type) {
            const existingType = await shop_type_model.findOne({ 
                where: { 
                    name_type: typeData.name_type,
                    id_type: { [Op.ne]: id }
                } 
            });

            if (existingType) {
                return { error: "Ya existe un tipo con ese nombre" };
            }
        }

        //update: Check if there are shops using this type
        const shopsUsingType = await shop_model.findAll({
            where: { id_type: id }
        });
        
        if (shopsUsingType && shopsUsingType.length > 0) {
            return { 
                error: `No se puede actualizar el tipo porque hay ${shopsUsingType.length} comercio(s) que lo utilizan`,
                warning: true,
                affectedShops: shopsUsingType.length
            };
        }

        await type.update(typeData);
        
        const updatedType = await shop_type_model.findByPk(id);
        
        return { 
            data: updatedType,
            success: "Tipo actualizado correctamente"
        };
    } catch (err) {
        console.error("Error al actualizar el tipo =", err);
        return { error: "Error al actualizar el tipo" };
    }
}

//update: New function for cascade update
async function updateCascade(id, typeData) {
    try {
        const type = await shop_type_model.findByPk(id);
        
        if (!type) {
            console.log("Tipo no encontrado con id:", id);
            return { error: "Tipo no encontrado" };
        }

        // Check if new name already exists (if name is being changed)
        if (typeData.name_type && typeData.name_type !== type.name_type) {
            const existingType = await shop_type_model.findOne({ 
                where: { 
                    name_type: typeData.name_type,
                    id_type: { [Op.ne]: id }
                } 
            });

            if (existingType) {
                return { error: "Ya existe un tipo con ese nombre" };
            }
        }

        //update: Check how many shops will be affected
        const shopsUsingType = await shop_model.findAll({
            where: { id_type: id }
        });

        // Update the type
        await type.update(typeData);
        
        const updatedType = await shop_type_model.findByPk(id);
        
        return { 
            data: updatedType,
            success: `Tipo actualizado correctamente. ${shopsUsingType.length} comercio(s) mantienen este tipo.`,
            affectedShops: shopsUsingType.length
        };
    } catch (err) {
        console.error("Error al actualizar el tipo en cascada =", err);
        return { error: "Error al actualizar el tipo en cascada" };
    }
}

//update: Modified to check for shops using this type
async function removeById(id_type) {
    try {
        if (!id_type) {
            return { error: "ID del tipo no proporcionado" };
        }

        const type = await shop_type_model.findByPk(id_type);
        
        if (!type) {
            return { 
                error: "Tipo no encontrado",
            };
        }

        //update: Check if there are shops using this type
        const shops = await shop_model.findAll({
            where: { id_type: id_type }
        });
        
        if (shops && shops.length > 0) {
            return { 
                error: `No se puede eliminar el tipo porque hay ${shops.length} comercio(s) que lo utilizan`,
                warning: true,
                affectedShops: shops.length
            };
        }

        // Check if there are subtypes for this type
        const subtypes = await shop_subtype_model.findAll({
            where: { id_type: id_type }
        });
        
        if (subtypes && subtypes.length > 0) {
            // Delete all subtypes associated with this type
            console.log(`Eliminando ${subtypes.length} subtipos asociados al tipo ${id_type}`);
            
            for (const subtype of subtypes) {
                await subtype.destroy();
            }
        }

        // Delete the type
        await type.destroy();

        return { 
            data: id_type,
            success: subtypes.length > 0 
                ? `El tipo y sus ${subtypes.length} subtipos han sido eliminados.`
                : "El tipo se ha eliminado correctamente.",
            deletedSubtypes: subtypes.length
        };
    } catch (err) {
        console.error("-> type_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el tipo" };
    }
}

//update: New function for cascade delete (deletes type and all shops using it)
async function removeCascade(id_type) {
    try {
        if (!id_type) {
            return { error: "ID del tipo no proporcionado" };
        }

        const type = await shop_type_model.findByPk(id_type);
        
        if (!type) {
            return { 
                error: "Tipo no encontrado",
            };
        }

        //update: Get all shops using this type before deletion
        const shops = await shop_model.findAll({
            where: { id_type: id_type }
        });
        
        const shopCount = shops ? shops.length : 0;
        
        //update: Delete all shops using this type
        if (shops && shops.length > 0) {
            console.log(`Eliminando ${shops.length} comercio(s) que usan el tipo ${id_type}`);
            
            for (const shop of shops) {
                await shop.destroy();
            }
        }

        // Delete all subtypes associated with this type
        const subtypes = await shop_subtype_model.findAll({
            where: { id_type: id_type }
        });
        
        const subtypeCount = subtypes ? subtypes.length : 0;
        
        if (subtypes && subtypes.length > 0) {
            console.log(`Eliminando ${subtypes.length} subtipos asociados al tipo ${id_type}`);
            
            for (const subtype of subtypes) {
                await subtype.destroy();
            }
        }

        // Delete the type
        await type.destroy();

        return { 
            data: id_type,
            success: `El tipo ha sido eliminado junto con ${shopCount} comercio(s) y ${subtypeCount} subtipo(s).`,
            warning: shopCount > 0 ? `ADVERTENCIA: Se han eliminado ${shopCount} comercio(s) permanentemente.` : null,
            deletedShops: shopCount,
            deletedSubtypes: subtypeCount
        };
    } catch (err) {
        console.error("-> type_controller.js - removeCascade() - Error = ", err);
        return { error: "Error al eliminar el tipo en cascada" };
    }
}

async function isTypeValid(id_type) {
    try {
        const type = await shop_type_model.findOne({
            where: {
                id_type: id_type,
                verified_type: true
            }
        });
        
        return !!type;
    } catch (err) {
        console.error("-> type_controller.js - isTypeValid() - Error = ", err);
        return false;
    }
}

//update: New function to check shops affected by type operations
async function checkAffectedShops(id_type) {
    try {
        const shops = await shop_model.findAll({
            where: { id_type: id_type },
            attributes: ['id_shop', 'name_shop']
        });
        
        return {
            count: shops ? shops.length : 0,
            shops: shops || []
        };
    } catch (err) {
        console.error("-> type_controller.js - checkAffectedShops() - Error = ", err);
        return {
            count: 0,
            shops: []
        };
    }
}

export { 
    getAll, 
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    getSubtypesByTypeId,
    create, 
    update,
    updateCascade,
    removeById,
    removeCascade,
    isTypeValid,
    checkAffectedShops
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    getSubtypesByTypeId,
    create, 
    update,
    updateCascade,
    removeById,
    removeCascade,
    isTypeValid,
    checkAffectedShops
}