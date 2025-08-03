import order_model from "../../models/order_model.js";
import order_product_model from "../../models/order_product_model.js";
import order_package_model from "../../models/order_package_model.js";
import user_model from "../../models/user_model.js";
import shop_model from "../../models/shop_model.js";
import product_model from "../../models/product_model.js";
import package_model from "../../models/package_model.js";

async function validateUser(id_user) {
    try {
        const user = await user_model.findOne({
            where: {
                id_user: id_user
            }
        });
        
        if (!user) {
            return {
                isValid: false,
                error: "El usuario no existe"
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

//update: Add rider validation
async function validateRider(id_rider) {
    try {
        const rider = await user_model.findOne({
            where: {
                id_user: id_rider,
                type_user: 'rider'
            }
        });
        
        if (!rider) {
            return {
                isValid: false,
                error: "El repartidor no existe o el usuario no es un repartidor"
            };
        }
        
        return {
            isValid: true,
            rider: rider
        };
    } catch (err) {
        console.error("Error validating rider:", err);
        return {
            isValid: false,
            error: "Error al validar el repartidor"
        };
    }
}

async function validateProduct(id_product, id_shop) {
    try {
        const product = await product_model.findOne({
            where: {
                id_product: id_product,
                id_shop: id_shop
            }
        });
        
        if (!product) {
            return {
                isValid: false,
                error: "El producto no existe o no pertenece a este comercio"
            };
        }
        
        return {
            isValid: true,
            product: product
        };
    } catch (err) {
        console.error("Error validating product:", err);
        return {
            isValid: false,
            error: "Error al validar el producto"
        };
    }
}

async function validatePackage(id_package, id_shop) {
    try {
        const packageItem = await package_model.findOne({
            where: {
                id_package: id_package,
                id_shop: id_shop
            }
        });
        
        if (!packageItem) {
            return {
                isValid: false,
                error: "El paquete no existe o no pertenece a este comercio"
            };
        }
        
        return {
            isValid: true,
            package: packageItem
        };
    } catch (err) {
        console.error("Error validating package:", err);
        return {
            isValid: false,
            error: "Error al validar el paquete"
        };
    }
}

async function getAll() {
    try {
        const orders = await order_model.findAll({
            order: [['created_at', 'DESC']]
        });

        if (!orders || orders.length === 0) {
            return { error: "No hay pedidos registrados" };
        }

        const ordersWithDetails = [];
        for (const order of orders) {
            const user = await user_model.findByPk(order.id_user);
            const shop = await shop_model.findByPk(order.id_shop);
            //update: Get rider info if exists
            const rider = order.id_rider ? await user_model.findByPk(order.id_rider) : null;
            
            // Get order products
            const orderProducts = [];
            if (order.id_order_products && order.id_order_products.length > 0) {
                for (const id of order.id_order_products) {
                    const orderProduct = await order_product_model.findByPk(id);
                    if (orderProduct) {
                        const product = await product_model.findByPk(orderProduct.id_product);
                        orderProducts.push({
                            ...orderProduct.toJSON(),
                            product: product ? product.toJSON() : null
                        });
                    }
                }
            }

            // Get order packages
            const orderPackages = [];
            if (order.id_order_packages && order.id_order_packages.length > 0) {
                for (const id of order.id_order_packages) {
                    const orderPackage = await order_package_model.findByPk(id);
                    if (orderPackage) {
                        const packageItem = await package_model.findByPk(orderPackage.id_package);
                        orderPackages.push({
                            ...orderPackage.toJSON(),
                            package: packageItem ? packageItem.toJSON() : null
                        });
                    }
                }
            }
            
            ordersWithDetails.push({
                ...order.toJSON(),
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user
                } : null,
                shop: shop ? {
                    id_shop: shop.id_shop,
                    name_shop: shop.name_shop,
                    location_shop: shop.location_shop
                } : null,
                //update: Add rider info
                rider: rider ? {
                    id_rider: rider.id_user,
                    name_rider: rider.name_user,
                    email_rider: rider.email_user
                } : null,
                order_products: orderProducts,
                order_packages: orderPackages
            });
        }

        console.log("-> order_controller.js - getAll() - pedidos encontrados = ", ordersWithDetails.length);

        return { data: ordersWithDetails };
    } catch (err) {
        console.error("-> order_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los pedidos" };
    }
}

async function getById(id_order) {
    try {
        const order = await order_model.findByPk(id_order);

        if (!order) {
            return { error: "Pedido no encontrado" };
        }

        const user = await user_model.findByPk(order.id_user);
        const shop = await shop_model.findByPk(order.id_shop);
        //update: Get rider info if exists
        const rider = order.id_rider ? await user_model.findByPk(order.id_rider) : null;
        
        // Get order products
        const orderProducts = [];
        if (order.id_order_products && order.id_order_products.length > 0) {
            for (const id of order.id_order_products) {
                const orderProduct = await order_product_model.findByPk(id);
                if (orderProduct) {
                    const product = await product_model.findByPk(orderProduct.id_product);
                    orderProducts.push({
                        ...orderProduct.toJSON(),
                        product: product ? product.toJSON() : null
                    });
                }
            }
        }

        // Get order packages
        const orderPackages = [];
        if (order.id_order_packages && order.id_order_packages.length > 0) {
            for (const id of order.id_order_packages) {
                const orderPackage = await order_package_model.findByPk(id);
                if (orderPackage) {
                    const packageItem = await package_model.findByPk(orderPackage.id_package);
                    orderPackages.push({
                        ...orderPackage.toJSON(),
                        package: packageItem ? packageItem.toJSON() : null
                    });
                }
            }
        }
        
        const orderWithDetails = {
            ...order.toJSON(),
            user: user ? {
                id_user: user.id_user,
                name_user: user.name_user,
                email_user: user.email_user
            } : null,
            shop: shop ? {
                id_shop: shop.id_shop,
                name_shop: shop.name_shop,
                location_shop: shop.location_shop
            } : null,
            //update: Add rider info
            rider: rider ? {
                id_rider: rider.id_user,
                name_rider: rider.name_user,
                email_rider: rider.email_user
            } : null,
            order_products: orderProducts,
            order_packages: orderPackages
        };

        return { data: orderWithDetails };
    } catch (err) {
        console.error("-> order_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el pedido" };
    }
}

async function getByUserId(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID del usuario es obligatorio" };
        }

        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const orders = await order_model.findAll({
            where: { id_user: id_user },
            order: [['created_at', 'DESC']]
        });

        if (!orders || orders.length === 0) {
            return { error: "No hay pedidos registrados para este usuario", data: [] };
        }

        const ordersWithDetails = [];
        for (const order of orders) {
            const shop = await shop_model.findByPk(order.id_shop);
            //update: Get rider info if exists
            const rider = order.id_rider ? await user_model.findByPk(order.id_rider) : null;
            
            // Get order products
            const orderProducts = [];
            if (order.id_order_products && order.id_order_products.length > 0) {
                for (const id of order.id_order_products) {
                    const orderProduct = await order_product_model.findByPk(id);
                    if (orderProduct) {
                        const product = await product_model.findByPk(orderProduct.id_product);
                        orderProducts.push({
                            ...orderProduct.toJSON(),
                            product: product ? product.toJSON() : null
                        });
                    }
                }
            }

            // Get order packages
            const orderPackages = [];
            if (order.id_order_packages && order.id_order_packages.length > 0) {
                for (const id of order.id_order_packages) {
                    const orderPackage = await order_package_model.findByPk(id);
                    if (orderPackage) {
                        const packageItem = await package_model.findByPk(orderPackage.id_package);
                        orderPackages.push({
                            ...orderPackage.toJSON(),
                            package: packageItem ? packageItem.toJSON() : null
                        });
                    }
                }
            }
            
            ordersWithDetails.push({
                ...order.toJSON(),
                shop: shop ? {
                    id_shop: shop.id_shop,
                    name_shop: shop.name_shop,
                    location_shop: shop.location_shop
                } : null,
                //update: Add rider info
                rider: rider ? {
                    id_rider: rider.id_user,
                    name_rider: rider.name_user,
                    email_rider: rider.email_user
                } : null,
                order_products: orderProducts,
                order_packages: orderPackages
            });
        }

        console.log("-> order_controller.js - getByUserId() - pedidos encontrados = ", ordersWithDetails.length);

        return { data: ordersWithDetails };
    } catch (err) {
        console.error("-> order_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener pedidos por usuario" };
    }
}

async function getByShopId(id_shop) {
    try {
        if (!id_shop) {
            return { error: "El ID del comercio es obligatorio" };
        }

        const shopValidation = await validateShop(id_shop);
        if (!shopValidation.isValid) {
            return { error: shopValidation.error };
        }

        const orders = await order_model.findAll({
            where: { id_shop: id_shop },
            order: [['created_at', 'DESC']]
        });

        if (!orders || orders.length === 0) {
            return { error: "No hay pedidos registrados para este comercio", data: [] };
        }

        const ordersWithDetails = [];
        for (const order of orders) {
            const user = await user_model.findByPk(order.id_user);
            //update: Get rider info if exists
            const rider = order.id_rider ? await user_model.findByPk(order.id_rider) : null;
            
            // Get order products
            const orderProducts = [];
            if (order.id_order_products && order.id_order_products.length > 0) {
                for (const id of order.id_order_products) {
                    const orderProduct = await order_product_model.findByPk(id);
                    if (orderProduct) {
                        const product = await product_model.findByPk(orderProduct.id_product);
                        orderProducts.push({
                            ...orderProduct.toJSON(),
                            product: product ? product.toJSON() : null
                        });
                    }
                }
            }

            // Get order packages
            const orderPackages = [];
            if (order.id_order_packages && order.id_order_packages.length > 0) {
                for (const id of order.id_order_packages) {
                    const orderPackage = await order_package_model.findByPk(id);
                    if (orderPackage) {
                        const packageItem = await package_model.findByPk(orderPackage.id_package);
                        orderPackages.push({
                            ...orderPackage.toJSON(),
                            package: packageItem ? packageItem.toJSON() : null
                        });
                    }
                }
            }
            
            ordersWithDetails.push({
                ...order.toJSON(),
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user
                } : null,
                //update: Add rider info
                rider: rider ? {
                    id_rider: rider.id_user,
                    name_rider: rider.name_user,
                    email_rider: rider.email_user
                } : null,
                order_products: orderProducts,
                order_packages: orderPackages
            });
        }

        console.log("-> order_controller.js - getByShopId() - pedidos encontrados = ", ordersWithDetails.length);

        return { data: ordersWithDetails };
    } catch (err) {
        console.error("-> order_controller.js - getByShopId() - Error = ", err);
        return { error: "Error al obtener pedidos por comercio" };
    }
}

