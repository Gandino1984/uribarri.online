import shopValorationController from "./shop_valoration_controller.js";

async function create(req, res) {
    try {
        const {
            id_user,
            id_shop,
            calification_shop,
            comment_shop
        } = req.body;

        // Validate required fields
        if (!id_user || !id_shop || !calification_shop) {
            return res.status(400).json({
                error: 'Campos obligatorios: id_user, id_shop, calification_shop',
                missingFields: {
                    id_user: !id_user,
                    id_shop: !id_shop,
                    calification_shop: !calification_shop
                }
            });
        }

        // Validate calification range
        if (calification_shop < 1 || calification_shop > 5) {
            return res.status(400).json({
                error: 'La calificación debe estar entre 1 y 5'
            });
        }

        const { error, data, success } = await shopValorationController.create({
            id_user,
            id_shop,
            calification_shop,
            comment_shop
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la valoración",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_valoration,
            id_user,
            calification_shop,
            comment_shop
        } = req.body;

        if (!id_valoration) {
            return res.status(400).json({
                error: 'El ID de la valoración es obligatorio'
            });
        }

        // Validate calification range if provided
        if (calification_shop !== undefined && (calification_shop < 1 || calification_shop > 5)) {
            return res.status(400).json({
                error: 'La calificación debe estar entre 1 y 5'
            });
        }

        const { error, data, success } = await shopValorationController.update(id_valoration, {
            id_user,
            calification_shop,
            comment_shop
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la valoración",
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_valoration } = req.params;

        if (!id_valoration) {
            return res.status(400).json({
                error: 'El ID de la valoración es obligatorio'
            });
        }

        const { error, data } = await shopValorationController.getById(id_valoration);

        if (error) {
            return res.status(404).json({ error });
        }

        res.json({ error, data });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - getById() - Error =", err);
        res.status(500).json({
            error: "Error al obtener la valoración",
            details: err.message
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            return res.status(400).json({
                error: 'El ID del comercio es obligatorio'
            });
        }

        const { error, data, message } = await shopValorationController.getByShopId(id_shop);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las valoraciones del comercio",
            details: err.message
        });
    }
}

async function getByUserId(req, res) {
    try {
        const { id_user } = req.params;

        if (!id_user) {
            return res.status(400).json({
                error: 'El ID del usuario es obligatorio'
            });
        }

        const { error, data, message } = await shopValorationController.getByUserId(id_user);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las valoraciones del usuario",
            details: err.message
        });
    }
}

async function getByUserAndShop(req, res) {
    try {
        const { id_user, id_shop } = req.body;

        if (!id_user || !id_shop) {
            return res.status(400).json({
                error: 'id_user e id_shop son obligatorios',
                missingFields: {
                    id_user: !id_user,
                    id_shop: !id_shop
                }
            });
        }

        const { error, data, message } = await shopValorationController.getByUserAndShop(id_user, id_shop);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, message });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - getByUserAndShop() - Error =", err);
        res.status(500).json({
            error: "Error al obtener la valoración",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_valoration } = req.params;
        const { id_user } = req.body;

        if (!id_valoration) {
            return res.status(400).json({
                error: 'El ID de la valoración es obligatorio'
            });
        }

        const { error, data, success } = await shopValorationController.removeById(id_valoration, id_user);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - removeById() - Error =", err);
        res.status(500).json({
            error: "Error al eliminar la valoración",
            details: err.message
        });
    }
}

async function getShopAverageCalification(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            return res.status(400).json({
                error: 'El ID del comercio es obligatorio'
            });
        }

        const { error, data } = await shopValorationController.getShopAverageCalification(id_shop);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - getShopAverageCalification() - Error =", err);
        res.status(500).json({
            error: "Error al obtener la calificación promedio del comercio",
            details: err.message
        });
    }
}

async function recalculateShopAverageCalification(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            return res.status(400).json({
                error: 'El ID del comercio es obligatorio'
            });
        }

        const result = await shopValorationController.updateShopAverageCalification(id_shop);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ 
            error: null, 
            data: {
                id_shop: id_shop,
                average: result.average,
                count: result.count
            },
            message: 'Calificación promedio actualizada exitosamente'
        });
    } catch (err) {
        console.error("-> shop_valoration_api_controller.js - recalculateShopAverageCalification() - Error =", err);
        res.status(500).json({
            error: "Error al recalcular la calificación promedio del comercio",
            details: err.message
        });
    }
}

export {
    create,
    update,
    getById,
    getByShopId,
    getByUserId,
    getByUserAndShop,
    removeById,
    getShopAverageCalification,
    recalculateShopAverageCalification
};

export default {
    create,
    update,
    getById,
    getByShopId,
    getByUserId,
    getByUserAndShop,
    removeById,
    getShopAverageCalification,
    recalculateShopAverageCalification
};