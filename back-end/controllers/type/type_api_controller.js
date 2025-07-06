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

async function create(req, res) {
    try {
        const { 
            name_type,
            //update: removed order_type since field was removed
            //update: changed from created_by to createdby_type
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
            //update: removed order_type assignment
            //update: changed from created_by to createdby_type
            createdby_type: createdby_type || null,
            //update: changed from active_type to verified_type
            verified_type: true
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

async function update(req, res) {
    try {
        const { id_type } = req.params;
        const {
            name_type,
            //update: removed order_type since field was removed
            //update: changed from active_type to verified_type
            verified_type
        } = req.body;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const updateData = {};
        if (name_type !== undefined) updateData.name_type = name_type;
        //update: removed order_type assignment
        //update: changed from active_type to verified_type
        if (verified_type !== undefined) updateData.verified_type = verified_type;
        
        const { error, data } = await typeController.update(id_type, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> type_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el tipo",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_type } = req.params;
        
        if (!id_type) {
            return res.status(400).json({ 
                error: 'El ID del tipo es obligatorio'
            });
        }
        
        const { error, data, message } = await typeController.removeById(id_type);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message });
    } catch (err) {
        console.error("-> type_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el tipo",
            details: err.message 
        });
    }
}

export {
    getAll,
    getAllWithSubtypes,
    getById,
    create,
    update,
    removeById
}

export default {
    getAll,
    getAllWithSubtypes,
    getById,
    create,
    update,
    removeById
}