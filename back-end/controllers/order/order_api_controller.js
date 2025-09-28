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

//update: Add getByRiderId function
async function getByRiderId(req, res) {
    try {
        const { id_rider } = req.body;
        
        if (!id_rider) {
            return res.status(400).json({
                error: 'El ID del repartidor es obligatorio'
            });
        }

        const { error, data } = await orderController.getByRiderId(id_rider);
        res.json({ error, data });
    } catch (err) {
        console.error('-> order_api_controller.js - getByRiderId() - Error = ', err);
        res.status(500).json({
            error: 'Error al obtener los pedidos del repartidor'
        });
    }
}

//update: Add getAvailableForRiders function
async function getAvailableForRiders(req, res) {
    try {
        const { error, data } = await orderController.getAvailableForRiders();
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_api_controller.js - getAvailableForRiders() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener pedidos disponibles", 
            data: null
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_user,
            id_shop,
            id_rider,
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
            id_rider,
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

//update: Add assignRider function
async function assignRider(req, res) {
    try {
        const { id_order } = req.params;
        const { id_rider } = req.body;

        if (!id_order) {
            return res.status(400).json({
                error: 'El ID del pedido es obligatorio'
            });
        }

        if (!id_rider) {
            return res.status(400).json({
                error: 'El ID del repartidor es obligatorio'
            });
        }

        const { error, data, message } = await orderController.assignRider(id_order, id_rider);
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_api_controller.js - assignRider() - Error =", err);
        res.status(500).json({
            error: "Error al asignar el repartidor",
            details: err.message
        });
    }
}

//update: Add riderResponse function
async function riderResponse(req, res) {
    try {
        const { id_order } = req.params;
        const { id_rider, accepted } = req.body;

        if (!id_order) {
            return res.status(400).json({
                error: 'El ID del pedido es obligatorio'
            });
        }

        if (!id_rider) {
            return res.status(400).json({
                error: 'El ID del repartidor es obligatorio'
            });
        }

        if (accepted === undefined || accepted === null) {
            return res.status(400).json({
                error: 'La respuesta del repartidor es obligatoria'
            });
        }

        const { error, data, message } = await orderController.riderResponse(id_order, id_rider, accepted);
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_api_controller.js - riderResponse() - Error =", err);
        res.status(500).json({
            error: "Error al procesar la respuesta del repartidor",
            details: err.message
        });
    }
}

async function checkPurchase(req, res) {
    try {
        const { id_user, id_shop } = req.query;

        if (!id_user || !id_shop) {
            return res.status(400).json({
                error: 'id_user e id_shop son obligatorios'
            });
        }

        const result = await orderController.checkUserPurchase(id_user, id_shop);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        console.error("-> order_api_controller.js - checkPurchase() - Error =", err);
        res.status(500).json({
            error: "Error al verificar compra",
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    getByUserId,
    getByShopId,
    getByRiderId,
    getAvailableForRiders,
    create,
    updateStatus,
    cancel,
    assignRider,
    riderResponse,
    checkPurchase 
}

export default {
    getAll,
    getById,
    getByUserId,
    getByShopId,
    getByRiderId,
    getAvailableForRiders,
    create,
    updateStatus,
    cancel,
    assignRider,
    riderResponse,
    checkPurchase 
}