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
            order_subtype,
            created_by
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
            order_subtype: order_subtype || 0,
            created_by: created_by || null,
            active_subtype: true
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

async function update(req, res) {
    try {
        const { id_subtype } = req.params;
        const {
            name_subtype,
            id_type,
            order_subtype,
            active_subtype
        } = req.body;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_subtype !== undefined) updateData.name_subtype = name_subtype;
        if (id_type !== undefined) updateData.id_type = id_type;
        if (order_subtype !== undefined) updateData.order_subtype = order_subtype;
        if (active_subtype !== undefined) updateData.active_subtype = active_subtype;
        
        const { error, data } = await subtypeController.update(id_subtype, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> subtype_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el subtipo",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_subtype } = req.params;
        
        if (!id_subtype) {
            return res.status(400).json({ 
                error: 'El ID del subtipo es obligatorio'
            });
        }
        
        const { error, data, message } = await subtypeController.removeById(id_subtype);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> subtype_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el subtipo",
            details: err.message 
        });
    }
}

export {
    getAll,
    getByTypeId,
    getById,
    create,
    update,
    removeById
}

export default {
    getAll,
    getByTypeId,
    getById,
    create,
    update,
    removeById
}