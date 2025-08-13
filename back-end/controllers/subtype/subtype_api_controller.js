import subtypeController from "./subtype_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await subtypeController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los subtipos"
        });
    }
}

async function getVerified(req, res) {
    try {
        const { error, data } = await subtypeController.getVerified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - getVerified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subtipos verificados"
        });
    }
}

async function getUnverified(req, res) {
    try {
        const { error, data } = await subtypeController.getUnverified();
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - getUnverified() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subtipos no verificados"
        });
    }
}

async function getByTypeId(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data } = await subtypeController.getByTypeId(id_type);
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - getByTypeId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener subtipos por tipo"
        });
    }
}

async function getById(req, res) {
    try {
        const { id_subtype } = req.params;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const { error, data } = await subtypeController.getById(id_subtype);
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el subtipo"
        });
    }
}

async function create(req, res) {
    try {
        const { 
            name_subtype,
            id_type,
            createdby_subtype
        } = req.body;
        
        // Validate required fields
        if (!name_subtype || !id_type) {
            return res.status(400).json({
                error: 'El nombre del subtipo y el ID del tipo son obligatorios'
            });
        }
        
        const subtypeData = {
            name_subtype,
            id_type,
            createdby_subtype: createdby_subtype || null
        };
        
        const { error, data, success } = await subtypeController.create(subtypeData);
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> subtype_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el subtipo",
            details: err.message
        });
    }
}

//update: Modified to include warning when shops are using the subtype
async function update(req, res) {
    try {
        const { id_subtype } = req.params;
        const {
            name_subtype,
            id_type,
            verified_subtype
        } = req.body;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subtype !== undefined) updateData.name_subtype = name_subtype;
        if (id_type !== undefined) updateData.id_type = id_type;
        if (verified_subtype !== undefined) updateData.verified_subtype = verified_subtype;
        
        const { error, data, success, warning, affectedShops } = await subtypeController.update(id_subtype, updateData);
        
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
        console.error("-> subtype_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el subtipo",
            details: err.message
        });
    }
}

//update: New endpoint for cascade update
async function updateCascade(req, res) {
    try {
        const { id_subtype } = req.params;
        const {
            name_subtype,
            id_type,
            verified_subtype
        } = req.body;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subtype !== undefined) updateData.name_subtype = name_subtype;
        if (id_type !== undefined) updateData.id_type = id_type;
        if (verified_subtype !== undefined) updateData.verified_subtype = verified_subtype;
        
        const { error, data, success, affectedShops, affectedShopsList } = await subtypeController.updateCascade(id_subtype, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            error, 
            data, 
            success,
            affectedShops,
            affectedShopsList 
        });
    } catch (err) {
        console.error("-> subtype_api_controller.js - updateCascade() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el subtipo en cascada",
            details: err.message
        });
    }
}

//update: Modified to include warning when shops are using the subtype
async function removeById(req, res) {
    try {
        const { id_subtype } = req.params;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, affectedShops } = await subtypeController.removeById(id_subtype);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedShops 
            });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> subtype_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el subtipo",
            details: err.message 
        });
    }
}

//update: New endpoint for cascade delete
async function removeCascade(req, res) {
    try {
        const { id_subtype } = req.params;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, deletedShops } = await subtypeController.removeCascade(id_subtype);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            data, 
            success,
            warning,
            deletedShops 
        });
    } catch (err) {
        console.error("-> subtype_api_controller.js - removeCascade() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el subtipo en cascada",
            details: err.message 
        });
    }
}

//update: Modified to include warning when shops are using the subtypes
async function removeByTypeId(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, affectedShops } = await subtypeController.removeByTypeId(id_type);
        
        if (error) {
            //update: Return appropriate status based on warning
            return res.status(warning ? 409 : 400).json({ 
                error,
                warning,
                affectedShops 
            });
        }
        
        res.json({ data, success });
    } catch (err) {
        console.error("-> subtype_api_controller.js - removeByTypeId() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar los subtipos del tipo",
            details: err.message 
        });
    }
}

//update: New endpoint for cascade delete by type
async function removeByTypeIdCascade(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, success, warning, deletedShops } = await subtypeController.removeByTypeIdCascade(id_type);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            data, 
            success,
            warning,
            deletedShops 
        });
    } catch (err) {
        console.error("-> subtype_api_controller.js - removeByTypeIdCascade() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar los subtipos del tipo en cascada",
            details: err.message 
        });
    }
}

//update: New endpoint to check affected shops before operations
async function checkAffectedShops(req, res) {
    try {
        const { id_subtype } = req.params;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const { count, shops } = await subtypeController.checkAffectedShops(id_subtype);
        
        res.json({ 
            count,
            shops
        });
    } catch (err) {
        console.error("-> subtype_api_controller.js - checkAffectedShops() - Error =", err);
        res.status(500).json({ 
            error: "Error al verificar comercios afectados",
            details: err.message 
        });
    }
}

//update: New endpoint to migrate shops from one subtype to another
async function migrateShops(req, res) {
    try {
        const { oldSubtypeId, newSubtypeId } = req.body;
        
        if (!oldSubtypeId || !newSubtypeId) {
            return res.status(400).json({ 
                error: 'Los IDs del subtipo origen y destino son obligatorios'
            });
        }
        
        if (oldSubtypeId === newSubtypeId) {
            return res.status(400).json({ 
                error: 'El subtipo origen y destino no pueden ser el mismo'
            });
        }
        
        const { error, success, migratedShops, fromSubtype, toSubtype } = await subtypeController.migrateShopsToNewSubtype(oldSubtypeId, newSubtypeId);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ 
            success,
            migratedShops,
            fromSubtype,
            toSubtype
        });
    } catch (err) {
        console.error("-> subtype_api_controller.js - migrateShops() - Error =", err);
        res.status(500).json({ 
            error: "Error al migrar comercios entre subtipos",
            details: err.message 
        });
    }
}

export {
    getAll,
    getVerified,
    getUnverified,
    getByTypeId,
    getById,
    create,
    update,
    updateCascade,
    removeById,
    removeCascade,
    removeByTypeId,
    removeByTypeIdCascade,
    checkAffectedShops,
    migrateShops
}

export default {
    getAll,
    getVerified,
    getUnverified,
    getByTypeId,
    getById,
    create,
    update,
    updateCascade,
    removeById,
    removeCascade,
    removeByTypeId,
    removeByTypeIdCascade,
    checkAffectedShops,
    migrateShops
}