import productSubcategoryController from "./product_subcategory_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await productSubcategoryController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las subcategorías"
        });
    }
}

async function getVerified(req, res) {
    try {
        const { error, data } = await productSubcategoryController.getVerified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getVerified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subcategorías verificadas"
        });
    }
}

async function getUnverified(req, res) {
    try {
        const { error, data } = await productSubcategoryController.getUnverified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getUnverified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subcategorías no verificadas"
        });
    }
}

async function getById(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data } = await productSubcategoryController.getById(id_subcategory);
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener la subcategoría"
        });
    }
}

async function getByCategoryId(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data } = await productSubcategoryController.getByCategoryId(id_category);
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subcategorías por categoría"
        });
    }
}

async function create(req, res) {
    try {
        const { 
            name_subcategory,
            id_category,
            createdby_subcategory
        } = req.body;
        
        // Validate required fields
        if (!name_subcategory || !id_category) {
            return res.status(400).json({
                error: 'El nombre de la subcategoría y el ID de la categoría son obligatorios'
            });
        }
        
        const subcategoryData = {
            name_subcategory,
            id_category,
            createdby_subcategory: createdby_subcategory || null
        };
        
        const { error, data, success } = await productSubcategoryController.create(subcategoryData);
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la subcategoría",
            details: err.message
        });
    }
}

//update: Modified to include warning when products are using the subcategory
async function update(req, res) {
    try {
        const { id_subcategory } = req.params;
        const {
            name_subcategory,
            verified_subcategory
        } = req.body;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subcategory !== undefined) updateData.name_subcategory = name_subcategory;
        if (verified_subcategory !== undefined) updateData.verified_subcategory = verified_subcategory;
        
        const { error, data, success, warning, affectedProducts } = await productSubcategoryController.update(id_subcategory, updateData);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedProducts 
            });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la subcategoría",
            details: err.message
        });
    }
}

//update: New endpoint for cascade update
async function updateCascade(req, res) {
    try {
        const { id_subcategory } = req.params;
        const {
            name_subcategory,
            verified_subcategory
        } = req.body;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subcategory !== undefined) updateData.name_subcategory = name_subcategory;
        if (verified_subcategory !== undefined) updateData.verified_subcategory = verified_subcategory;
        
        const { error, data, success, affectedProducts, affectedProductsList } = await productSubcategoryController.updateCascade(id_subcategory, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            error, 
            data, 
            success,
            affectedProducts,
            affectedProductsList 
        });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - updateCascade() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la subcategoría en cascada",
            details: err.message
        });
    }
}

//update: Modified to include warning when products are using the subcategory
async function removeById(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data, success, warning, affectedProducts } = await productSubcategoryController.removeById(id_subcategory);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedProducts 
            });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la subcategoría",
            details: err.message 
        });
    }
}

//update: New endpoint for cascade delete
async function removeCascade(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data, success, warning, deletedProducts } = await productSubcategoryController.removeCascade(id_subcategory);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            data, 
            success,
            warning,
            deletedProducts 
        });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeCascade() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la subcategoría en cascada",
            details: err.message 
        });
    }
}

//update: Modified to include warning when products are using the subcategories
async function removeByCategoryId(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, success, warning, affectedProducts } = await productSubcategoryController.removeByCategoryId(id_category);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedProducts 
            });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las subcategorías",
            details: err.message 
        });
    }
}

//update: New endpoint for cascade delete by category
async function removeByCategoryIdCascade(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, success, warning, deletedProducts } = await productSubcategoryController.removeByCategoryIdCascade(id_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            data, 
            success,
            warning,
            deletedProducts 
        });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeByCategoryIdCascade() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las subcategorías en cascada",
            details: err.message 
        });
    }
}

async function getSubcategoriesForShopAndCategory(req, res) {
    try {
        const { id_shop, id_category } = req.params;
        
        if (!id_shop || !id_category) {
            return res.status(400).json({ 
                error: 'El ID del comercio y el ID de la categoría son obligatorios'
            });
        }
        
        const { error, data } = await productSubcategoryController.getSubcategoriesForShopAndCategory(id_shop, id_category);
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - getSubcategoriesForShopAndCategory() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subcategorías para el comercio y categoría"
        });
    }
}

//update: New endpoint to check affected products before operations
async function checkAffectedProducts(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { count, products } = await productSubcategoryController.checkAffectedProducts(id_subcategory);
        
        res.json({ 
            count,
            products
        });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - checkAffectedProducts() - Error =", err);
        res.status(500).json({ 
            error: "Error al verificar productos afectados",
            details: err.message 
        });
    }
}

//update: New endpoint to migrate products from one subcategory to another
async function migrateProducts(req, res) {
    try {
        const { oldSubcategoryId, newSubcategoryId } = req.body;
        
        if (!oldSubcategoryId || !newSubcategoryId) {
            return res.status(400).json({ 
                error: 'Los IDs de la subcategoría origen y destino son obligatorios'
            });
        }
        
        if (oldSubcategoryId === newSubcategoryId) {
            return res.status(400).json({ 
                error: 'La subcategoría origen y destino no pueden ser la misma'
            });
        }
        
        const { error, success, migratedProducts, fromSubcategory, toSubcategory } = await productSubcategoryController.migrateProductsToNewSubcategory(oldSubcategoryId, newSubcategoryId);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            success,
            migratedProducts,
            fromSubcategory,
            toSubcategory
        });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - migrateProducts() - Error =", err);
        res.status(500).json({ 
            error: "Error al migrar productos entre subcategorías",
            details: err.message 
        });
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
    migrateProducts
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
    migrateProducts
}