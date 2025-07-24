import calification_shop_model from "../../models/calification_shop_model.js";
import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";
import { Op } from "sequelize";
import sequelize from "../../config/sequelize.js";

async function create(calificationData) {
    const transaction = await sequelize.transaction();
    
    try {
        const { id_shop, id_user, calification_shop, comment_calification } = calificationData;

        // Check if user exists
        const user = await user_model.findByPk(id_user);
        if (!user) {
            await transaction.rollback();
            return { error: "Usuario no encontrado" };
        }

        // Check if shop exists
        const shop = await shop_model.findByPk(id_shop);
        if (!shop) {
            await transaction.rollback();
            return { error: "Comercio no encontrado" };
        }

        // Check if user already rated this shop
        const existingCalification = await calification_shop_model.findOne({
            where: {
                id_shop: id_shop,
                id_user: id_user
            }
        });

        if (existingCalification) {
            await transaction.rollback();
            return { error: "El usuario ya ha calificado este comercio" };
        }

        // Create the new calification
        const calification = await calification_shop_model.create({
            id_shop,
            id_user,
            calification_shop,
            comment_calification
        }, { transaction });

        // Update shop's average calification
        await updateShopCalification(id_shop, transaction);

        await transaction.commit();

        return {
            data: calification,
            success: "Calificación de comercio creada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_shop_controller.js - create() - Error = ", err);
        return { error: "Error al crear la calificación del comercio" };
    }
}

async function update(id_calification, calificationData) {
    const transaction = await sequelize.transaction();
    
    try {
        const { calification_shop, comment_calification } = calificationData;

        const calification = await calification_shop_model.findByPk(id_calification);
        
        if (!calification) {
            await transaction.rollback();
            return { error: "Calificación no encontrada" };
        }

        // Update the calification
        if (calification_shop !== undefined) calification.calification_shop = calification_shop;
        if (comment_calification !== undefined) calification.comment_calification = comment_calification;
        
        await calification.save({ transaction });

        // Update shop's average calification
        await updateShopCalification(calification.id_shop, transaction);

        await transaction.commit();

        return {
            data: calification,
            success: "Calificación de comercio actualizada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_shop_controller.js - update() - Error = ", err);
        return { error: "Error al actualizar la calificación del comercio" };
    }
}

async function removeById(id_calification) {
    const transaction = await sequelize.transaction();
    
    try {
        const calification = await calification_shop_model.findByPk(id_calification);
        
        if (!calification) {
            await transaction.rollback();
            return { error: "Calificación no encontrada" };
        }

        const id_shop = calification.id_shop;
        
        await calification.destroy({ transaction });

        // Update shop's average calification
        await updateShopCalification(id_shop, transaction);

        await transaction.commit();

        return {
            data: id_calification,
            success: "Calificación de comercio eliminada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_shop_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la calificación del comercio" };
    }
}

async function getByShopId(id_shop) {
    try {
        const califications = await calification_shop_model.findAll({
            where: { id_shop: id_shop }
        });

        if (!califications || califications.length === 0) {
            return { 
                data: [], 
                success: "No hay calificaciones para este comercio" 
            };
        }

        // Manually get user data for each calification
        const calificationsWithUsers = await Promise.all(
            califications.map(async (cal) => {
                const user = await user_model.findByPk(cal.id_user, {
                    attributes: ['name_user', 'image_user']
                });
                return {
                    ...cal.dataValues,
                    user: user ? user.dataValues : null
                };
            })
        );

        return {
            data: calificationsWithUsers,
            success: "Calificaciones del comercio encontradas"
        };
    } catch (err) {
        console.error("-> calification_shop_controller.js - getByShopId() - Error = ", err);
        return { error: "Error al obtener las calificaciones del comercio" };
    }
}

async function getByUserId(id_user) {
    try {
        const califications = await calification_shop_model.findAll({
            where: { id_user: id_user }
        });

        if (!califications || califications.length === 0) {
            return { 
                data: [], 
                success: "No hay calificaciones de comercios por este usuario" 
            };
        }

        // Manually get shop data for each calification
        const calificationsWithShops = await Promise.all(
            califications.map(async (cal) => {
                const shop = await shop_model.findByPk(cal.id_shop, {
                    attributes: ['name_shop', 'image_shop', 'location_shop']
                });
                return {
                    ...cal.dataValues,
                    shop: shop ? shop.dataValues : null
                };
            })
        );

        return {
            data: calificationsWithShops,
            success: "Calificaciones del usuario encontradas"
        };
    } catch (err) {
        console.error("-> calification_shop_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener las calificaciones del usuario" };
    }
}

async function getByUserAndShop(id_user, id_shop) {
    try {
        const calification = await calification_shop_model.findOne({
            where: {
                id_user: id_user,
                id_shop: id_shop
            }
        });

        if (!calification) {
            return { 
                data: null,
                success: "El usuario no ha calificado este comercio" 
            };
        }

        return {
            data: calification,
            success: "Calificación encontrada"
        };
    } catch (err) {
        console.error("-> calification_shop_controller.js - getByUserAndShop() - Error = ", err);
        return { error: "Error al obtener la calificación" };
    }
}

// Helper function to update shop's average calification
async function updateShopCalification(id_shop, transaction) {
    try {
        // Calculate the average calification
        const result = await calification_shop_model.findOne({
            where: { id_shop: id_shop },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('calification_shop')), 'total_stars'],
                [sequelize.fn('COUNT', sequelize.col('id_calification')), 'total_califications']
            ],
            raw: true,
            transaction
        });

        const totalStars = result.total_stars || 0;
        const totalCalifications = result.total_califications || 0;
        
        // Calculate average (sum of stars / number of califications)
        const averageCalification = totalCalifications > 0 
            ? Math.round(totalStars / totalCalifications) 
            : 0;

        // Update the shop's calification field
        await shop_model.update(
            { calification_shop: averageCalification },
            { 
                where: { id_shop: id_shop },
                transaction 
            }
        );

        return { success: true };
    } catch (err) {
        console.error("-> calification_shop_controller.js - updateShopCalification() - Error = ", err);
        throw err;
    }
}

async function getShopCalificationStats(id_shop) {
    try {
        const stats = await calification_shop_model.findOne({
            where: { id_shop: id_shop },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('calification_shop')), 'average'],
                [sequelize.fn('COUNT', sequelize.col('id_calification')), 'total'],
                [sequelize.fn('SUM', sequelize.col('calification_shop')), 'sum']
            ],
            raw: true
        });

        return {
            data: {
                average: parseFloat(stats.average) || 0,
                total: parseInt(stats.total) || 0,
                sum: parseInt(stats.sum) || 0
            },
            success: "Estadísticas de calificación del comercio obtenidas"
        };
    } catch (err) {
        console.error("-> calification_shop_controller.js - getShopCalificationStats() - Error = ", err);
        return { error: "Error al obtener las estadísticas de calificación del comercio" };
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