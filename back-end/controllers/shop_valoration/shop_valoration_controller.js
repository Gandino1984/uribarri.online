import shop_valoration_model from "../../models/shop_valoration_model.js";
import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";
import { Sequelize } from "sequelize";

async function validateUser(id_user) {
    try {
        const user = await user_model.findOne({
            where: {
                id_user: id_user,
                contributor_user: true
            }
        });
        
        if (!user) {
            return {
                isValid: false,
                error: "El usuario no existe o no es un colaborador del proyecto"
            };
        }
        
        return {
            isValid: true,
            user: user
        };
    } catch (err) {
        console.error("Error validating user:", err);
        return {
            isValid: false,
            error: "Error al validar el usuario"
        };
    }
}

async function validateShop(id_shop) {
    try {
        const shop = await shop_model.findOne({
            where: {
                id_shop: id_shop
            }
        });
        
        if (!shop) {
            return {
                isValid: false,
                error: "El comercio no existe"
            };
        }
        
        return {
            isValid: true,
            shop: shop
        };
    } catch (err) {
        console.error("Error validating shop:", err);
        return {
            isValid: false,
            error: "Error al validar el comercio"
        };
    }
}

async function create(valorationData) {
    try {
        // Validate user is a contributor
        const userValidation = await validateUser(valorationData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        // Validate shop exists
        const shopValidation = await validateShop(valorationData.id_shop);
        if (!shopValidation.isValid) {
            return { error: shopValidation.error };
        }

        // Check if valoration already exists
        const existingValoration = await shop_valoration_model.findOne({
            where: {
                id_user: valorationData.id_user,
                id_shop: valorationData.id_shop
            }
        });

        if (existingValoration) {
            return { error: "Ya has valorado este comercio. Usa la opción de actualizar para modificar tu valoración" };
        }

        // Validate calification range
        if (valorationData.calification_shop < 1 || valorationData.calification_shop > 5) {
            return { error: "La calificación debe estar entre 1 y 5" };
        }

        // Create the valoration
        const valoration = await shop_valoration_model.create({
            id_user: valorationData.id_user,
            id_shop: valorationData.id_shop,
            calification_shop: valorationData.calification_shop,
            comment_shop: valorationData.comment_shop || null
        });

        // Update shop average calification
        await updateShopAverageCalification(valorationData.id_shop);

        return {
            success: "Valoración creada exitosamente",
            data: valoration
        };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - create() - Error =", err);
        return { error: "Error al crear la valoración" };
    }
}

async function update(id_valoration, valorationData) {
    try {
        const valoration = await shop_valoration_model.findByPk(id_valoration);
        
        if (!valoration) {
            return { error: "Valoración no encontrada" };
        }

        // Validate user is the owner of the valoration
        if (valorationData.id_user && valorationData.id_user !== valoration.id_user) {
            return { error: "No tienes permisos para modificar esta valoración" };
        }

        // Validate user is still a contributor
        const userValidation = await validateUser(valoration.id_user);
        if (!userValidation.isValid) {
            return { error: "El usuario no es un colaborador activo del proyecto" };
        }

        // Validate calification range if provided
        if (valorationData.calification_shop !== undefined) {
            if (valorationData.calification_shop < 1 || valorationData.calification_shop > 5) {
                return { error: "La calificación debe estar entre 1 y 5" };
            }
        }

        // Update valoration
        await valoration.update({
            calification_shop: valorationData.calification_shop || valoration.calification_shop,
            comment_shop: valorationData.comment_shop !== undefined ? valorationData.comment_shop : valoration.comment_shop,
            updated_at: new Date()
        });

        // Update shop average calification
        await updateShopAverageCalification(valoration.id_shop);

        return {
            success: "Valoración actualizada exitosamente",
            data: valoration
        };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - update() - Error =", err);
        return { error: "Error al actualizar la valoración" };
    }
}

async function getById(id_valoration) {
    try {
        const valoration = await shop_valoration_model.findByPk(id_valoration);

        if (!valoration) {
            return { error: "Valoración no encontrada" };
        }

        // Get related user and shop info
        const user = await user_model.findByPk(valoration.id_user);
        const shop = await shop_model.findByPk(valoration.id_shop);

        const valorationWithDetails = {
            ...valoration.toJSON(),
            user_name: user ? user.name_user : null,
            shop_name: shop ? shop.name_shop : null
        };

        return { data: valorationWithDetails };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - getById() - Error =", err);
        return { error: "Error al obtener la valoración" };
    }
}

async function getByShopId(id_shop) {
    try {
        const shopValidation = await validateShop(id_shop);
        if (!shopValidation.isValid) {
            return { error: shopValidation.error };
        }

        const valorations = await shop_valoration_model.findAll({
            where: { id_shop: id_shop },
            order: [['created_at', 'DESC']]
        });

        if (!valorations || valorations.length === 0) {
            return { 
                data: [],
                message: "No hay valoraciones para este comercio"
            };
        }

        // Get user details for each valoration
        const valorationsWithDetails = [];
        for (const valoration of valorations) {
            const user = await user_model.findByPk(valoration.id_user);
            valorationsWithDetails.push({
                ...valoration.toJSON(),
                user_name: user ? user.name_user : null,
                user_image: user ? user.image_user : null
            });
        }

        return { data: valorationsWithDetails };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - getByShopId() - Error =", err);
        return { error: "Error al obtener las valoraciones del comercio" };
    }
}

async function getByUserId(id_user) {
    try {
        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const valorations = await shop_valoration_model.findAll({
            where: { id_user: id_user },
            order: [['created_at', 'DESC']]
        });

        if (!valorations || valorations.length === 0) {
            return { 
                data: [],
                message: "No has realizado valoraciones"
            };
        }

        // Get shop details for each valoration
        const valorationsWithDetails = [];
        for (const valoration of valorations) {
            const shop = await shop_model.findByPk(valoration.id_shop);
            valorationsWithDetails.push({
                ...valoration.toJSON(),
                shop_name: shop ? shop.name_shop : null,
                shop_location: shop ? shop.location_shop : null,
                shop_image: shop ? shop.image_shop : null
            });
        }

        return { data: valorationsWithDetails };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - getByUserId() - Error =", err);
        return { error: "Error al obtener las valoraciones del usuario" };
    }
}

async function getByUserAndShop(id_user, id_shop) {
    try {
        const valoration = await shop_valoration_model.findOne({
            where: {
                id_user: id_user,
                id_shop: id_shop
            }
        });

        if (!valoration) {
            return { 
                data: null,
                message: "No has valorado este comercio"
            };
        }

        return { data: valoration };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - getByUserAndShop() - Error =", err);
        return { error: "Error al obtener la valoración" };
    }
}

async function removeById(id_valoration, id_user) {
    try {
        const valoration = await shop_valoration_model.findByPk(id_valoration);
        
        if (!valoration) {
            return { error: "Valoración no encontrada" };
        }

        // Validate user is the owner of the valoration
        if (id_user && id_user !== valoration.id_user) {
            return { error: "No tienes permisos para eliminar esta valoración" };
        }

        const id_shop = valoration.id_shop;
        
        await valoration.destroy();

        // Update shop average calification
        await updateShopAverageCalification(id_shop);

        return {
            success: "Valoración eliminada exitosamente",
            data: id_valoration
        };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - removeById() - Error =", err);
        return { error: "Error al eliminar la valoración" };
    }
}

async function updateShopAverageCalification(id_shop) {
    try {
        // Calculate average calification
        const result = await shop_valoration_model.findOne({
            where: { id_shop: id_shop },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('calification_shop')), 'average'],
                [Sequelize.fn('COUNT', Sequelize.col('id_valoration')), 'count']
            ],
            raw: true
        });

        const average = result.average ? Math.round(result.average) : 5;
        
        // Update shop calification
        await shop_model.update(
            { calification_shop: average },
            { where: { id_shop: id_shop } }
        );

        console.log(`-> Updated shop ${id_shop} average calification to ${average} based on ${result.count} valorations`);
        
        return { 
            average: average,
            count: result.count || 0
        };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - updateShopAverageCalification() - Error =", err);
        return { error: "Error al actualizar la calificación promedio del comercio" };
    }
}

