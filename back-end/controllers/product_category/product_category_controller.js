import product_category_model from "../../models/product_category_model.js";
import product_subcategory_model from "../../models/product_subcategory_model.js";
import type_category_model from "../../models/type_category_model.js";
import sequelize from "../../config/sequelize.js";

async function getAll() {
    try {
        const categories = await product_category_model.findAll({
            order: [['name_category', 'ASC']]
        });

        if (!categories || categories.length === 0) {
            return { error: "No hay categorías registradas", data: [] };
        }

        console.log("-> product_category_controller.js - getAll() - categorías encontradas = ", categories.length);

        return { data: categories };
    } catch (err) {
        console.error("-> product_category_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las categorías" };
    }
}

async function getVerified() {
    try {
        const categories = await product_category_model.findAll({
            where: { verified_category: true },
            order: [['name_category', 'ASC']]
        });

        if (!categories || categories.length === 0) {
            return { error: "No hay categorías verificadas registradas", data: [] };
        }

        console.log("-> product_category_controller.js - getVerified() - categorías verificadas encontradas = ", categories.length);

        return { data: categories };
    } catch (err) {
        console.error("-> product_category_controller.js - getVerified() - Error = ", err);
        return { error: "Error al obtener categorías verificadas" };
    }
}

async function getUnverified() {
    try {
        const categories = await product_category_model.findAll({
            where: { verified_category: false },
            order: [['name_category', 'ASC']]
        });

        if (!categories || categories.length === 0) {
            return { error: "No hay categorías no verificadas registradas", data: [] };
        }

        console.log("-> product_category_controller.js - getUnverified() - categorías no verificadas encontradas = ", categories.length);

        return { data: categories };
    } catch (err) {
        console.error("-> product_category_controller.js - getUnverified() - Error = ", err);
        return { error: "Error al obtener categorías no verificadas" };
    }
}

async function getWithSubcategories() {
    try {
        const categories = await product_category_model.findAll({
            where: { verified_category: true },
            order: [['name_category', 'ASC']]
        });

        if (!categories || categories.length === 0) {
            return { error: "No hay categorías verificadas registradas", data: {} };
        }

        // Build object with categories as keys and their subcategories as values
        const categoriesWithSubcategories = {};
        
        for (const category of categories) {
            const subcategories = await product_subcategory_model.findAll({
                where: { 
                    id_category: category.id_category,
                    verified_subcategory: true 
                },
                order: [['name_subcategory', 'ASC']]
            });
            
            categoriesWithSubcategories[category.name_category] = subcategories.map(sub => sub.name_subcategory);
        }

        return { data: categoriesWithSubcategories };
    } catch (err) {
        console.error("-> product_category_controller.js - getWithSubcategories() - Error = ", err);
        return { error: "Error al obtener categorías con subcategorías" };
    }
}

async function getById(id_category) {
    try {
        const category = await product_category_model.findByPk(id_category);

        if (!category) {
            return { error: "Categoría no encontrada" };
        }

        return { data: category };
    } catch (err) {
        console.error("-> product_category_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la categoría" };
    }
}

