import type_model from "../../models/type_model.js";
import subtype_model from "../../models/subtype_model.js";
import shop_model from "../../models/shop_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const types = await type_model.findAll({
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
        const types = await type_model.findAll({
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
        const types = await type_model.findAll({
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
        const types = await type_model.findAll({
            where: { verified_type: true },
            order: [['name_type', 'ASC']]
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

//update: Modified to create types with verified_type: false by default
async function create(typeData) {
    try {
        //update: Check if type already exists (regardless of verified status)
        const existingType = await type_model.findOne({ 
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
        const type = await type_model.create({
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
                    id_type: { [Op.ne]: id },
                    verified_type: true
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

async function removeById(id_type, cascadeDelete = false) {
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
            if (cascadeDelete) {
                // Delete all subtypes associated with this type
                console.log(`Eliminando ${subtypes.length} subtipos asociados al tipo ${id_type}`);
                
                for (const subtype of subtypes) {
                    // Check if any shops are using this subtype
                    const shopsUsingSubtype = await shop_model.findAll({
                        where: { id_subtype: subtype.id_subtype }
                    });
                    
                    if (shopsUsingSubtype && shopsUsingSubtype.length > 0) {
                        return { 
                            error: `No se puede eliminar el tipo porque el subtipo "${subtype.name_subtype}" está siendo usado por ${shopsUsingSubtype.length} comercio(s)`
                        };
                    }
                    
                    // Delete the subtype
                    await subtype.destroy();
                }
            } else {
                return { 
                    error: "No se puede eliminar el tipo porque tiene subtipos asociados. Use cascadeDelete=true para eliminar también los subtipos."
                };
            }
        }

        // Delete the type
        await type.destroy();

        return { 
            data: id_type,
            message: cascadeDelete && subtypes.length > 0 
                ? `El tipo y sus ${subtypes.length} subtipos han sido eliminados.`
                : "El tipo se ha eliminado.",
            deletedSubtypes: cascadeDelete ? subtypes.length : 0
        };
    } catch (err) {
        console.error("-> type_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el tipo" };
    }
}

async function isTypeValid(id_type) {
    try {
        const type = await type_model.findOne({
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

export { 
    getAll, 
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    create, 
    update, 
    removeById,
    isTypeValid
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    create, 
    update, 
    removeById,
    isTypeValid
}