async function getShopAverageCalification(id_shop) {
    try {
        const shopValidation = await validateShop(id_shop);
        if (!shopValidation.isValid) {
            return { error: shopValidation.error };
        }

        const result = await shop_valoration_model.findOne({
            where: { id_shop: id_shop },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('calification_shop')), 'average'],
                [Sequelize.fn('COUNT', Sequelize.col('id_valoration')), 'count']
            ],
            raw: true
        });

        const average = result.average ? parseFloat(result.average).toFixed(1) : 0;
        const count = result.count || 0;

        // Get calification distribution
        const distribution = await shop_valoration_model.findAll({
            where: { id_shop: id_shop },
            attributes: [
                'calification_shop',
                [Sequelize.fn('COUNT', Sequelize.col('calification_shop')), 'count']
            ],
            group: ['calification_shop'],
            raw: true
        });

        const distributionMap = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        distribution.forEach(item => {
            distributionMap[item.calification_shop] = parseInt(item.count);
        });

        return {
            data: {
                id_shop: id_shop,
                average: parseFloat(average),
                count: count,
                distribution: distributionMap
            }
        };
    } catch (err) {
        console.error("-> shop_valoration_controller.js - getShopAverageCalification() - Error =", err);
        return { error: "Error al obtener la calificación promedio del comercio" };
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
    updateShopAverageCalification
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
    updateShopAverageCalification
};