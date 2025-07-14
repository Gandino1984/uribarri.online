import product_subcategory_model from "../../models/product_subcategory_model.js";
import product_category_model from "../../models/product_category_model.js";
import product_model from "../../models/product_model.js";
import { Op } from 'sequelize';

async function getAll() {
    try {
        const subcategories = await product_subcategory_model.findAll({
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías registradas", data: [] };
        }

        // Manually fetch category information for each subcategory
        const subcategoriesWithCategory = [];
        for (const subcategory of subcategories) {
            const category = await product_category_model.findByPk(subcategory.id_category);
            subcategoriesWithCategory.push({
                ...subcategory.toJSON(),
                category: category ? {
                    id_category: category.id_category,
                    name_category: category.name_category
                } : null
            });
        }

        console.log("-> product_subcategory_controller.js - getAll() - subcategorías encontradas = ", subcategoriesWithCategory.length);

        return { data: subcategoriesWithCategory };
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

        // Manually fetch category information for each subcategory
        const subcategoriesWithCategory = [];
        for (const subcategory of subcategories) {
            const category = await product_category_model.findByPk(subcategory.id_category);
            subcategoriesWithCategory.push({
                ...subcategory.toJSON(),
                category: category ? {
                    id_category: category.id_category,
                    name_category: category.name_category
                } : null
            });
        }

        console.log("-> product_subcategory_controller.js - getVerified() - subcategorías verificadas encontradas = ", subcategoriesWithCategory.length);

        return { data: subcategoriesWithCategory };
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

        // Manually fetch category information for each subcategory
        const subcategoriesWithCategory = [];
        for (const subcategory of subcategories) {
            const category = await product_category_model.findByPk(subcategory.id_category);
            subcategoriesWithCategory.push({
                ...subcategory.toJSON(),
                category: category ? {
                    id_category: category.id_category,
                    name_category: category.name_category
                } : null
            });
        }

        console.log("-> product_subcategory_controller.js - getUnverified() - subcategorías no verificadas encontradas = ", subcategoriesWithCategory.length);

        return { data: subcategoriesWithCategory };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getUnverified() - Error = ", err);
        return { error: "Error al obtener subcategorías no verificadas" };
    }
}

async function getByCategoryId(id_category) {
    try {
        const subcategories = await product_subcategory_model.findAll({
            where: { 
                id_category: id_category,
                verified_subcategory: true 
            },
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { error: "No hay subcategorías registradas para esta categoría", data: [] };
        }

        return { data: subcategories };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getByCategoryId() - Error = ", err);
        return { error: "Error al obtener subcategorías por categoría" };
    }
}

async function getById(id_subcategory) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id_subcategory);

        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        // Manually fetch the category
        const category = await product_category_model.findByPk(subcategory.id_category);
        
        const subcategoryWithCategory = {
            ...subcategory.toJSON(),
            category: category ? {
                id_category: category.id_category,
                name_category: category.name_category
            } : null
        };

        return { data: subcategoryWithCategory };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la subcategoría" };
    }
}

async function create(subcategoryData) {
    try {
        // Check if subcategory already exists for this category
        const existingSubcategory = await product_subcategory_model.findOne({ 
            where: { 
                name_subcategory: subcategoryData.name_subcategory,
                id_category: subcategoryData.id_category
            } 
        });

        if (existingSubcategory) {
            console.error("Ya existe una subcategoría con ese nombre para esta categoría");
            return { 
                error: "Ya existe una subcategoría con ese nombre para esta categoría"
            };
        }

        // Verify that the category exists
        const category = await product_category_model.findByPk(subcategoryData.id_category);
        if (!category) {
            return { error: "La categoría especificada no existe" };
        }

        // Create the subcategory with verified_subcategory: false by default
        const subcategory = await product_subcategory_model.create({
            ...subcategoryData,
            verified_subcategory: false
        });
        
        return { 
            success: "¡Subcategoría creada!",
            data: subcategory
        };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - create() - Error al crear la subcategoría =", err);
        return { error: "Error al crear la subcategoría." };
    }
}

