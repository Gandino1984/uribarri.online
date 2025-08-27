import product_subcategory_model from "../../models/product_subcategory_model.js";
import category_subcategory_model from "../../models/category_subcategory_model.js";
import type_category_model from "../../models/type_category_model.js";
import product_model from "../../models/product_model.js";
import sequelize from "../../config/sequelize.js";
import { Op } from 'sequelize';

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
        // Get all subcategory IDs associated with this category from the junction table
        const categorySubcategoryRelations = await category_subcategory_model.findAll({
            where: { id_category: id_category }
        });

        if (!categorySubcategoryRelations || categorySubcategoryRelations.length === 0) {
            console.log(`No subcategories found for category ${id_category}`);
            return { data: [] };
        }

        // Extract subcategory IDs
        const subcategoryIds = categorySubcategoryRelations.map(rel => rel.id_subcategory);
        console.log(`Found ${subcategoryIds.length} subcategory IDs for category ${id_category}:`, subcategoryIds);

        // Get the actual subcategory data
        const subcategories = await product_subcategory_model.findAll({
            where: { 
                id_subcategory: subcategoryIds,
                verified_subcategory: true 
            },
            order: [['name_subcategory', 'ASC']]
        });

        console.log(`Returning ${subcategories.length} verified subcategories for category ${id_category}`);
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

        // Check if subcategory with same name already exists
        const existingSubcategory = await product_subcategory_model.findOne({ 
            where: { 
                name_subcategory: name_subcategory
            } 
        });

        if (existingSubcategory) {
            await t.rollback();
            return { 
                error: "Ya existe una subcategoría con ese nombre"
            };
        }

        // Create the subcategory
        const subcategory = await product_subcategory_model.create({
            name_subcategory,
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

//update: Modified to check for products using this subcategory
async function update(id, subcategoryData) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id);
        
        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        // Check if new name already exists (if name is being changed)
        if (subcategoryData.name_subcategory && subcategoryData.name_subcategory !== subcategory.name_subcategory) {
            const existingSubcategory = await product_subcategory_model.findOne({ 
                where: { 
                    name_subcategory: subcategoryData.name_subcategory,
                    id_subcategory: { [Op.ne]: id }
                } 
            });

            if (existingSubcategory) {
                return { error: "Ya existe una subcategoría con ese nombre" };
            }
        }

        //update: Check if there are products using this subcategory
        const productsUsingSubcategory = await product_model.findAll({
            where: { id_subcategory: id }
        });
        
        if (productsUsingSubcategory && productsUsingSubcategory.length > 0) {
            return { 
                error: `No se puede actualizar la subcategoría porque hay ${productsUsingSubcategory.length} producto(s) que la utilizan`,
                warning: true,
                affectedProducts: productsUsingSubcategory.length
            };
        }

        await subcategory.update(subcategoryData);
        
        return { 
            data: subcategory,
            success: "Subcategoría actualizada correctamente"
        };
    } catch (err) {
        console.error("Error al actualizar la subcategoría =", err);
        return { error: "Error al actualizar la subcategoría" };
    }
}

//update: New function for cascade update
async function updateCascade(id, subcategoryData) {
    try {
        const subcategory = await product_subcategory_model.findByPk(id);
        
        if (!subcategory) {
            return { error: "Subcategoría no encontrada" };
        }

        // Store the old subcategory data for logging
        const oldSubcategoryName = subcategory.name_subcategory;
        const oldVerifiedStatus = subcategory.verified_subcategory;

        // Check if new name already exists (if name is being changed)
        if (subcategoryData.name_subcategory && subcategoryData.name_subcategory !== subcategory.name_subcategory) {
            const existingSubcategory = await product_subcategory_model.findOne({ 
                where: { 
                    name_subcategory: subcategoryData.name_subcategory,
                    id_subcategory: { [Op.ne]: id }
                } 
            });

            if (existingSubcategory) {
                return { error: "Ya existe una subcategoría con ese nombre" };
            }
        }

        //update: Get all products that will be affected by this change
        const productsUsingSubcategory = await product_model.findAll({
            where: { id_subcategory: id },
            attributes: ['id_product', 'name_product']
        });

        // Update the subcategory itself
        await subcategory.update(subcategoryData);
        
        // Log the changes
        const changes = [];
        if (subcategoryData.name_subcategory && subcategoryData.name_subcategory !== oldSubcategoryName) {
            changes.push(`nombre cambiado de "${oldSubcategoryName}" a "${subcategoryData.name_subcategory}"`);
        }
        if (subcategoryData.verified_subcategory !== undefined && subcategoryData.verified_subcategory !== oldVerifiedStatus) {
            changes.push(`estado de verificación cambiado a ${subcategoryData.verified_subcategory ? 'verificado' : 'no verificado'}`);
        }
        
        return { 
            data: subcategory,
            success: `Subcategoría actualizada correctamente (${changes.join(', ')}). ${productsUsingSubcategory.length} producto(s) reflejan estos cambios automáticamente.`,
            affectedProducts: productsUsingSubcategory.length,
            affectedProductsList: productsUsingSubcategory.map(product => ({
                id_product: product.id_product,
                name_product: product.name_product
            }))
        };
    } catch (err) {
        console.error("Error al actualizar la subcategoría en cascada =", err);
        return { error: "Error al actualizar la subcategoría en cascada" };
    }
}