async function create(categoryData) {
    const t = await sequelize.transaction();
    
    try {
        // Check if category already exists
        const existingCategory = await product_category_model.findOne({ 
            where: { name_category: categoryData.name_category } 
        });

        if (existingCategory) {
            await t.rollback();
            console.error("Ya existe una categoría con ese nombre");
            return { 
                error: "Ya existe una categoría con ese nombre"
            };
        }

        //update: Validate that id_type is provided
        if (!categoryData.id_type) {
            await t.rollback();
            return { 
                error: "El tipo de comercio es obligatorio"
            };
        }

        // Create the category with verified_category: false by default
        const category = await product_category_model.create({
            name_category: categoryData.name_category,
            createdby_category: categoryData.createdby_category || null,
            verified_category: false
        }, { transaction: t });
        
        //update: Create association with the shop type
        await type_category_model.create({
            id_type: categoryData.id_type,
            id_category: category.id_category
        }, { transaction: t });
        
        console.log(`Created association for category ${category.id_category} with shop type: ${categoryData.id_type}`);
        
        await t.commit();
        
        return { 
            success: "¡Categoría creada!",
            data: category
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_category_controller.js - create() - Error al crear la categoría =", err);
        return { error: "Error al crear la categoría." };
    }
}

//update: Fixed parameter name from 'id' to 'id_category'
async function update(id_category, categoryData) {
    try {
        const category = await product_category_model.findByPk(id_category);
        
        if (!category) {
            console.log("Categoría no encontrada con id:", id_category);
            return { error: "Categoría no encontrada" };
        }

        // Check if new name already exists (if name is being changed)
        if (categoryData.name_category && categoryData.name_category !== category.name_category) {
            const existingCategory = await product_category_model.findOne({ 
                where: { name_category: categoryData.name_category } 
            });

            if (existingCategory) {
                return { error: "Ya existe una categoría con ese nombre" };
            }
        }

        await category.update(categoryData);
        
        const updatedCategory = await product_category_model.findByPk(id_category);
        
        return { data: updatedCategory };
    } catch (err) {
        console.error("Error al actualizar la categoría =", err);
        return { error: "Error al actualizar la categoría" };
    }
}

async function removeById(id_category) {
    const t = await sequelize.transaction();
    
    try {
        if (!id_category) {
            await t.rollback();
            return { error: "Categoría no encontrada" };
        }

        const category = await product_category_model.findByPk(id_category);
        
        if (!category) {
            await t.rollback();
            return { 
                error: "Categoría no encontrada",
            };
        }

        // Check if there are subcategories for this category
        const subcategories = await product_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (subcategories && subcategories.length > 0) {
            await t.rollback();
            return { 
                error: "No se puede eliminar la categoría porque tiene subcategorías asociadas"
            };
        }

        // Delete shop type associations first
        await type_category_model.destroy({
            where: { id_category: id_category },
            transaction: t
        });

        // Delete the category
        await category.destroy({ transaction: t });

        await t.commit();

        return { 
            data: id_category,
            message: "La categoría se ha eliminado." 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_category_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la categoría" };
    }
}

async function getCategoriesForShop(id_shop) {
    try {
        const shop_model = (await import("../../models/shop_model.js")).default;
        
        // Get the shop
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { error: "El comercio no existe", data: [] };
        }
        
        console.log(`Getting categories for shop ${id_shop} (type: ${shop.id_type})`);
        
        // Get all category IDs that are associated with this shop type
        const shopTypeCategoryAssociations = await type_category_model.findAll({
            where: { id_type: shop.id_type }
        });
        
        if (!shopTypeCategoryAssociations || shopTypeCategoryAssociations.length === 0) {
            console.log('No category restrictions found for this shop type - returning all verified categories');
            // If no associations exist, return all verified categories (backward compatibility)
            const allCategories = await product_category_model.findAll({
                where: { verified_category: true },
                order: [['name_category', 'ASC']]
            });
            return { data: allCategories };
        }
        
        // Extract category IDs from associations
        const allowedCategoryIds = shopTypeCategoryAssociations.map(assoc => assoc.id_category);
        console.log(`Found ${allowedCategoryIds.length} allowed categories for shop type ${shop.id_type}:`, allowedCategoryIds);
        
        // Get only the categories that are allowed for this shop type
        const categories = await product_category_model.findAll({
            where: { 
                id_category: allowedCategoryIds,
                verified_category: true 
            },
            order: [['name_category', 'ASC']]
        });
        
        console.log(`Returning ${categories.length} categories for shop`);
        return { data: categories };
        
    } catch (err) {
        console.error("-> product_category_controller.js - getCategoriesForShop() - Error = ", err);
        return { error: "Error al obtener categorías para el comercio" };
    }
}

export { 
    getAll, 
    getVerified,
    getUnverified,
    getWithSubcategories,
    getById,
    create, 
    update, 
    removeById,
    getCategoriesForShop
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getWithSubcategories,
    getById,
    create, 
    update, 
    removeById,
    getCategoriesForShop
}