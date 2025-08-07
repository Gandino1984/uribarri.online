import order_product_model from "../../models/order_product_model.js";
import product_model from "../../models/product_model.js";

async function getAll() {
    try {
        const orderProducts = await order_product_model.findAll();

        if (!orderProducts || orderProducts.length === 0) {
            return { error: "No hay productos de pedido registrados" };
        }

        const orderProductsWithDetails = [];
        for (const orderProduct of orderProducts) {
            const product = await product_model.findByPk(orderProduct.id_product);
            
            orderProductsWithDetails.push({
                ...orderProduct.toJSON(),
                product: product ? product.toJSON() : null
            });
        }

        return { data: orderProductsWithDetails };
    } catch (err) {
        console.error("-> order_product_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los productos de pedido" };
    }
}

async function getById(id_order_product) {
    try {
        const orderProduct = await order_product_model.findByPk(id_order_product);

        if (!orderProduct) {
            return { error: "Producto de pedido no encontrado" };
        }

        const product = await product_model.findByPk(orderProduct.id_product);
        
        const orderProductWithDetails = {
            ...orderProduct.toJSON(),
            product: product ? product.toJSON() : null
        };

        return { data: orderProductWithDetails };
    } catch (err) {
        console.error("-> order_product_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el producto de pedido" };
    }
}

async function create(orderProductData) {
    try {
        const product = await product_model.findByPk(orderProductData.id_product);
        
        if (!product) {
            return { error: "El producto no existe" };
        }

        const totalPrice = product.price_product * orderProductData.quantity;

        const orderProduct = await order_product_model.create({
            id_product: orderProductData.id_product,
            quantity: orderProductData.quantity,
            unit_price: product.price_product,
            total_price: totalPrice,
            product_notes: orderProductData.product_notes
        });
        
        return { 
            success: "¡Producto de pedido creado!",
            data: orderProduct
        };
    } catch (err) {
        console.error("-> order_product_controller.js - create() - Error =", err);
        return { error: "Error al crear el producto de pedido." };
    }
}

async function update(id_order_product, orderProductData) {
    try {
        const orderProduct = await order_product_model.findByPk(id_order_product);
        
        if (!orderProduct) {
            return { error: "Producto de pedido no encontrado" };
        }

        if (orderProductData.quantity !== undefined) {
            const totalPrice = orderProduct.unit_price * orderProductData.quantity;
            orderProductData.total_price = totalPrice;
        }

        await orderProduct.update(orderProductData);
        
        const updatedOrderProduct = await getById(id_order_product);
        
        return { data: updatedOrderProduct.data };
    } catch (err) {
        console.error("Error al actualizar el producto de pedido =", err);
        return { error: "Error al actualizar el producto de pedido" };
    }
}

async function removeById(id_order_product) {
    try {
        const orderProduct = await order_product_model.findByPk(id_order_product);
        
        if (!orderProduct) {
            return { error: "Producto de pedido no encontrado" };
        }

        await orderProduct.destroy();

        return { 
            data: id_order_product,
            message: "El producto de pedido se ha eliminado." 
        };
    } catch (err) {
        console.error("-> order_product_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el producto de pedido" };
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