import type_model from "../../models/type_model.js";
import subtype_model from "../../models/subtype_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const types = await type_model.findAll({
            where: { active_type: true },
            order: [['order_type', 'ASC'], ['name_type', 'ASC']]
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

async function getAllWithSubtypes() {
    try {
        const types = await type_model.findAll({
            where: { active_type: true },
            order: [['order_type', 'ASC'], ['name_type', 'ASC']]
        });

        if (!types || types.length === 0) {
            return { error: "No hay tipos registrados", data: [] };
        }

        // Manually fetch subtypes for each type
        const typesAndSubtypes = {};
        
        for (const type of types) {
            const subtypes = await subtype_model.findAll({
                where: { 
                    id_type: type.id_type,
                    active_subtype: true 
                },
                order: [['order_subtype', 'ASC'], ['name_subtype', 'ASC']]
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
        const type = await type_model.findByPk(id_type);

        if (!type) {
            return { error: "Tipo no encontrado" };
        }

        return { data: type };
    } catch (err) {
        console.error("-> type_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el tipo" };
    }
}

async function create(typeData) {
    try {
        // Check if type already exists by name
        const existingType = await type_model.findOne({ 
            where: { name_type: typeData.name_type } 
        });

        if (existingType) {
            console.error("Ya existe un tipo con ese nombre");
            return { 
                error: "Ya existe un tipo con ese nombre"
            };
        }

        // Create the type
        const type = await type_model.create(typeData);
        
        return { 
            success: "¡Tipo creado!",
            data: type
        };
    } catch (err) {
        console.error("-> type_controller.js - create() - Error al crear el tipo =", err);
        return { error: "Error al crear el tipo." };
    }
}

async function update(id, typeData) {
    try {
        const type = await type_model.findByPk(id);
        
        if (!type) {
            console.log("Tipo no encontrado con id:", id);
            return { error: "Tipo no encontrado" };
        }

        // Check if new name already exists (if name is being changed)
        if (typeData.name_type && typeData.name_type !== type.name_type) {
            const existingType = await type_model.findOne({ 
                where: { 
                    name_type: typeData.name_type,
                    id_type: { [Op.ne]: id }
                } 
            });

            if (existingType) {
                return { error: "Ya existe un tipo con ese nombre" };
            }
        }

        await type.update(typeData);
        
        const updatedType = await type_model.findByPk(id);
        
        return { data: updatedType };
    } catch (err) {
        console.error("Error al actualizar el tipo =", err);
        return { error: "Error al actualizar el tipo" };
    }
}

async function removeById(id_type) {
    try {
        if (!id_type) {
            return { error: "Tipo no encontrado" };
        }

        const type = await type_model.findByPk(id_type);
        
        if (!type) {
            return { 
                error: "Tipo no encontrado",
            };
        }

        // Manually check if there are shops using this type
        const shops = await shop_model.findAll({
            where: { id_type: id_type }
        });
        
        if (shops && shops.length > 0) {
            return { 
                error: "No se puede eliminar el tipo porque hay comercios que lo utilizan"
            };
        }

        // Manually check if there are subtypes for this type
        const subtypes = await subtype_model.findAll({
            where: { id_type: id_type }
        });
        
        if (subtypes && subtypes.length > 0) {
            return { 
                error: "No se puede eliminar el tipo porque tiene subtipos asociados"
            };
        }

        // Instead of deleting, we'll deactivate it
        await type.update({ active_type: false });

        return { 
            data: id_type,
            message: "El tipo se ha desactivado." 
        };
    } catch (err) {
        console.error("-> type_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el tipo" };
    }
}

export { 
    getAll, 
    getAllWithSubtypes,
    getById,
    create, 
    update, 
    removeById
}

export default { 
    getAll, 
    getAllWithSubtypes,
    getById,
    create, 
    update, 
    removeById
}