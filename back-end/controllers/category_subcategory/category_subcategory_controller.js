import category_subcategory_model from "../../models/category_subcategory_model.js";
import product_category_model from "../../models/product_category_model.js";
import product_subcategory_model from "../../models/product_subcategory_model.js";
import sequelize from "../../config/sequelize.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const associations = await category_subcategory_model.findAll({
            order: [['id_category', 'ASC'], ['id_subcategory', 'ASC']]
        });

        if (!associations || associations.length === 0) {
            return { error: "No hay asociaciones registradas", data: [] };
        }

        console.log("-> category_subcategory_controller.js - getAll() - asociaciones encontradas = ", associations.length);

        return { data: associations };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las asociaciones" };
    }
}

async function getById(id_category_subcategory) {
    try {
        const association = await category_subcategory_model.findByPk(id_category_subcategory);

        if (!association) {
            return { error: "Asociación no encontrada" };
        }

        return { data: association };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la asociación" };
    }
}

async function getByCategoryId(id_category) {
    try {
        const associations = await category_subcategory_model.findAll({
            where: { id_category: id_category },
            order: [['id_subcategory', 'ASC']]
        });

        if (!associations || associations.length === 0) {
            return { error: "No hay asociaciones para esta categoría", data: [] };
        }

        return { data: associations };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - getByCategoryId() - Error = ", err);
        return { error: "Error al obtener asociaciones por categoría" };
    }
}

async function getBySubcategoryId(id_subcategory) {
    try {
        const associations = await category_subcategory_model.findAll({
            where: { id_subcategory: id_subcategory },
            order: [['id_category', 'ASC']]
        });

        if (!associations || associations.length === 0) {
            return { error: "No hay asociaciones para esta subcategoría", data: [] };
        }

        return { data: associations };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - getBySubcategoryId() - Error = ", err);
        return { error: "Error al obtener asociaciones por subcategoría" };
    }
}

async function getWithDetails() {
    try {
        const associations = await category_subcategory_model.findAll({
            order: [['id_category', 'ASC'], ['id_subcategory', 'ASC']]
        });

        if (!associations || associations.length === 0) {
            return { error: "No hay asociaciones registradas", data: [] };
        }

        // Get unique category and subcategory IDs
        const categoryIds = [...new Set(associations.map(a => a.id_category))];
        const subcategoryIds = [...new Set(associations.map(a => a.id_subcategory))];

        // Fetch category and subcategory details
        const categories = await product_category_model.findAll({
            where: { id_category: categoryIds }
        });

        const subcategories = await product_subcategory_model.findAll({
            where: { id_subcategory: subcategoryIds }
        });

        // Create lookup maps
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id_category] = cat;
        });

        const subcategoryMap = {};
        subcategories.forEach(subcat => {
            subcategoryMap[subcat.id_subcategory] = subcat;
        });

        // Enrich associations with details
        const enrichedAssociations = associations.map(assoc => ({
            id_category_subcategory: assoc.id_category_subcategory,
            id_category: assoc.id_category,
            id_subcategory: assoc.id_subcategory,
            category: categoryMap[assoc.id_category] || null,
            subcategory: subcategoryMap[assoc.id_subcategory] || null
        }));

        return { data: enrichedAssociations };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - getWithDetails() - Error = ", err);
        return { error: "Error al obtener asociaciones con detalles" };
    }
}