//update: Add getByRiderId function
async function getByRiderId(id_rider) {
    try {
        if (!id_rider) {
            return { error: "El ID del repartidor es obligatorio" };
        }

        const riderValidation = await validateRider(id_rider);
        if (!riderValidation.isValid) {
            return { error: riderValidation.error };
        }

        const orders = await order_model.findAll({
            where: { id_rider: id_rider },
            order: [['created_at', 'DESC']]
        });

        if (!orders || orders.length === 0) {
            return { error: "No hay pedidos asignados a este repartidor", data: [] };
        }

        const ordersWithDetails = [];
        for (const order of orders) {
            const user = await user_model.findByPk(order.id_user);
            const shop = await shop_model.findByPk(order.id_shop);
            
            // Get order products
            const orderProducts = [];
            if (order.id_order_products && order.id_order_products.length > 0) {
                for (const id of order.id_order_products) {
                    const orderProduct = await order_product_model.findByPk(id);
                    if (orderProduct) {
                        const product = await product_model.findByPk(orderProduct.id_product);
                        orderProducts.push({
                            ...orderProduct.toJSON(),
                            product: product ? product.toJSON() : null
                        });
                    }
                }
            }

            // Get order packages
            const orderPackages = [];
            if (order.id_order_packages && order.id_order_packages.length > 0) {
                for (const id of order.id_order_packages) {
                    const orderPackage = await order_package_model.findByPk(id);
                    if (orderPackage) {
                        const packageItem = await package_model.findByPk(orderPackage.id_package);
                        orderPackages.push({
                            ...orderPackage.toJSON(),
                            package: packageItem ? packageItem.toJSON() : null
                        });
                    }
                }
            }
            
            ordersWithDetails.push({
                ...order.toJSON(),
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user
                } : null,
                shop: shop ? {
                    id_shop: shop.id_shop,
                    name_shop: shop.name_shop,
                    location_shop: shop.location_shop
                } : null,
                order_products: orderProducts,
                order_packages: orderPackages
            });
        }

        console.log("-> order_controller.js - getByRiderId() - pedidos encontrados = ", ordersWithDetails.length);

        return { data: ordersWithDetails };
    } catch (err) {
        console.error("-> order_controller.js - getByRiderId() - Error = ", err);
        return { error: "Error al obtener pedidos por repartidor" };
    }
}

