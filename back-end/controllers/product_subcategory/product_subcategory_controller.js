import product_subcategory_model from "../../models/product_subcategory_model.js";
import category_subcategory_model from "../../models/category_subcategory_model.js";
import type_category_model from "../../models/type_category_model.js";
import sequelize from "../../config/sequelize.js";

async function getAll() {
    try {
        const subcategories = await product_subcategory_model.findAll({
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías registradas", data: [] };
        }

        console.log("-> product_subcategory_controller.js - getAll() - subcategorías encontradas = ", subcategories.length);

        return { data: subcategories };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las subcategorías" };
    }
}

async function getVerified() {
    try {
        const subcategories = await product_subcategory_model.findAll({
            where: { verified_subcategory: true },
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías verificadas registradas", data: [] };
        }

        return { data: subcategories };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getVerified() - Error = ", err);
        return { error: "Error al obtener subcategorías verificadas" };
    }
}

async function getUnverified() {
    try {
        const subcategories = await product_subcategory_model.findAll({
            where: { verified_subcategory: false },
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías no verificadas registradas", data: [] };
        }

        return { data: subcategories };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getUnverified() - Error = ", err);
        return { error: "Error al obtener subcategorías no verificadas" };
    }
}

async function getById(id_subcategory) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id_subcategory);

        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        return { data: subcategory };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la subcategoría" };
    }
}

async function getByCategoryId(id_category) {
    try {
        const subcategories = await product_subcategory_model.findAll({
            where: { id_category: id_category },
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías para esta categoría", data: [] };
        }

        return { data: subcategories };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getByCategoryId() - Error = ", err);
        return { error: "Error al obtener subcategorías por categoría" };
    }
}

async function create(subcategoryData) {
    const t = await sequelize.transaction();
    
    try {
        const { name_subcategory, id_category, createdby_subcategory } = subcategoryData;

        // Check if subcategory already exists for this category
        const existingSubcategory = await product_subcategory_model.findOne({ 
            where: { 
                name_subcategory: name_subcategory,
                id_category: id_category 
            } 
        });

        if (existingSubcategory) {
            await t.rollback();
            return { 
                error: "Ya existe una subcategoría con ese nombre para esta categoría"
            };
        }

        // Create the subcategory
        const subcategory = await product_subcategory_model.create({
            name_subcategory,
            id_category,
            createdby_subcategory: createdby_subcategory || null,
            verified_subcategory: false
        }, { transaction: t });
        
        // Create the category-subcategory association
        await category_subcategory_model.create({
            id_category: id_category,
            id_subcategory: subcategory.id_subcategory
        }, { transaction: t });
        
        await t.commit();
        
        console.log(`Created subcategory ${subcategory.id_subcategory} and associated it with category ${id_category}`);
        
        return { 
            success: "¡Subcategoría creada!",
            data: subcategory
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - create() - Error al crear la subcategoría =", err);
        return { error: "Error al crear la subcategoría." };
    }
}

async function update(id, subcategoryData) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id);
        
        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        // Check if new name already exists for this category (if name is being changed)
        if (subcategoryData.name_subcategory && subcategoryData.name_subcategory !== subcategory.name_subcategory) {
            const existingSubcategory = await product_subcategory_model.findOne({ 
                where: { 
                    name_subcategory: subcategoryData.name_subcategory,
                    id_category: subcategory.id_category 
                } 
            });

            if (existingSubcategory) {
                return { error: "Ya existe una subcategoría con ese nombre para esta categoría" };
            }
        }

        await subcategory.update(subcategoryData);
        
        return { data: subcategory };
    } catch (err) {
        console.error("Error al actualizar la subcategoría =", err);
        return { error: "Error al actualizar la subcategoría" };
    }
}

async function removeById(id_subcategory) {
    const t = await sequelize.transaction();
    
    try {
        const subcategory = await product_subcategory_model.findByPk(id_subcategory);
        
        if (!subcategory) {
            await t.rollback();
            return { 
                error: "Subcategoría no encontrada",
            };
        }

        // Delete category-subcategory associations first
        await category_subcategory_model.destroy({
            where: { id_subcategory: id_subcategory },
            transaction: t
        });

        // Delete the subcategory
        await subcategory.destroy({ transaction: t });

        await t.commit();

        return { 
            data: id_subcategory,
            message: "La subcategoría se ha eliminado." 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la subcategoría" };
    }
}

async function removeByCategoryId(id_category) {
    const t = await sequelize.transaction();
    
    try {
        // Get all subcategories for this category
        const subcategories = await product_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (subcategories.length > 0) {
            // Delete all category-subcategory associations
            for (const subcategory of subcategories) {
                await category_subcategory_model.destroy({
                    where: { id_subcategory: subcategory.id_subcategory },
                    transaction: t
                });
            }
            
            // Delete all subcategories
            await product_subcategory_model.destroy({
                where: { id_category: id_category },
                transaction: t
            });
        }

        await t.commit();

        return { 
            data: subcategories.length,
            message: `Se eliminaron ${subcategories.length} subcategorías.` 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeByCategoryId() - Error = ", err);
        return { error: "Error al eliminar las subcategorías" };
    }
}

//update: Get subcategories available for a specific shop and category
async function getSubcategoriesForShopAndCategory(id_shop, id_category) {
    try {
        const shop_model = (await import("../../models/shop_model.js")).default;
        
        // Get the shop
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { error: "El comercio no existe", data: [] };
        }
        
        console.log(`Getting subcategories for shop ${id_shop} (type: ${shop.id_type}) and category ${id_category}`);
        
        // Check if this category is allowed for this shop type
        const shopTypeCategoryAssoc = await type_category_model.findOne({
            where: { 
                id_type: shop.id_type,
                id_category: id_category
            }
        });
        
        if (!shopTypeCategoryAssoc) {
            console.log('Category not associated with this shop type');
            return { error: "Esta categoría no está disponible para este tipo de comercio", data: [] };
        }
        
        // Get all subcategory IDs that are associated with this category
        const categorySubcategoryAssociations = await category_subcategory_model.findAll({
            where: { 
                id_category: id_category
            }
        });
        
        if (!categorySubcategoryAssociations || categorySubcategoryAssociations.length === 0) {
            console.log('No subcategories found for this category');
            return { data: [] };
        }
        
        // Extract subcategory IDs from associations
        const subcategoryIds = categorySubcategoryAssociations.map(assoc => assoc.id_subcategory);
        console.log(`Found ${subcategoryIds.length} subcategories for category ${id_category}:`, subcategoryIds);
        
        // Get the subcategory details
        const subcategories = await product_subcategory_model.findAll({
            where: { 
                id_subcategory: subcategoryIds,
                verified_subcategory: true 
            },
            order: [['name_subcategory', 'ASC']]
        });
        
        console.log(`Returning ${subcategories.length} verified subcategories`);
        return { data: subcategories };
        
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getSubcategoriesForShopAndCategory() - Error = ", err);
        return { error: "Error al obtener subcategorías para el comercio y categoría" };
    }
}

export { 
    getAll, 
    getVerified,
    getUnverified,
    getById,
    getByCategoryId,
    create, 
    update, 
    removeById,
    removeByCategoryId,
    getSubcategoriesForShopAndCategory
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getById,
    getByCategoryId,
    create, 
    update, 
    removeById,
    removeByCategoryId,
    getSubcategoriesForShopAndCategory
}