async function create(associationData) {
    const t = await sequelize.transaction();
    
    try {
        const { id_category, id_subcategory } = associationData;

        // Verify category exists
        const category = await product_category_model.findByPk(id_category);
        if (!category) {
            await t.rollback();
            return { error: "La categoría no existe" };
        }

        // Verify subcategory exists
        const subcategory = await product_subcategory_model.findByPk(id_subcategory);
        if (!subcategory) {
            await t.rollback();
            return { error: "La subcategoría no existe" };
        }

        // Check if association already exists
        const existingAssociation = await category_subcategory_model.findOne({ 
            where: { 
                id_category: id_category,
                id_subcategory: id_subcategory
            } 
        });

        if (existingAssociation) {
            await t.rollback();
            return { 
                error: "Ya existe una asociación entre esta categoría y subcategoría"
            };
        }

        // Create the association
        const association = await category_subcategory_model.create({
            id_category,
            id_subcategory
        }, { transaction: t });
        
        await t.commit();
        
        console.log(`Created association between category ${id_category} and subcategory ${id_subcategory}`);
        
        return { 
            success: "¡Asociación creada exitosamente!",
            data: association
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - create() - Error al crear la asociación =", err);
        return { error: "Error al crear la asociación." };
    }
}

async function createMultiple(associationsData) {
    const t = await sequelize.transaction();
    
    try {
        const { id_category, subcategory_ids } = associationsData;

        // Verify category exists
        const category = await product_category_model.findByPk(id_category);
        if (!category) {
            await t.rollback();
            return { error: "La categoría no existe" };
        }

        // Verify all subcategories exist
        const subcategories = await product_subcategory_model.findAll({
            where: { 
                id_subcategory: subcategory_ids
            }
        });

        if (subcategories.length !== subcategory_ids.length) {
            await t.rollback();
            return { error: "Una o más subcategorías no existen" };
        }

        // Check for existing associations
        const existingAssociations = await category_subcategory_model.findAll({ 
            where: { 
                id_category: id_category,
                id_subcategory: subcategory_ids
            } 
        });

        const existingSubcategoryIds = existingAssociations.map(a => a.id_subcategory);
        const newSubcategoryIds = subcategory_ids.filter(id => !existingSubcategoryIds.includes(id));

        if (newSubcategoryIds.length === 0) {
            await t.rollback();
            return { 
                error: "Todas las asociaciones ya existen"
            };
        }

        // Create new associations
        const newAssociations = await Promise.all(
            newSubcategoryIds.map(id_subcategory => 
                category_subcategory_model.create({
                    id_category,
                    id_subcategory
                }, { transaction: t })
            )
        );
        
        await t.commit();
        
        console.log(`Created ${newAssociations.length} associations for category ${id_category}`);
        
        return { 
            success: `¡${newAssociations.length} asociaciones creadas exitosamente!`,
            data: newAssociations,
            skipped: existingSubcategoryIds.length
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - createMultiple() - Error =", err);
        return { error: "Error al crear múltiples asociaciones." };
    }
}

async function removeById(id_category_subcategory) {
    const t = await sequelize.transaction();
    
    try {
        const association = await category_subcategory_model.findByPk(id_category_subcategory);
        
        if (!association) {
            await t.rollback();
            return { 
                error: "Asociación no encontrada",
            };
        }

        // Delete the association
        await association.destroy({ transaction: t });

        await t.commit();

        return { 
            data: id_category_subcategory,
            success: "La asociación se ha eliminado correctamente." 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la asociación" };
    }
}

async function removeByPair(id_category, id_subcategory) {
    const t = await sequelize.transaction();
    
    try {
        const association = await category_subcategory_model.findOne({
            where: {
                id_category: id_category,
                id_subcategory: id_subcategory
            }
        });
        
        if (!association) {
            await t.rollback();
            return { 
                error: "Asociación no encontrada",
            };
        }

        // Delete the association
        await association.destroy({ transaction: t });

        await t.commit();

        return { 
            data: association.id_category_subcategory,
            success: "La asociación se ha eliminado correctamente." 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - removeByPair() - Error = ", err);
        return { error: "Error al eliminar la asociación" };
    }
}

async function removeByCategoryId(id_category) {
    const t = await sequelize.transaction();
    
    try {
        const associations = await category_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (!associations || associations.length === 0) {
            await t.rollback();
            return { 
                error: "No hay asociaciones para esta categoría",
                data: 0
            };
        }

        // Delete all associations for this category
        await category_subcategory_model.destroy({
            where: { id_category: id_category },
            transaction: t
        });

        await t.commit();

        return { 
            data: associations.length,
            success: `Se eliminaron ${associations.length} asociaciones.` 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - removeByCategoryId() - Error = ", err);
        return { error: "Error al eliminar las asociaciones" };
    }
}

async function removeBySubcategoryId(id_subcategory) {
    const t = await sequelize.transaction();
    
    try {
        const associations = await category_subcategory_model.findAll({
            where: { id_subcategory: id_subcategory }
        });
        
        if (!associations || associations.length === 0) {
            await t.rollback();
            return { 
                error: "No hay asociaciones para esta subcategoría",
                data: 0
            };
        }

        // Delete all associations for this subcategory
        await category_subcategory_model.destroy({
            where: { id_subcategory: id_subcategory },
            transaction: t
        });

        await t.commit();

        return { 
            data: associations.length,
            success: `Se eliminaron ${associations.length} asociaciones.` 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> category_subcategory_controller.js - removeBySubcategoryId() - Error = ", err);
        return { error: "Error al eliminar las asociaciones" };
    }
}

async function checkAssociation(id_category, id_subcategory) {
    try {
        const association = await category_subcategory_model.findOne({
            where: {
                id_category: id_category,
                id_subcategory: id_subcategory
            }
        });

        return {
            exists: !!association,
            data: association
        };
    } catch (err) {
        console.error("-> category_subcategory_controller.js - checkAssociation() - Error = ", err);
        return {
            exists: false,
            data: null
        };
    }
}

export { 
    getAll, 
    getById,
    getByCategoryId,
    getBySubcategoryId,
    getWithDetails,
    create,
    createMultiple,
    removeById,
    removeByPair,
    removeByCategoryId,
    removeBySubcategoryId,
    checkAssociation
}

export default { 
    getAll, 
    getById,
    getByCategoryId,
    getBySubcategoryId,
    getWithDetails,
    create,
    createMultiple,
    removeById,
    removeByPair,
    removeByCategoryId,
    removeBySubcategoryId,
    checkAssociation
}