async function create(orderData) {
    try {
        // Validate user
        const userValidation = await validateUser(orderData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        // Validate shop
        const shopValidation = await validateShop(orderData.id_shop);
        if (!shopValidation.isValid) {
            return { error: shopValidation.error };
        }

        //update: Validate rider if provided
        if (orderData.id_rider) {
            const riderValidation = await validateRider(orderData.id_rider);
            if (!riderValidation.isValid) {
                return { error: riderValidation.error };
            }
        }

        // Create order products
        const orderProductIds = [];
        let totalOrderPrice = 0;

        if (orderData.products && orderData.products.length > 0) {
            for (const productData of orderData.products) {
                // Validate product
                const productValidation = await validateProduct(productData.id_product, orderData.id_shop);
                if (!productValidation.isValid) {
                    // Rollback created order products
                    for (const id of orderProductIds) {
                        await order_product_model.destroy({ where: { id_order_product: id } });
                    }
                    return { error: productValidation.error };
                }

                const product = productValidation.product;
                const totalPrice = product.price_product * productData.quantity;

                const orderProduct = await order_product_model.create({
                    id_product: productData.id_product,
                    quantity: productData.quantity,
                    unit_price: product.price_product,
                    total_price: totalPrice,
                    product_notes: productData.product_notes
                });

                orderProductIds.push(orderProduct.id_order_product);
                totalOrderPrice += totalPrice;
            }
        }

        // Create order packages
        const orderPackageIds = [];

        if (orderData.packages && orderData.packages.length > 0) {
            for (const packageData of orderData.packages) {
                // Validate package
                const packageValidation = await validatePackage(packageData.id_package, orderData.id_shop);
                if (!packageValidation.isValid) {
                    // Rollback created items
                    for (const id of orderProductIds) {
                        await order_product_model.destroy({ where: { id_order_product: id } });
                    }
                    for (const id of orderPackageIds) {
                        await order_package_model.destroy({ where: { id_order_package: id } });
                    }
                    return { error: packageValidation.error };
                }

                const packageItem = packageValidation.package;
                const totalPrice = packageItem.price_package * packageData.quantity;

                const orderPackage = await order_package_model.create({
                    id_package: packageData.id_package,
                    quantity: packageData.quantity,
                    unit_price: packageItem.price_package,
                    total_price: totalPrice,
                    package_notes: packageData.package_notes
                });

                orderPackageIds.push(orderPackage.id_order_package);
                totalOrderPrice += totalPrice;
            }
        }

        // Check if order has at least one product or package
        if (orderProductIds.length === 0 && orderPackageIds.length === 0) {
            return { error: "El pedido debe contener al menos un producto o paquete" };
        }

        // Create the order
        const order = await order_model.create({
            id_user: orderData.id_user,
            id_shop: orderData.id_shop,
            //update: Add rider fields
            id_rider: orderData.id_rider || null,
            rider_accepted: orderData.id_rider ? false : null,
            id_order_products: orderProductIds,
            id_order_packages: orderPackageIds,
            total_price: totalOrderPrice,
            order_status: orderData.order_status || 'pending',
            delivery_type: orderData.delivery_type || 'pickup',
            delivery_address: orderData.delivery_address,
            order_notes: orderData.order_notes
        });

        // Return order with details
        const orderWithDetails = await getById(order.id_order);
        
        return { 
            success: "¡Pedido creado exitosamente!",
            data: orderWithDetails.data
        };
    } catch (err) {
        console.error("-> order_controller.js - create() - Error al crear el pedido =", err);
        return { error: "Error al crear el pedido." };
    }
}

async function updateStatus(id_order, new_status) {
    try {
        const order = await order_model.findByPk(id_order);
        
        if (!order) {
            return { error: "Pedido no encontrado" };
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(new_status)) {
            return { error: "Estado de pedido inválido" };
        }

        await order.update({ order_status: new_status });
        
        const updatedOrder = await getById(id_order);
        
        return { 
            data: updatedOrder.data,
            message: "Estado del pedido actualizado exitosamente"
        };
    } catch (err) {
        console.error("Error al actualizar estado del pedido =", err);
        return { error: "Error al actualizar el estado del pedido" };
    }
}

async function cancel(id_order, cancellation_reason) {
    try {
        const order = await order_model.findByPk(id_order);
        
        if (!order) {
            return { error: "Pedido no encontrado" };
        }

        if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
            return { error: "No se puede cancelar un pedido que ya fue entregado o cancelado" };
        }

        const currentNotes = order.order_notes || '';
        const updatedNotes = currentNotes + `\n\n[CANCELADO] - ${new Date().toLocaleString()}: ${cancellation_reason || 'Sin razón especificada'}`;

        await order.update({ 
            order_status: 'cancelled',
            order_notes: updatedNotes
        });
        
        const updatedOrder = await getById(id_order);
        
        return { 
            data: updatedOrder.data,
            message: "Pedido cancelado exitosamente"
        };
    } catch (err) {
        console.error("Error al cancelar el pedido =", err);
        return { error: "Error al cancelar el pedido" };
    }
}