async function update(id, subcategoryData) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id);
        
        if (!subcategory) {
            console.log("Subcategoría no encontrada con id:", id);
            return { error: "Subcategoría no encontrada" };
        }

        // Check if new name already exists for this category (if name is being changed)
        if (subcategoryData.name_subcategory && 
            (subcategoryData.name_subcategory !== subcategory.name_subcategory || 
             subcategoryData.id_category !== subcategory.id_category)) {
            
            const existingSubcategory = await product_subcategory_model.findOne({ 
                where: { 
                    name_subcategory: subcategoryData.name_subcategory,
                    id_category: subcategoryData.id_category || subcategory.id_category,
                    id_subcategory: { [Op.ne]: id }
                } 
            });

            if (existingSubcategory) {
                return { error: "Ya existe una subcategoría con ese nombre para esta categoría" };
            }
        }

        // If changing category, verify the new category exists
        if (subcategoryData.id_category && subcategoryData.id_category !== subcategory.id_category) {
            const category = await product_category_model.findByPk(subcategoryData.id_category);
            if (!category) {
                return { error: "La categoría especificada no existe" };
            }
        }

        await subcategory.update(subcategoryData);
        
        // Fetch updated subcategory with category info
        const updatedSubcategory = await product_subcategory_model.findByPk(id);
        const category = await product_category_model.findByPk(updatedSubcategory.id_category);
        
        const subcategoryWithCategory = {
            ...updatedSubcategory.toJSON(),
            category: category ? {
                id_category: category.id_category,
                name_category: category.name_category
            } : null
        };
        
        return { data: subcategoryWithCategory };
    } catch (err) {
        console.error("Error al actualizar la subcategoría =", err);
        return { error: "Error al actualizar la subcategoría" };
    }
}

async function removeById(id_subcategory) {
    try {
        if (!id_subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        const subcategory = await product_subcategory_model.findByPk(id_subcategory);
        
        if (!subcategory) {
            return { 
                error: "Subcategoría no encontrada",
            };
        }

        // Manually check if there are products using this subcategory
        const products = await product_model.findAll({
            where: { id_subcategory: id_subcategory }
        });
        
        if (products && products.length > 0) {
            return { 
                error: "No se puede eliminar la subcategoría porque hay productos que la utilizan"
            };
        }

        // Delete the subcategory
        await subcategory.destroy();

        return { 
            data: id_subcategory,
            message: "La subcategoría se ha eliminado." 
        };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la subcategoría" };
    }
}

async function removeByCategoryId(id_category) {
    try {
        if (!id_category) {
            return { error: "El ID de la categoría es obligatorio" };
        }

        // Verify that the category exists
        const category = await product_category_model.findByPk(id_category);
        if (!category) {
            return { error: "La categoría especificada no existe" };
        }

        // Find all subcategories for this category
        const subcategories = await product_subcategory_model.findAll({
            where: { id_category: id_category }
        });

        if (!subcategories || subcategories.length === 0) {
            return { 
                error: "No hay subcategorías para eliminar en esta categoría",
                data: { count: 0 }
            };
        }

        // Check if any of the subcategories are being used by products
        const subcategoryIds = subcategories.map(subcategory => subcategory.id_subcategory);
        const products = await product_model.findAll({
            where: { id_subcategory: subcategoryIds }
        });

        if (products && products.length > 0) {
            return { 
                error: "No se pueden eliminar las subcategorías porque hay productos que las utilizan"
            };
        }

        // Delete all subcategories for this category
        const deletedCount = await product_subcategory_model.destroy({
            where: { id_category: id_category }
        });

        return { 
            data: { 
                count: deletedCount,
                id_category: id_category
            },
            message: `Se han eliminado ${deletedCount} subcategoría(s) de la categoría especificada.` 
        };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - removeByCategoryId() - Error = ", err);
        return { error: "Error al eliminar las subcategorías de la categoría" };
    }
}

//update: Add function to get subcategories available for a shop and category
async function getSubcategoriesForShopAndCategory(id_shop, id_category) {
    try {
        const shop_model = (await import("../../models/shop_model.js")).default;
        const shop_type_category_model = (await import("../../models/shop_type_category_model.js")).default;
        
        // Get the shop
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { error: "El comercio no existe", data: [] };
        }
        
        // First check if this category is available for this shop type
        const categoryAssociation = await shop_type_category_model.findOne({
            where: { 
                id_type: shop.id_type,
                id_category: id_category
            }
        });
        
        // If no association exists, check if there are any associations at all for this shop type
        const hasAnyAssociations = await shop_type_category_model.findOne({
            where: { id_type: shop.id_type }
        });
        
        // If there are no associations at all (backward compatibility) or the category is associated
        if (!hasAnyAssociations || categoryAssociation) {
            // Get all verified subcategories for this category
            const subcategories = await product_subcategory_model.findAll({
                where: { 
                    id_category: id_category,
                    verified_subcategory: true 
                },
                order: [['name_subcategory', 'ASC']]
            });
            
            return { data: subcategories };
        } else {
            // This category is not available for this shop type
            return { 
                error: "Esta categoría no está disponible para este tipo de comercio", 
                data: [] 
            };
        }
    } catch (err) {
        console.error("-> product_subcategory_controller.js - getSubcategoriesForShopAndCategory() - Error = ", err);
        return { error: "Error al obtener subcategorías para el comercio y categoría" };
    }
}

export { 
    getAll, 
    getVerified,
    getUnverified,
    getByCategoryId,
    getById,
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
    getByCategoryId,
    getById,
    create, 
    update, 
    removeById,
    removeByCategoryId,
    getSubcategoriesForShopAndCategory
}