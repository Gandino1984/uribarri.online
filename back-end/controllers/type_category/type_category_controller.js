import type_category_model from "../../models/type_category_model.js";
import shop_type_model from "../../models/shop_type_model.js";
import product_category_model from "../../models/product_category_model.js";

//update: Get all type-category associations
async function getAll() {
    try {
        const typeCategories = await type_category_model.findAll();

        if (!typeCategories || typeCategories.length === 0) {
            return { error: "No hay asociaciones tipo-categoría registradas", data: [] };
        }

        // Fetch type and category details for each association
        const associationsWithDetails = [];
        for (const tc of typeCategories) {
            const type = await shop_type_model.findByPk(tc.id_type);
            const category = await product_category_model.findByPk(tc.id_category);
            
            associationsWithDetails.push({
                id_type_category: tc.id_type_category,
                id_type: tc.id_type,
                id_category: tc.id_category,
                type: type ? {
                    id_type: type.id_type,
                    name_type: type.name_type
                } : null,
                category: category ? {
                    id_category: category.id_category,
                    name_category: category.name_category
                } : null
            });
        }

        console.log("-> type_category_controller.js - getAll() - asociaciones encontradas = ", associationsWithDetails.length);

        return { data: associationsWithDetails };
    } catch (err) {
        console.error("-> type_category_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener las asociaciones tipo-categoría" };
    }
}

//update: Get all categories for a specific type
async function getCategoriesByType(id_type) {
    try {
        // Verify type exists
        const type = await shop_type_model.findByPk(id_type);
        if (!type) {
            return { error: "El tipo especificado no existe" };
        }

        // Get all category IDs associated with this type
        const typeCategories = await type_category_model.findAll({
            where: { id_type: id_type }
        });

        if (!typeCategories || typeCategories.length === 0) {
            return { 
                error: "No hay categorías asociadas a este tipo", 
                data: [],
                type: {
                    id_type: type.id_type,
                    name_type: type.name_type
                }
            };
        }

        // Get the actual category details
        const categoryIds = typeCategories.map(tc => tc.id_category);
        const categories = await product_category_model.findAll({
            where: { 
                id_category: categoryIds,
                verified_category: true
            },
            order: [['name_category', 'ASC']]
        });

        console.log(`-> type_category_controller.js - getCategoriesByType() - ${categories.length} categorías encontradas para el tipo ${id_type}`);

        return { 
            data: categories,
            type: {
                id_type: type.id_type,
                name_type: type.name_type
            }
        };
    } catch (err) {
        console.error("-> type_category_controller.js - getCategoriesByType() - Error = ", err);
        return { error: "Error al obtener categorías del tipo" };
    }
}

//update: Get all types for a specific category
async function getTypesByCategory(id_category) {
    try {
        // Verify category exists
        const category = await product_category_model.findByPk(id_category);
        if (!category) {
            return { error: "La categoría especificada no existe" };
        }

        // Get all type IDs associated with this category
        const typeCategories = await type_category_model.findAll({
            where: { id_category: id_category }
        });

        if (!typeCategories || typeCategories.length === 0) {
            return { 
                error: "No hay tipos asociados a esta categoría", 
                data: [],
                category: {
                    id_category: category.id_category,
                    name_category: category.name_category
                }
            };
        }

        // Get the actual type details
        const typeIds = typeCategories.map(tc => tc.id_type);
        const types = await shop_type_model.findAll({
            where: { 
                id_type: typeIds,
                verified_type: true
            },
            order: [['name_type', 'ASC']]
        });

        console.log(`-> type_category_controller.js - getTypesByCategory() - ${types.length} tipos encontrados para la categoría ${id_category}`);

        return { 
            data: types,
            category: {
                id_category: category.id_category,
                name_category: category.name_category
            }
        };
    } catch (err) {
        console.error("-> type_category_controller.js - getTypesByCategory() - Error = ", err);
        return { error: "Error al obtener tipos de la categoría" };
    }
}

//update: Create a new type-category association
async function create(typeCategoryData) {
    try {
        const { id_type, id_category } = typeCategoryData;

        // Verify type exists and is verified
        const type = await shop_type_model.findOne({
            where: {
                id_type: id_type,
                verified_type: true
            }
        });
        if (!type) {
            return { error: "El tipo especificado no existe o no está verificado" };
        }

        // Verify category exists and is verified
        const category = await product_category_model.findOne({
            where: {
                id_category: id_category,
                verified_category: true
            }
        });
        if (!category) {
            return { error: "La categoría especificada no existe o no está verificada" };
        }

        // Check if association already exists
        const existingAssociation = await type_category_model.findOne({
            where: {
                id_type: id_type,
                id_category: id_category
            }
        });

        if (existingAssociation) {
            return { error: "Esta asociación tipo-categoría ya existe" };
        }

        // Create the association
        const typeCategory = await type_category_model.create(typeCategoryData);

        console.log(`-> type_category_controller.js - create() - Asociación creada: tipo ${id_type} con categoría ${id_category}`);

        return { 
            success: "¡Asociación tipo-categoría creada!",
            data: {
                ...typeCategory.toJSON(),
                type: {
                    id_type: type.id_type,
                    name_type: type.name_type
                },
                category: {
                    id_category: category.id_category,
                    name_category: category.name_category
                }
            }
        };
    } catch (err) {
        console.error("-> type_category_controller.js - create() - Error = ", err);
        return { error: "Error al crear la asociación tipo-categoría" };
    }
}

//update: Remove a type-category association by ID
async function removeById(id_type_category) {
    try {
        const typeCategory = await type_category_model.findByPk(id_type_category);
        
        if (!typeCategory) {
            return { error: "Asociación tipo-categoría no encontrada" };
        }

        await typeCategory.destroy();

        return { 
            data: id_type_category,
            message: "La asociación tipo-categoría se ha eliminado." 
        };
    } catch (err) {
        console.error("-> type_category_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la asociación tipo-categoría" };
    }
}

//update: Remove all category associations for a type
async function removeByType(id_type) {
    try {
        const deletedCount = await type_category_model.destroy({
            where: { id_type: id_type }
        });

        return { 
            data: { count: deletedCount, id_type: id_type },
            message: `Se han eliminado ${deletedCount} asociación(es) del tipo.` 
        };
    } catch (err) {
        console.error("-> type_category_controller.js - removeByType() - Error = ", err);
        return { error: "Error al eliminar las asociaciones del tipo" };
    }
}

//update: Remove all type associations for a category
async function removeByCategory(id_category) {
    try {
        const deletedCount = await type_category_model.destroy({
            where: { id_category: id_category }
        });

        return { 
            data: { count: deletedCount, id_category: id_category },
            message: `Se han eliminado ${deletedCount} asociación(es) de la categoría.` 
        };
    } catch (err) {
        console.error("-> type_category_controller.js - removeByCategory() - Error = ", err);
        return { error: "Error al eliminar las asociaciones de la categoría" };
    }
}

//update: Check if a type-category association exists
async function exists(id_type, id_category) {
    try {
        const association = await type_category_model.findOne({
            where: {
                id_type: id_type,
                id_category: id_category
            }
        });

        return !!association;
    } catch (err) {
        console.error("-> type_category_controller.js - exists() - Error = ", err);
        return false;
    }
}

export { 
    getAll,
    getCategoriesByType,
    getTypesByCategory,
    create,
    removeById,
    removeByType,
    removeByCategory,
    exists
}

export default { 
    getAll,
    getCategoriesByType,
    getTypesByCategory,
    create,
    removeById,
    removeByType,
    removeByCategory,
    exists
}