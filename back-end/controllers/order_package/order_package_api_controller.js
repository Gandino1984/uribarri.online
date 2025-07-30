import orderPackageController from "./order_package_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await orderPackageController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_package_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los paquetes de pedido", 
            data: null
        });
    }
}

async function getById(req, res) {
    try {
        const { id_order_package } = req.body;
        
        if (!id_order_package) {
            return res.status(400).json({ 
                error: 'El ID del paquete de pedido es obligatorio' 
            });
        }
        
        const { error, data } = await orderPackageController.getById(id_order_package);
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_package_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el paquete de pedido", 
            data: null
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_package,
            quantity,
            package_notes
        } = req.body;
    
        // Validate required fields
        if (!id_package || !quantity) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_package: !id_package,
                    quantity: !quantity
                }
            });
        }
    
        const { error, data, success } = await orderPackageController.create({
            id_package,
            quantity,
            package_notes
        });
    
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> order_package_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el paquete de pedido",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const { id_order_package } = req.params;
        const { quantity, package_notes } = req.body;

        if (!id_order_package) {
            return res.status(400).json({
                error: 'El ID del paquete de pedido es obligatorio'
            });
        }

        const { error, data } = await orderPackageController.update(id_order_package, {
            quantity,
            package_notes
        });
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data });
    } catch (err) {
        console.error("-> order_package_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el paquete de pedido",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_order_package } = req.params;

        if (!id_order_package) {
            return res.status(400).json({ 
                error: 'El ID del paquete de pedido es obligatorio' 
            });
        }
        
        const { error, data, message } = await orderPackageController.removeById(id_order_package);
        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_package_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el paquete de pedido",
            details: err.message 
        });
    }
}

export {
    getAll,
    getById,
    create,
    update,
    removeById
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById
}