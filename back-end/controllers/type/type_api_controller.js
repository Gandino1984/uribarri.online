import typeController from "./type_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await typeController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los tipos"
        });
    }
}

async function getVerified(req, res) {
    try {
        const { error, data } = await typeController.getVerified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - getVerified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener tipos verificados"
        });
    }
}

async function getUnverified(req, res) {
    try {
        const { error, data } = await typeController.getUnverified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - getUnverified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener tipos no verificados"
        });
    }
}

async function getAllWithSubtypes(req, res) {
    try {
        const { error, data } = await typeController.getAllWithSubtypes();
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - getAllWithSubtypes() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener tipos con subtipos"
        });
    }
}

async function getById(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data } = await typeController.getById(id_type);
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el tipo"
        });
    }
}

async function getSubtypesByTypeId(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, type } = await typeController.getSubtypesByTypeId(id_type);
        res.json({ error, data, type });
    } catch (err) {
        console.error("-> type_api_controller.js - getSubtypesByTypeId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subtipos del tipo"
        });
    }
}

async function create(req, res) {
    try {
        const { 
            name_type,
            createdby_type
        } = req.body;
        
        // Validate required fields
        if (!name_type) {
            return res.status(400).json({
                error: 'El nombre del tipo es obligatorio'
            });
        }
        
        const typeData = {
            name_type,
            createdby_type: createdby_type || null
        };
        
        const { error, data, success } = await typeController.create(typeData);
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> type_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el tipo",
            details: err.message
        });
    }
}

//update: Modified to include warning when shops are using the type
async function update(req, res) {
    try {
        const { id_type } = req.params;
        const {
            name_type,
            verified_type
        } = req.body;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_type !== undefined) updateData.name_type = name_type;
        if (verified_type !== undefined) updateData.verified_type = verified_type;
        
        const { error, data, success, warning, affectedShops } = await typeController.update(id_type, updateData);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error, 
                warning,
                affectedShops 
            });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> type_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el tipo",
            details: err.message
        });
    }
}

//update: New endpoint for cascade update
async function updateCascade(req, res) {
    try {
        const { id_type } = req.params;
        const {
            name_type,
            verified_type
        } = req.body;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_type !== undefined) updateData.name_type = name_type;
        if (verified_type !== undefined) updateData.verified_type = verified_type;
        
        const { error, data, success, affectedShops } = await typeController.updateCascade(id_type, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            error, 
            data, 
            success,
            affectedShops 
        });
    } catch (err) {
        console.error("-> type_api_controller.js - updateCascade() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el tipo en cascada",
            details: err.message
        });
    }
}

//update: Modified to include warning when shops are using the type
async function removeById(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, affectedShops, deletedSubtypes } = await typeController.removeById(id_type);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedShops 
            });
        }
        
        res.json({ 
            data, 
            success,
            deletedSubtypes 
        });
    } catch (err) {
        console.error("-> type_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el tipo",
            details: err.message 
        });
    }
}

//update: New endpoint for cascade delete
async function removeCascade(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, deletedShops, deletedSubtypes } = await typeController.removeCascade(id_type);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            data, 
            success,
            warning,
            deletedShops,
            deletedSubtypes 
        });
    } catch (err) {
        console.error("-> type_api_controller.js - removeCascade() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el tipo en cascada",
            details: err.message 
        });
    }
}

//update: New endpoint to check affected shops before operations
async function checkAffectedShops(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { count, shops } = await typeController.checkAffectedShops(id_type);
        
        res.json({ 
            count,
            shops
        });
    } catch (err) {
        console.error("-> type_api_controller.js - checkAffectedShops() - Error =", err);
        res.status(500).json({ 
            error: "Error al verificar comercios afectados",
            details: err.message 
        });
    }
}

export {
    getAll,
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    getSubtypesByTypeId,
    create,
    update,
    updateCascade,
    removeById,
    removeCascade,
    checkAffectedShops
}

export default {
    getAll,
    getVerified,
    getUnverified,
    getAllWithSubtypes,
    getById,
    getSubtypesByTypeId,
    create,
    update,
    updateCascade,
    removeById,
    removeCascade,
    checkAffectedShops
}