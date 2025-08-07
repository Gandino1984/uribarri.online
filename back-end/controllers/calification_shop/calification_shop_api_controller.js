import calificationShopController from "./calification_shop_controller.js";

async function create(req, res) {
    try {
        const { id_shop, id_user, calification_shop, comment_calification } = req.body;

        if (!id_shop || !id_user || !calification_shop) {
            return res.status(400).json({
                error: "Los campos id_shop, id_user y calification_shop son obligatorios"
            });
        }

        if (calification_shop < 1 || calification_shop > 5) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5"
            });
        }

        if (comment_calification && comment_calification.length > 200) {
            return res.status(400).json({
                error: "El comentario no puede exceder los 200 caracteres"
            });
        }

        const { error, data, success } = await calificationShopController.create({
            id_shop,
            id_user,
            calification_shop,
            comment_calification
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la calificación del comercio",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const { id_calification, calification_shop, comment_calification } = req.body;

        if (!id_calification) {
            return res.status(400).json({
                error: "El campo id_calification es obligatorio"
            });
        }

        if (calification_shop !== undefined && (calification_shop < 1 || calification_shop > 5)) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5"
            });
        }

        if (comment_calification && comment_calification.length > 200) {
            return res.status(400).json({
                error: "El comentario no puede exceder los 200 caracteres"
            });
        }

        const { error, data, success } = await calificationShopController.update(
            id_calification,
            { calification_shop, comment_calification }
        );

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la calificación del comercio",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const { id_calification } = req.params;

        if (!id_calification) {
            return res.status(400).json({
                error: "El parámetro id_calification es obligatorio"
            });
        }

        const { error, data, success } = await calificationShopController.removeById(id_calification);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - removeById() - Error =", err);
        res.status(500).json({
            error: "Error al eliminar la calificación del comercio",
            details: err.message
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            return res.status(400).json({
                error: "El parámetro id_shop es obligatorio"
            });
        }

        const { error, data, success } = await calificationShopController.getByShopId(id_shop);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las calificaciones del comercio",
            details: err.message
        });
    }
}

async function getByUserId(req, res) {
    try {
        const { id_user } = req.params;

        if (!id_user) {
            return res.status(400).json({
                error: "El parámetro id_user es obligatorio"
            });
        }

        const { error, data, success } = await calificationShopController.getByUserId(id_user);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las calificaciones del usuario",
            details: err.message
        });
    }
}

async function getByUserAndShop(req, res) {
    try {
        const { id_user, id_shop } = req.params;

        if (!id_user || !id_shop) {
            return res.status(400).json({
                error: "Los parámetros id_user e id_shop son obligatorios"
            });
        }

        const { error, data, success } = await calificationShopController.getByUserAndShop(id_user, id_shop);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - getByUserAndShop() - Error =", err);
        res.status(500).json({
            error: "Error al obtener la calificación",
            details: err.message
        });
    }
}

async function getShopCalificationStats(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            return res.status(400).json({
                error: "El parámetro id_shop es obligatorio"
            });
        }

        const { error, data, success } = await calificationShopController.getShopCalificationStats(id_shop);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_shop_api_controller.js - getShopCalificationStats() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las estadísticas de calificación del comercio",
            details: err.message
        });
    }
}

export {
    create,
    update,
    removeById,
    getByShopId,
    getByUserId,
    getByUserAndShop,
    getShopCalificationStats
};

export default {
    create,
    update,
    removeById,
    getByShopId,
    getByUserId,
    getByUserAndShop,
    getShopCalificationStats
};