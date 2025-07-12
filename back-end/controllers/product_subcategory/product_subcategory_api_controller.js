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

async function update(req, res) {
    try {
        const { id_subcategory } = req.params;
        const {
            name_subcategory,
            id_category,
            verified_subcategory
        } = req.body;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subcategory !== undefined) updateData.name_subcategory = name_subcategory;
        if (id_category !== undefined) updateData.id_category = id_category;
        if (verified_subcategory !== undefined) updateData.verified_subcategory = verified_subcategory;
        
        const { error, data } = await productSubcategoryController.update(id_subcategory, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la subcategoría",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data, message } = await productSubcategoryController.removeById(id_subcategory);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la subcategoría",
            details: err.message 
        });
    }
}

async function removeByCategoryId(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, message } = await productSubcategoryController.removeByCategoryId(id_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> product_subcategory_api_controller.js - removeByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las subcategorías de la categoría",
            details: err.message 
        });
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
    removeByCategoryId
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
    removeByCategoryId
}