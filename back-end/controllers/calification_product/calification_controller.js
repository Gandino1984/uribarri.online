import calification_product_model from "../../models/calification_product_model.js";
import product_model from "../../models/product_model.js";
import user_model from "../../models/user_model.js";
import { Op } from "sequelize";
import sequelize from "../../config/sequelize.js";

async function create(calificationData) {
    const transaction = await sequelize.transaction();
    
    try {
        const { id_product, id_user, calification_product, comment_calification } = calificationData;

        // Check if user exists
        const user = await user_model.findByPk(id_user);
        if (!user) {
            await transaction.rollback();
            return { error: "Usuario no encontrado" };
        }

        // Check if product exists
        const product = await product_model.findByPk(id_product);
        if (!product) {
            await transaction.rollback();
            return { error: "Producto no encontrado" };
        }

        // Check if user already rated this product
        const existingCalification = await calification_product_model.findOne({
            where: {
                id_product: id_product,
                id_user: id_user
            }
        });

        if (existingCalification) {
            await transaction.rollback();
            return { error: "El usuario ya ha calificado este producto" };
        }

        // Create the new calification
        const calification = await calification_product_model.create({
            id_product,
            id_user,
            calification_product,
            comment_calification
        }, { transaction });

        // Update product's average calification
        await updateProductCalification(id_product, transaction);

        await transaction.commit();

        return {
            data: calification,
            success: "Calificación creada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_controller.js - create() - Error = ", err);
        return { error: "Error al crear la calificación" };
    }
}

async function update(id_calification, calificationData) {
    const transaction = await sequelize.transaction();
    
    try {
        const { calification_product, comment_calification } = calificationData;

        const calification = await calification_product_model.findByPk(id_calification);
        
        if (!calification) {
            await transaction.rollback();
            return { error: "Calificación no encontrada" };
        }

        // Update the calification
        if (calification_product !== undefined) calification.calification_product = calification_product;
        if (comment_calification !== undefined) calification.comment_calification = comment_calification;
        
        await calification.save({ transaction });

        // Update product's average calification
        await updateProductCalification(calification.id_product, transaction);

        await transaction.commit();

        return {
            data: calification,
            success: "Calificación actualizada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_controller.js - update() - Error = ", err);
        return { error: "Error al actualizar la calificación" };
    }
}

async function removeById(id_calification) {
    const transaction = await sequelize.transaction();
    
    try {
        const calification = await calification_product_model.findByPk(id_calification);
        
        if (!calification) {
            await transaction.rollback();
            return { error: "Calificación no encontrada" };
        }

        const id_product = calification.id_product;
        
        await calification.destroy({ transaction });

        // Update product's average calification
        await updateProductCalification(id_product, transaction);

        await transaction.commit();

        return {
            data: id_calification,
            success: "Calificación eliminada exitosamente"
        };
    } catch (err) {
        await transaction.rollback();
        console.error("-> calification_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la calificación" };
    }
}

async function getByProductId(id_product) {
    try {
        const califications = await calification_product_model.findAll({
            where: { id_product: id_product }
        });

        if (!califications || califications.length === 0) {
            return { 
                data: [], 
                success: "No hay calificaciones para este producto" 
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
            success: "Calificaciones encontradas"
        };
    } catch (err) {
        console.error("-> calification_controller.js - getByProductId() - Error = ", err);
        return { error: "Error al obtener las calificaciones del producto" };
    }
}

async function getByUserId(id_user) {
    try {
        const califications = await calification_product_model.findAll({
            where: { id_user: id_user }
        });

        if (!califications || califications.length === 0) {
            return { 
                data: [], 
                success: "No hay calificaciones de este usuario" 
            };
        }

        // Manually get product data for each calification
        const calificationsWithProducts = await Promise.all(
            califications.map(async (cal) => {
                const product = await product_model.findByPk(cal.id_product, {
                    attributes: ['name_product', 'image_product']
                });
                return {
                    ...cal.dataValues,
                    product: product ? product.dataValues : null
                };
            })
        );

        return {
            data: calificationsWithProducts,
            success: "Calificaciones encontradas"
        };
    } catch (err) {
        console.error("-> calification_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener las calificaciones del usuario" };
    }
}

async function getByUserAndProduct(id_user, id_product) {
    try {
        const calification = await calification_product_model.findOne({
            where: {
                id_user: id_user,
                id_product: id_product
            }
        });

        if (!calification) {
            return { 
                data: null,
                success: "El usuario no ha calificado este producto" 
            };
        }

        return {
            data: calification,
            success: "Calificación encontrada"
        };
    } catch (err) {
        console.error("-> calification_controller.js - getByUserAndProduct() - Error = ", err);
        return { error: "Error al obtener la calificación" };
    }
}

// Helper function to update product's average calification
async function updateProductCalification(id_product, transaction) {
    try {
        // Calculate the average calification
        const result = await calification_product_model.findOne({
            where: { id_product: id_product },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('calification_product')), 'total_stars'],
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

        // Update the product's calification field
        await product_model.update(
            { calification_product: averageCalification },
            { 
                where: { id_product: id_product },
                transaction 
            }
        );

        return { success: true };
    } catch (err) {
        console.error("-> calification_controller.js - updateProductCalification() - Error = ", err);
        throw err;
    }
}

async function getProductCalificationStats(id_product) {
    try {
        const stats = await calification_product_model.findOne({
            where: { id_product: id_product },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('calification_product')), 'average'],
                [sequelize.fn('COUNT', sequelize.col('id_calification')), 'total'],
                [sequelize.fn('SUM', sequelize.col('calification_product')), 'sum']
            ],
            raw: true
        });

        return {
            data: {
                average: parseFloat(stats.average) || 0,
                total: parseInt(stats.total) || 0,
                sum: parseInt(stats.sum) || 0
            },
            success: "Estadísticas de calificación obtenidas"
        };
    } catch (err) {
        console.error("-> calification_controller.js - getProductCalificationStats() - Error = ", err);
        return { error: "Error al obtener las estadísticas de calificación" };
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