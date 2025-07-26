import packageController from "./package_controller.js";
import package_model from "../../models/package_model.js";

async function getAll(req, res) {
    try {
        const {error, data, success} = await packageController.getAll();
        res.json({error, data, success});
    } catch (err) {
        console.error("-> package_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los paquetes", 
            data: null
        });
    }
}

async function create(req, res) {
    try {
        const {
            id_shop,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            discount_package //update: Added discount_package to destructuring
        } = req.body;

        // Validate required fields
        if (!id_shop || !id_product1) {
            return res.status(400).json({
                error: "El ID del comercio y al menos un producto son obligatorios"
            });
        }

        const {error, data, success} = await packageController.create({
            id_shop,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            discount_package //update: Pass discount_package to controller
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.status(201).json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - create() - Error =", err);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            error: "Error al crear un paquete",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_package,
            id_product1,
            id_product2,
            id_product3,
            id_product4,
            id_product5,
            name_package,
            active_package,
            discount_package //update: Added discount_package to destructuring
        } = req.body;

        if (!id_package) {
            return res.status(400).json({
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.update(
            id_package, 
            {
                id_product1,
                id_product2,
                id_product3,
                id_product4,
                id_product5,
                name_package,
                active_package,
                discount_package //update: Pass discount_package to controller
            }
        );   

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({
            error,
            data,
            success
        }); 
    } catch (err) {
        console.error("-> package_api_controller.js - update() - Error =", err);
        res.status(500).json({ 
            error: "Error al actualizar el paquete", 
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_package } = req.params;

        if (!id_package) {
            return res.status(400).json({ 
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.getById(id_package);

        if (error) {
            return res.status(404).json({ error });
        }

        res.json({
            error,
            data,
            success
        });
    } catch (err) {
        console.error("-> package_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el paquete", 
            details: err.message
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({ 
                error: "El ID del comercio es obligatorio"
            });
        }

        const {error, data, success} = await packageController.getByShopId(id_shop);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los paquetes del comercio", 
            details: err.message
        });
    }
}

async function getActiveByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({
                error: "El ID del comercio es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.getActiveByShopId(id_shop);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - getActiveByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener los paquetes activos del comercio",
            details: err.message
        });
    }
}

async function getInactiveByShopId(req, res) {
    try {
        const { id_shop } = req.params;
        
        if (!id_shop) {
            return res.status(400).json({
                error: "El ID del comercio es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.getInactiveByShopId(id_shop);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - getInactiveByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener los paquetes inactivos del comercio",
            details: err.message
        });
    }
}

async function toggleActiveStatus(req, res) {
    try {
        const { id_package } = req.params;
        
        if (!id_package) {
            return res.status(400).json({
                error: "El ID del paquete es obligatorio"
            });
        }
        
        const { error, data, success } = await packageController.toggleActiveStatus(id_package);
        
        if (error) {
            return res.status(404).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> package_api_controller.js - toggleActiveStatus() - Error =", err);
        res.status(500).json({
            error: "Error al cambiar el estado del paquete",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_package } = req.params;
        
        if (!id_package) {
            return res.status(400).json({ 
                error: "El ID del paquete es obligatorio"
            });
        }

        const {error, data, success} = await packageController.removeById(id_package);
        
        if (error) {
            return res.status(404).json({ error });
        }
        
        res.json({
            error,
            data,
            success
        });    
    } catch (err) {
        console.error("-> package_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el paquete", 
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getActiveByShopId,
    getInactiveByShopId,
    toggleActiveStatus
}