//update: Modified to check for products using this subcategory
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

        //update: Check if there are products using this subcategory
        const products = await product_model.findAll({
            where: { id_subcategory: id_subcategory }
        });
        
        if (products && products.length > 0) {
            await t.rollback();
            return { 
                error: `No se puede eliminar la subcategoría porque hay ${products.length} producto(s) que la utilizan`,
                warning: true,
                affectedProducts: products.length
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
            success: "La subcategoría se ha eliminado correctamente." 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la subcategoría" };
    }
}

//update: New function for cascade delete (deletes subcategory and all products using it)
async function removeCascade(id_subcategory) {
    const t = await sequelize.transaction();
    
    try {
        const subcategory = await product_subcategory_model.findByPk(id_subcategory);
        
        if (!subcategory) {
            await t.rollback();
            return { 
                error: "Subcategoría no encontrada",
            };
        }

        //update: Get all products using this subcategory before deletion
        const products = await product_model.findAll({
            where: { id_subcategory: id_subcategory }
        });
        
        const productCount = products ? products.length : 0;
        
        //update: Delete all products using this subcategory
        if (products && products.length > 0) {
            console.log(`Eliminando ${products.length} producto(s) que usan la subcategoría ${id_subcategory}`);
            
            for (const product of products) {
                await product.destroy({ transaction: t });
            }
        }

        // Delete category-subcategory associations
        await category_subcategory_model.destroy({
            where: { id_subcategory: id_subcategory },
            transaction: t
        });

        // Delete the subcategory
        await subcategory.destroy({ transaction: t });

        await t.commit();

        return { 
            data: id_subcategory,
            success: `La subcategoría ha sido eliminada junto con ${productCount} producto(s).`,
            warning: productCount > 0 ? `ADVERTENCIA: Se han eliminado ${productCount} producto(s) permanentemente.` : null,
            deletedProducts: productCount
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeCascade() - Error = ", err);
        return { error: "Error al eliminar la subcategoría en cascada" };
    }
}

//update: Modified to check for products before deleting associations
async function removeByCategoryId(id_category) {
    const t = await sequelize.transaction();
    
    try {
        // Get all subcategory IDs associated with this category
        const categorySubcategoryRelations = await category_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (categorySubcategoryRelations.length === 0) {
            await t.rollback();
            return { 
                error: "No hay subcategorías asociadas a esta categoría",
                data: 0
            };
        }

        // Extract subcategory IDs
        const subcategoryIds = categorySubcategoryRelations.map(rel => rel.id_subcategory);

        //update: Check if any products are using these subcategories
        const productsUsingSubcategories = await product_model.findAll({
            where: { 
                id_subcategory: {
                    [Op.in]: subcategoryIds
                }
            }
        });

        if (productsUsingSubcategories && productsUsingSubcategories.length > 0) {
            await t.rollback();
            return { 
                error: `No se pueden eliminar las asociaciones porque hay ${productsUsingSubcategories.length} producto(s) que utilizan estas subcategorías`,
                warning: true,
                affectedProducts: productsUsingSubcategories.length
            };
        }

        // Delete all category-subcategory associations for this category
        await category_subcategory_model.destroy({
            where: { id_category: id_category },
            transaction: t
        });

        await t.commit();

        return { 
            data: categorySubcategoryRelations.length,
            success: `Se eliminaron ${categorySubcategoryRelations.length} asociaciones de subcategorías.` 
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeByCategoryId() - Error = ", err);
        return { error: "Error al eliminar las asociaciones de subcategorías" };
    }
}

//update: New function for cascade delete by category (deletes associations and products)
async function removeByCategoryIdCascade(id_category) {
    const t = await sequelize.transaction();
    
    try {
        // Get all subcategory IDs associated with this category
        const categorySubcategoryRelations = await category_subcategory_model.findAll({
            where: { id_category: id_category }
        });
        
        if (categorySubcategoryRelations.length === 0) {
            await t.rollback();
            return { 
                error: "No hay subcategorías asociadas a esta categoría",
                data: 0
            };
        }

        // Extract subcategory IDs
        const subcategoryIds = categorySubcategoryRelations.map(rel => rel.id_subcategory);

        //update: Get all products using these subcategories before deletion
        const productsUsingSubcategories = await product_model.findAll({
            where: { 
                id_subcategory: {
                    [Op.in]: subcategoryIds
                }
            }
        });

        const productCount = productsUsingSubcategories ? productsUsingSubcategories.length : 0;

        //update: Delete all products using these subcategories
        if (productsUsingSubcategories && productsUsingSubcategories.length > 0) {
            console.log(`Eliminando ${productsUsingSubcategories.length} producto(s) que usan subcategorías de la categoría ${id_category}`);
            
            for (const product of productsUsingSubcategories) {
                await product.destroy({ transaction: t });
            }
        }

        // Delete all category-subcategory associations for this category
        await category_subcategory_model.destroy({
            where: { id_category: id_category },
            transaction: t
        });

        await t.commit();

        return { 
            data: categorySubcategoryRelations.length,
            success: `Se eliminaron ${categorySubcategoryRelations.length} asociaciones de subcategorías y ${productCount} producto(s).`,
            warning: productCount > 0 ? `ADVERTENCIA: Se han eliminado ${productCount} producto(s) permanentemente.` : null,
            deletedProducts: productCount
        };
    } catch (err) {
        await t.rollback();
        console.error("-> product_subcategory_controller.js - removeByCategoryIdCascade() - Error = ", err);
        return { error: "Error al eliminar las asociaciones de subcategorías en cascada" };
    }
}

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

//update: New function to check products affected by subcategory operations
async function checkAffectedProducts(id_subcategory) {
    try {
        const products = await product_model.findAll({
            where: { id_subcategory: id_subcategory },
            attributes: ['id_product', 'name_product']
        });
        
        return {
            count: products ? products.length : 0,
            products: products || []
        };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - checkAffectedProducts() - Error = ", err);
        return {
            count: 0,
            products: []
        };
    }
}

//update: New function to migrate products from one subcategory to another
async function migrateProductsToNewSubcategory(oldSubcategoryId, newSubcategoryId) {
    try {
        // Verify both subcategories exist
        const oldSubcategory = await product_subcategory_model.findByPk(oldSubcategoryId);
        const newSubcategory = await product_subcategory_model.findByPk(newSubcategoryId);
        
        if (!oldSubcategory) {
            return { error: "La subcategoría origen no existe" };
        }
        
        if (!newSubcategory) {
            return { error: "La subcategoría destino no existe" };
        }
        
        // Get all products with the old subcategory
        const productsToMigrate = await product_model.findAll({
            where: { id_subcategory: oldSubcategoryId }
        });
        
        if (!productsToMigrate || productsToMigrate.length === 0) {
            return { 
                error: "No hay productos para migrar",
                data: []
            };
        }
        
        // Update all products to the new subcategory
        const updatePromises = productsToMigrate.map(product => 
            product.update({ id_subcategory: newSubcategoryId })
        );
        
        await Promise.all(updatePromises);
        
        console.log(`-> product_subcategory_controller.js - migrateProductsToNewSubcategory() - ${productsToMigrate.length} productos migrados de la subcategoría ${oldSubcategoryId} a la subcategoría ${newSubcategoryId}`);
        
        return { 
            success: `${productsToMigrate.length} producto(s) migrados exitosamente de "${oldSubcategory.name_subcategory}" a "${newSubcategory.name_subcategory}"`,
            migratedProducts: productsToMigrate.length,
            fromSubcategory: {
                id_subcategory: oldSubcategory.id_subcategory,
                name_subcategory: oldSubcategory.name_subcategory
            },
            toSubcategory: {
                id_subcategory: newSubcategory.id_subcategory,
                name_subcategory: newSubcategory.name_subcategory
            }
        };
    } catch (err) {
        console.error("-> product_subcategory_controller.js - migrateProductsToNewSubcategory() - Error = ", err);
        return { error: "Error al migrar productos a nueva subcategoría" };
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
    updateCascade,
    removeById,
    removeCascade,
    removeByCategoryId,
    removeByCategoryIdCascade,
    getSubcategoriesForShopAndCategory,
    checkAffectedProducts,
    migrateProductsToNewSubcategory
}

export default { 
    getAll, 
    getVerified,
    getUnverified,
    getById,
    getByCategoryId,
    create, 
    update,
    updateCascade,
    removeById,
    removeCascade,
    removeByCategoryId,
    removeByCategoryIdCascade,
    getSubcategoriesForShopAndCategory,
    checkAffectedProducts,
    migrateProductsToNewSubcategory
}