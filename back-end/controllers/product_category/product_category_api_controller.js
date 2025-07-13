import productCategoryController from "./product_category_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await productCategoryController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las categorías"
        });
    }
}

async function getVerified(req, res) {
    try {
        const { error, data } = await productCategoryController.getVerified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getVerified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener categorías verificadas"
        });
    }
}

async function getUnverified(req, res) {
    try {
        const { error, data } = await productCategoryController.getUnverified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getUnverified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener categorías no verificadas"
        });
    }
}

async function getAllWithSubcategories(req, res) {
    try {
        const { error, data } = await productCategoryController.getAllWithSubcategories();
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getAllWithSubcategories() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener categorías con subcategorías"
        });
    }
}

async function getById(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data } = await productCategoryController.getById(id_category);
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener la categoría"
        });
    }
}

async function getSubcategoriesByCategoryId(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, category } = await productCategoryController.getSubcategoriesByCategoryId(id_category);
        res.json({ error, data, category });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getSubcategoriesByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subcategorías de la categoría"
        });
    }
}

async function create(req, res) {
    try {
        const { 
            name_category,
            createdby_category,
            shop_type_ids
        } = req.body;
        
        // Validate required fields
        if (!name_category) {
            return res.status(400).json({
                error: 'El nombre de la categoría es obligatorio'
            });
        }
        
        const categoryData = {
            name_category,
            createdby_category: createdby_category || null
        };
        
        //update: Pass shop_type_ids to the controller
        const { error, data, success } = await productCategoryController.create(categoryData, shop_type_ids);
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> product_category_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la categoría",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const { id_category } = req.params;
        const {
            name_category,
            verified_category
        } = req.body;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_category !== undefined) updateData.name_category = name_category;
        if (verified_category !== undefined) updateData.verified_category = verified_category;
        
        const { error, data } = await productCategoryController.update(id_category, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la categoría",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, message } = await productCategoryController.removeById(id_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> product_category_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la categoría",
            details: err.message 
        });
    }
}

//update: Add function to get categories for a specific shop
async function getCategoriesForShop(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({ 
                error: 'El ID del comercio es obligatorio'
            });
        }
        
        const { error, data } = await productCategoryController.getCategoriesForShop(id_shop);
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_category_api_controller.js - getCategoriesForShop() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener categorías para el comercio"
        });
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
    getCategoriesForShop
}