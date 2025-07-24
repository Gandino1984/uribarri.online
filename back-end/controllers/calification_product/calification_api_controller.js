import calificationController from "./calification_controller.js";

async function create(req, res) {
    try {
        const { id_product, id_user, calification_product, comment_calification } = req.body;

        if (!id_product || !id_user || !calification_product) {
            return res.status(400).json({
                error: "Los campos id_product, id_user y calification_product son obligatorios"
            });
        }

        if (calification_product < 1 || calification_product > 5) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5"
            });
        }

        if (comment_calification && comment_calification.length > 200) {
            return res.status(400).json({
                error: "El comentario no puede exceder los 200 caracteres"
            });
        }

        const { error, data, success } = await calificationController.create({
            id_product,
            id_user,
            calification_product,
            comment_calification
        });

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la calificación",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const { id_calification, calification_product, comment_calification } = req.body;

        if (!id_calification) {
            return res.status(400).json({
                error: "El campo id_calification es obligatorio"
            });
        }

        if (calification_product !== undefined && (calification_product < 1 || calification_product > 5)) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5"
            });
        }

        if (comment_calification && comment_calification.length > 200) {
            return res.status(400).json({
                error: "El comentario no puede exceder los 200 caracteres"
            });
        }

        const { error, data, success } = await calificationController.update(
            id_calification,
            { calification_product, comment_calification }
        );

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la calificación",
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

        const { error, data, success } = await calificationController.removeById(id_calification);

        if (error) {
            return res.status(400).json({ error });
        }

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - removeById() - Error =", err);
        res.status(500).json({
            error: "Error al eliminar la calificación",
            details: err.message
        });
    }
}

async function getByProductId(req, res) {
    try {
        const { id_product } = req.params;

        if (!id_product) {
            return res.status(400).json({
                error: "El parámetro id_product es obligatorio"
            });
        }

        const { error, data, success } = await calificationController.getByProductId(id_product);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - getByProductId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las calificaciones del producto",
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

        const { error, data, success } = await calificationController.getByUserId(id_user);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las calificaciones del usuario",
            details: err.message
        });
    }
}

async function getByUserAndProduct(req, res) {
    try {
        const { id_user, id_product } = req.params;

        if (!id_user || !id_product) {
            return res.status(400).json({
                error: "Los parámetros id_user e id_product son obligatorios"
            });
        }

        const { error, data, success } = await calificationController.getByUserAndProduct(id_user, id_product);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - getByUserAndProduct() - Error =", err);
        res.status(500).json({
            error: "Error al obtener la calificación",
            details: err.message
        });
    }
}

async function getProductCalificationStats(req, res) {
    try {
        const { id_product } = req.params;

        if (!id_product) {
            return res.status(400).json({
                error: "El parámetro id_product es obligatorio"
            });
        }

        const { error, data, success } = await calificationController.getProductCalificationStats(id_product);

        res.json({ error, data, success });
    } catch (err) {
        console.error("-> calification_api_controller.js - getProductCalificationStats() - Error =", err);
        res.status(500).json({
            error: "Error al obtener las estadísticas de calificación",
            details: err.message
        });
    }
}

export {
    create,
    update,
    removeById,
    getByProductId,
    getByUserId,
    getByUserAndProduct,
    getProductCalificationStats
};

export default {
    create,
    update,
    removeById,
    getByProductId,
    getByUserId,
    getByUserAndProduct,
    getProductCalificationStats
};