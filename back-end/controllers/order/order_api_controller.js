import orderController from "./order_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await orderController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los pedidos", 
            data: null
        });
    }
}

async function getById(req, res) {
    try {
        const { id_order } = req.body;
        
        if (!id_order) {
            return res.status(400).json({ 
                error: 'El ID del pedido es obligatorio' 
            });
        }
        
        const { error, data } = await orderController.getById(id_order);
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el pedido", 
            data: null
        });
    }
}

async function getByUserId(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({
                error: 'El ID de usuario es obligatorio'
            });
        }

        const { error, data } = await orderController.getByUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error('-> order_api_controller.js - getByUserId() - Error = ', err);
        res.status(500).json({
            error: 'Error al obtener los pedidos del usuario'
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.body;
        
        if (!id_shop) {
            return res.status(400).json({
                error: 'El ID del comercio es obligatorio'
            });
        }

        const { error, data } = await orderController.getByShopId(id_shop);
        res.json({ error, data });
    } catch (err) {
        console.error('-> order_api_controller.js - getByShopId() - Error = ', err);
        res.status(500).json({
            error: 'Error al obtener los pedidos del comercio'
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_user,
            id_shop,
            products,
            packages,
            delivery_type,
            delivery_address,
            order_notes
        } = req.body;
    
        // Validate required fields
        if (!id_user || !id_shop) {
            console.error('-> order_api_controller.js - create() - Error = Campos obligatorios faltantes');
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_user: !id_user,
                    id_shop: !id_shop
                }
            });
        }

        // Validate that at least one product or package is provided
        if ((!products || products.length === 0) && (!packages || packages.length === 0)) {
            return res.status(400).json({
                error: 'El pedido debe contener al menos un producto o paquete'
            });
        }
    
        const { error, data, success } = await orderController.create({
            id_user,
            id_shop,
            products,
            packages,
            delivery_type,
            delivery_address,
            order_notes
        });
    
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> order_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el pedido",
            details: err.message
        });
    }
}

async function updateStatus(req, res) {
    try {
        const { id_order } = req.params;
        const { order_status } = req.body;

        if (!id_order) {
            return res.status(400).json({
                error: 'El ID del pedido es obligatorio'
            });
        }

        if (!order_status) {
            return res.status(400).json({
                error: 'El estado del pedido es obligatorio'
            });
        }

        const { error, data, message } = await orderController.updateStatus(id_order, order_status);
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_api_controller.js - updateStatus() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el estado del pedido",
            details: err.message
        });
    }
}

async function cancel(req, res) {
    try {
        const { id_order } = req.params;
        const { cancellation_reason } = req.body;

        if (!id_order) {
            return res.status(400).json({
                error: 'El ID del pedido es obligatorio'
            });
        }

        const { error, data, message } = await orderController.cancel(id_order, cancellation_reason);
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_api_controller.js - cancel() - Error =", err);
        res.status(500).json({
            error: "Error al cancelar el pedido",
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    getByUserId,
    getByShopId,
    create,
    updateStatus,
    cancel
}

export default {
    getAll,
    getById,
    getByUserId,
    getByShopId,
    create,
    updateStatus,
    cancel
}