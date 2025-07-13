import product_category_model from "../../models/product_category_model.js";
import product_subcategory_model from "../../models/product_subcategory_model.js";
import product_model from "../../models/product_model.js";
import { Op } from 'sequelize';

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

async function getAllWithSubcategories() {
    try {
        const categories = await product_category_model.findAll({
            where: { verified_category: true },
            order: [['name_category', 'ASC']]
        });

        if (!categories || categories.length === 0) {
            return { error: "No hay categorías registradas", data: [] };
        }

        // Manually fetch subcategories for each category
        const categoriesAndSubcategories = {};
        
        for (const category of categories) {
            const subcategories = await product_subcategory_model.findAll({
                where: { 
                    id_category: category.id_category,
                    verified_subcategory: true 
                },
                order: [['name_subcategory', 'ASC']]
            });
            
            categoriesAndSubcategories[category.name_category] = subcategories.map(subcategory => subcategory.name_subcategory);
        }

        console.log("-> product_category_controller.js - getAllWithSubcategories() - categorías con subcategorías encontradas");

        return { data: categoriesAndSubcategories };
    } catch (err) {
        console.error("-> product_category_controller.js - getAllWithSubcategories() - Error = ", err);
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

async function getSubcategoriesByCategoryId(id_category) {
    try {
        // Verify that the category exists
        const category = await product_category_model.findByPk(id_category);
        
        if (!category) {
            return { error: "La categoría especificada no existe" };
        }

        // Get all subcategories for this category (both verified and unverified)
        const subcategories = await product_subcategory_model.findAll({
            where: { 
                id_category: id_category
            },
            order: [['name_subcategory', 'ASC']]
        });

        if (!subcategories || subcategories.length === 0) {
            return { 
                error: "No hay subcategorías registradas para esta categoría", 
                data: [],
                category: {
                    id_category: category.id_category,
                    name_category: category.name_category
                }
            };
        }

        console.log(`-> product_category_controller.js - getSubcategoriesByCategoryId() - ${subcategories.length} subcategorías encontradas para la categoría ${id_category}`);

        return { 
            data: subcategories,
            category: {
                id_category: category.id_category,
                name_category: category.name_category
            }
        };
    } catch (err) {
        console.error("-> product_category_controller.js - getSubcategoriesByCategoryId() - Error = ", err);
        return { error: "Error al obtener subcategorías de la categoría" };
    }
}

async function create(categoryData, shopTypeIds = []) {
    try {
        // Check if category already exists (regardless of verified status)
        const existingCategory = await product_category_model.findOne({ 
            where: { 
                name_category: categoryData.name_category
            } 
        });

        if (existingCategory) {
            console.error("Ya existe una categoría con ese nombre");
            return { 
                error: "Ya existe una categoría con ese nombre"
            };
        }

        // Create the category with verified_category: false by default
        const category = await product_category_model.create({
            ...categoryData,
            verified_category: false
        });
        
        //update: If shop type IDs are provided, create associations
        if (shopTypeIds && shopTypeIds.length > 0) {
            const shop_type_category_model = (await import("../../models/shop_type_category_model.js")).default;
            const type_model = (await import("../../models/type_model.js")).default;
            
            for (const id_type of shopTypeIds) {
                // Verify that the type exists and is verified
                const type = await type_model.findOne({
                    where: {
                        id_type: id_type,
                        verified_type: true
                    }
                });
                
                if (type) {
                    await shop_type_category_model.create({
                        id_type: id_type,
                        id_category: category.id_category
                    });
                }
            }
        }
        
        return { 
            success: "¡Categoría creada!",
            data: category
        };
    } catch (err) {
        console.error("-> product_category_controller.js - create() - Error al crear la categoría =", err);
        return { error: "Error al crear la categoría." };
    }
}

async function update(id, categoryData) {
    try {
        const category = await product_category_model.findByPk(id);
        
        if (!category) {
            console.log("Categoría no encontrada con id:", id);
            return { error: "Categoría no encontrada" };
        }

        // Check if new name already exists (if name is being changed)
        if (categoryData.name_category && categoryData.name_category !== category.name_category) {
            const existingCategory = await product_category_model.findOne({ 
                where: { 
                    name_category: categoryData.name_category,
                    id_category: { [Op.ne]: id },
                    verified_category: true
                } 
            });

            if (existingCategory) {
                return { error: "Ya existe una categoría con ese nombre" };
            }
        }

        await category.update(categoryData);
        
        const updatedCategory = await product_category_model.findByPk(id);
        
        return { data: updatedCategory };
    } catch (err) {
        console.error("Error al actualizar la categoría =", err);
        return { error: "Error al actualizar la categoría" };
    }
}

async function removeById(id_category, cascadeDelete = false) {
    try {
        if (!id_category) {
            return { error: "Categoría no encontrada" };
        }

        const category = await product_category_model.findByPk(id_category);
        
        if (!category) {
            return { 
                error: "Categoría no encontrada",
            };
        }

        // Manually check if there are products using this category
        const products = await product_model.findAll({
            where: { id_category: id_category }
        });
        
        if (products && products.length > 0) {
            return { 
                error: "No se puede eliminar la categoría porque hay productos que la utilizan"
            };
        }

        // Manually check if there are subcategories for this category
        const subcategories = await product_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (subcategories && subcategories.length > 0) {
            if (cascadeDelete) {
                // Delete all subcategories associated with this category
                console.log(`Eliminando ${subcategories.length} subcategorías asociadas a la categoría ${id_category}`);
                
                for (const subcategory of subcategories) {
                    // Check if any products are using this subcategory
                    const productsUsingSubcategory = await product_model.findAll({
                        where: { id_subcategory: subcategory.id_subcategory }
                    });
                    
                    if (productsUsingSubcategory && productsUsingSubcategory.length > 0) {
                        return { 
                            error: `No se puede eliminar la categoría porque la subcategoría "${subcategory.name_subcategory}" está siendo usada por ${productsUsingSubcategory.length} producto(s)`
                        };
                    }
                    
                    // Delete the subcategory
                    await subcategory.destroy();
                }
            } else {
                return { 
                    error: "No se puede eliminar la categoría porque tiene subcategorías asociadas. Use cascadeDelete=true para eliminar también las subcategorías."
                };
            }
        }

        //update: Delete shop type associations for this category
        const shop_type_category_model = (await import("../../models/shop_type_category_model.js")).default;
        await shop_type_category_model.destroy({
            where: { id_category: id_category }
        });

        // Delete the category
        await category.destroy();

        return { 
            data: id_category,
            message: cascadeDelete && subcategories.length > 0 
                ? `La categoría y sus ${subcategories.length} subcategorías han sido eliminadas.`
                : "La categoría se ha eliminado.",
            deletedSubcategories: cascadeDelete ? subcategories.length : 0
        };
    } catch (err) {
        console.error("-> product_category_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la categoría" };
    }
}

async function isCategoryValid(id_category) {
    try {
        const category = await product_category_model.findOne({
            where: {
                id_category: id_category,
                verified_category: true
            }
        });
        
        return !!category;
    } catch (err) {
        console.error("-> product_category_controller.js - isCategoryValid() - Error = ", err);
        return false;
    }
}

//update: Add function to get categories available for a shop
async function getCategoriesForShop(id_shop) {
    try {
        const shop_model = (await import("../../models/shop_model.js")).default;
        const shop_type_category_model = (await import("../../models/shop_type_category_model.js")).default;
        
        // Get the shop
        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { error: "El comercio no existe", data: [] };
        }
        
        // Get all category IDs associated with this shop's type
        const associations = await shop_type_category_model.findAll({
            where: { id_type: shop.id_type }
        });
        
        if (!associations || associations.length === 0) {
            // If no specific associations, return all verified categories (backward compatibility)
            return await getVerified();
        }
        
        // Get the category details for each associated category
        const categoryIds = associations.map(assoc => assoc.id_category);
        const categories = await product_category_model.findAll({
            where: { 
                id_category: categoryIds,
                verified_category: true 
            },
            order: [['name_category', 'ASC']]
        });
        
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
    getAllWithSubcategories,
    getById,
    getSubcategoriesByCategoryId,
    create, 
    update, 
    removeById,
    isCategoryValid,
    getCategoriesForShop
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getAllWithSubcategories,
    getById,
    getSubcategoriesByCategoryId,
    create, 
    update, 
    removeById,
    isCategoryValid,
    getCategoriesForShop
}