//update: Add assignRider function
async function assignRider(id_order, id_rider) {
    try {
        const order = await order_model.findByPk(id_order);
        
        if (!order) {
            return { error: "Pedido no encontrado" };
        }

        if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
            return { error: "No se puede asignar un repartidor a un pedido entregado o cancelado" };
        }

        // Validate rider
        const riderValidation = await validateRider(id_rider);
        if (!riderValidation.isValid) {
            return { error: riderValidation.error };
        }

        await order.update({ 
            id_rider: id_rider,
            rider_accepted: false
        });
        
        const updatedOrder = await getById(id_order);
        
        return { 
            data: updatedOrder.data,
            message: "Repartidor asignado exitosamente"
        };
    } catch (err) {
        console.error("Error al asignar repartidor =", err);
        return { error: "Error al asignar el repartidor" };
    }
}

//update: Add riderResponse function
async function riderResponse(id_order, id_rider, accepted) {
    try {
        const order = await order_model.findByPk(id_order);
        
        if (!order) {
            return { error: "Pedido no encontrado" };
        }

        if (!order.id_rider || order.id_rider !== id_rider) {
            return { error: "Este pedido no está asignado a este repartidor" };
        }

        if (order.rider_accepted !== null) {
            return { error: "El repartidor ya respondió a este pedido" };
        }

        if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
            return { error: "No se puede responder a un pedido entregado o cancelado" };
        }

        if (accepted) {
            await order.update({ 
                rider_accepted: true,
                order_status: 'confirmed'
            });
        } else {
            // If rider rejects, remove assignment
            await order.update({ 
                id_rider: null,
                rider_accepted: null
            });
        }
        
        const updatedOrder = await getById(id_order);
        
        return { 
            data: updatedOrder.data,
            message: accepted ? "Pedido aceptado por el repartidor" : "Pedido rechazado por el repartidor"
        };
    } catch (err) {
        console.error("Error al procesar respuesta del repartidor =", err);
        return { error: "Error al procesar la respuesta del repartidor" };
    }
}

export { 
    getAll, 
    getById,
    getByUserId,
    getByShopId,
    getByRiderId,
    create, 
    updateStatus,
    cancel,
    assignRider,
    riderResponse
}

export default { 
    getAll, 
    getById,
    getByUserId,
    getByShopId,
    getByRiderId,
    create, 
    updateStatus,
    cancel,
    assignRider,
    riderResponse
}