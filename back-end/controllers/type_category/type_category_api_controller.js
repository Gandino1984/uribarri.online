import typeCategoryController from "./type_category_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await typeCategoryController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_category_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener las asociaciones tipo-categoría"
        });
    }
}

async function getCategoriesByType(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, type } = await typeCategoryController.getCategoriesByType(id_type);
        res.json({ error, data, type });
    } catch (err) {
        console.error("-> type_category_api_controller.js - getCategoriesByType() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener categorías del tipo"
        });
    }
}

async function getTypesByCategory(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, category } = await typeCategoryController.getTypesByCategory(id_category);
        res.json({ error, data, category });
    } catch (err) {
        console.error("-> type_category_api_controller.js - getTypesByCategory() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener tipos de la categoría"
        });
    }
}

async function create(req, res) {
    try {
        const { id_type, id_category } = req.body;
        
        // Validate required fields
        if (!id_type || !id_category) {
            return res.status(400).json({
                error: 'El ID del tipo y el ID de la categoría son obligatorios'
            });
        }
        
        const typeCategoryData = {
            id_type,
            id_category
        };
        
        const { error, data, success } = await typeCategoryController.create(typeCategoryData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> type_category_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la asociación tipo-categoría",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_type_category } = req.params;
        
        if (!id_type_category) {
            return res.status(400).json({ 
                error: 'El ID de la asociación es obligatorio'
            });
        }
        
        const { error, data, message } = await typeCategoryController.removeById(id_type_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> type_category_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la asociación tipo-categoría",
            details: err.message 
        });
    }
}

async function removeByType(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, message } = await typeCategoryController.removeByType(id_type);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> type_category_api_controller.js - removeByType() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las asociaciones del tipo",
            details: err.message 
        });
    }
}

async function removeByCategory(req, res) {
    try {
        const { id_category } = req.params;
        
        if (!id_category) {
            return res.status(400).json({ 
                error: 'El ID de la categoría es obligatorio'
            });
        }
        
        const { error, data, message } = await typeCategoryController.removeByCategory(id_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> type_category_api_controller.js - removeByCategory() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las asociaciones de la categoría",
            details: err.message 
        });
    }
}

export {
    getAll,
    getCategoriesByType,
    getTypesByCategory,
    create,
    removeById,
    removeByType,
    removeByCategory
}

export default {
    getAll,
    getCategoriesByType,
    getTypesByCategory,
    create,
    removeById,
    removeByType,
    removeByCategory
}