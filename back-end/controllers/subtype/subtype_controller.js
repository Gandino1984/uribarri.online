import subtype_model from "../../models/subtype_model.js";
import type_model from "../../models/type_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const subtypes = await subtype_model.findAll({
            where: { active_subtype: true },
            order: [['order_subtype', 'ASC'], ['name_subtype', 'ASC']]
        });

        if (!subtypes || subtypes.length === 0) {
            return { error: "No hay subtipos registrados", data: [] };
        }

        // Manually fetch type information for each subtype
        const subtypesWithType = [];
        for (const subtype of subtypes) {
            const type = await type_model.findByPk(subtype.id_type);
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

async function getByTypeId(id_type) {
    try {
        const subtypes = await subtype_model.findAll({
            where: { 
                id_type: id_type,
                active_subtype: true 
            },
            order: [['order_subtype', 'ASC'], ['name_subtype', 'ASC']]
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
        const subtype = await subtype_model.findByPk(id_subtype);

        if (!subtype) {
            return { error: "Subtipo no encontrado" };
        }

        // Manually fetch the type
        const type = await type_model.findByPk(subtype.id_type);
        
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
        const existingSubtype = await subtype_model.findOne({ 
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
        const type = await type_model.findByPk(subtypeData.id_type);
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Create the subtype
        const subtype = await subtype_model.create(subtypeData);
        
        return { 
            success: "¡Subtipo creado!",
            data: subtype
        };
    } catch (err) {
        console.error("-> subtype_controller.js - create() - Error al crear el subtipo =", err);
        return { error: "Error al crear el subtipo." };
    }
}

async function update(id, subtypeData) {
    try {
        const subtype = await subtype_model.findByPk(id);
        
        if (!subtype) {
            console.log("Subtipo no encontrado con id:", id);
            return { error: "Subtipo no encontrado" };
        }

        // Check if new name already exists for this type (if name is being changed)
        if (subtypeData.name_subtype && 
            (subtypeData.name_subtype !== subtype.name_subtype || 
             subtypeData.id_type !== subtype.id_type)) {
            
            const existingSubtype = await subtype_model.findOne({ 
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
            const type = await type_model.findByPk(subtypeData.id_type);
            if (!type) {
                return { error: "El tipo especificado no existe" };
            }
        }

        await subtype.update(subtypeData);
        
        // Fetch updated subtype with type info
        const updatedSubtype = await subtype_model.findByPk(id);
        const type = await type_model.findByPk(updatedSubtype.id_type);
        
        const subtypeWithType = {
            ...updatedSubtype.toJSON(),
            type: type ? {
                id_type: type.id_type,
                name_type: type.name_type
            } : null
        };
        
        return { data: subtypeWithType };
    } catch (err) {
        console.error("Error al actualizar el subtipo =", err);
        return { error: "Error al actualizar el subtipo" };
    }
}

async function removeById(id_subtype) {
    try {
        if (!id_subtype) {
            return { error: "Subtipo no encontrado" };
        }

        const subtype = await subtype_model.findByPk(id_subtype);
        
        if (!subtype) {
            return { 
                error: "Subtipo no encontrado",
            };
        }

        // Manually check if there are shops using this subtype
        const shops = await shop_model.findAll({
            where: { id_subtype: id_subtype }
        });
        
        if (shops && shops.length > 0) {
            return { 
                error: "No se puede eliminar el subtipo porque hay comercios que lo utilizan"
            };
        }

        // Instead of deleting, we'll deactivate it
        await subtype.update({ active_subtype: false });

        return { 
            data: id_subtype,
            message: "El subtipo se ha desactivado." 
        };
    } catch (err) {
        console.error("-> subtype_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el subtipo" };
    }
}

export { 
    getAll, 
    getByTypeId,
    getById,
    create, 
    update, 
    removeById
}

export default { 
    getAll, 
    getByTypeId,
    getById,
    create, 
    update, 
    removeById
}