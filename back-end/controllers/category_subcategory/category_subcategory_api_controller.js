import categorySubcategoryController from "./category_subcategory_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await categorySubcategoryController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las asociaciones"
        });
    }
}

async function getById(req, res) {
    try {
        const { id_category_subcategory } = req.params;
        
        if (!id_category_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la asociación es obligatorio'
            });
        }
        
        const { error, data } = await categorySubcategoryController.getById(id_category_subcategory);
        res.json({ error, data });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener la asociación"
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
        
        const { error, data } = await categorySubcategoryController.getByCategoryId(id_category);
        res.json({ error, data });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - getByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener asociaciones por categoría"
        });
    }
}

async function getBySubcategoryId(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data } = await categorySubcategoryController.getBySubcategoryId(id_subcategory);
        res.json({ error, data });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - getBySubcategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener asociaciones por subcategoría"
        });
    }
}

async function getWithDetails(req, res) {
    try {
        const { error, data } = await categorySubcategoryController.getWithDetails();
        res.json({ error, data });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - getWithDetails() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener asociaciones con detalles"
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_category,
            id_subcategory
        } = req.body;
        
        // Validate required fields
        if (!id_category || !id_subcategory) {
            return res.status(400).json({
                error: 'El ID de la categoría y el ID de la subcategoría son obligatorios'
            });
        }
        
        const associationData = {
            id_category,
            id_subcategory
        };
        
        const { error, data, success } = await categorySubcategoryController.create(associationData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la asociación",
            details: err.message
        });
    }
}

async function createMultiple(req, res) {
    try {
        const { 
            id_category,
            subcategory_ids
        } = req.body;
        
        // Validate required fields
        if (!id_category || !subcategory_ids || !Array.isArray(subcategory_ids) || subcategory_ids.length === 0) {
            return res.status(400).json({
                error: 'El ID de la categoría y un array de IDs de subcategorías son obligatorios'
            });
        }
        
        const associationsData = {
            id_category,
            subcategory_ids
        };
        
        const { error, data, success, skipped } = await categorySubcategoryController.createMultiple(associationsData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success, skipped });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - createMultiple() - Error =", err);
        res.status(500).json({
            error: "Error al crear múltiples asociaciones",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_category_subcategory } = req.params;
        
        if (!id_category_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la asociación es obligatorio'
            });
        }
        
        const { error, data, success } = await categorySubcategoryController.removeById(id_category_subcategory);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la asociación",
            details: err.message 
        });
    }
}

async function removeByPair(req, res) {
    try {
        const { id_category, id_subcategory } = req.params;
        
        if (!id_category || !id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la categoría y el ID de la subcategoría son obligatorios'
            });
        }
        
        const { error, data, success } = await categorySubcategoryController.removeByPair(id_category, id_subcategory);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - removeByPair() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la asociación",
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
        
        const { error, data, success } = await categorySubcategoryController.removeByCategoryId(id_category);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - removeByCategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las asociaciones",
            details: err.message 
        });
    }
}

async function removeBySubcategoryId(req, res) {
    try {
        const { id_subcategory } = req.params;
        
        if (!id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la subcategoría es obligatorio'
            });
        }
        
        const { error, data, success } = await categorySubcategoryController.removeBySubcategoryId(id_subcategory);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - removeBySubcategoryId() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar las asociaciones",
            details: err.message 
        });
    }
}

async function checkAssociation(req, res) {
    try {
        const { id_category, id_subcategory } = req.params;
        
        if (!id_category || !id_subcategory) {
            return res.status(400).json({ 
                error: 'El ID de la categoría y el ID de la subcategoría son obligatorios'
            });
        }
        
        const { exists, data } = await categorySubcategoryController.checkAssociation(id_category, id_subcategory);
        
        res.json({ 
            exists,
            data
        });
    } catch (err) {
        console.error("-> category_subcategory_api_controller.js - checkAssociation() - Error =", err);
        res.status(500).json({ 
            error: "Error al verificar la asociación",
            details: err.message 
        });
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