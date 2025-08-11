import orderProductController from "./order_product_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await orderProductController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_product_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los productos de pedido", 
            data: null
        });
    }
}

async function getById(req, res) {
    try {
        const { id_order_product } = req.body;
        
        if (!id_order_product) {
            return res.status(400).json({ 
                error: 'El ID del producto de pedido es obligatorio' 
            });
        }
        
        const { error, data } = await orderProductController.getById(id_order_product);
        res.json({ error, data });
    } catch (err) {
        console.error("-> order_product_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el producto de pedido", 
            data: null
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_product,
            quantity,
            product_notes
        } = req.body;
    
        // Validate required fields
        if (!id_product || !quantity) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_product: !id_product,
                    quantity: !quantity
                }
            });
        }
    
        const { error, data, success } = await orderProductController.create({
            id_product,
            quantity,
            product_notes
        });
    
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> order_product_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el producto de pedido",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const { id_order_product } = req.params;
        const { quantity, product_notes } = req.body;

        if (!id_order_product) {
            return res.status(400).json({
                error: 'El ID del producto de pedido es obligatorio'
            });
        }

        const { error, data } = await orderProductController.update(id_order_product, {
            quantity,
            product_notes
        });
        
        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data });
    } catch (err) {
        console.error("-> order_product_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el producto de pedido",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_order_product } = req.params;

        if (!id_order_product) {
            return res.status(400).json({ 
                error: 'El ID del producto de pedido es obligatorio' 
            });
        }
        
        const { error, data, message } = await orderProductController.removeById(id_order_product);
        res.json({ error, data, message });
    } catch (err) {
        console.error("-> order_product_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el producto de pedido",
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