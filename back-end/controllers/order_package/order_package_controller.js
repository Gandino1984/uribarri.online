import order_package_model from "../../models/order_package_model.js";
import package_model from "../../models/package_model.js";

async function getAll() {
    try {
        const orderPackages = await order_package_model.findAll();

        if (!orderPackages || orderPackages.length === 0) {
            return { error: "No hay paquetes de pedido registrados" };
        }

        const orderPackagesWithDetails = [];
        for (const orderPackage of orderPackages) {
            const packageItem = await package_model.findByPk(orderPackage.id_package);
            
            orderPackagesWithDetails.push({
                ...orderPackage.toJSON(),
                package: packageItem ? packageItem.toJSON() : null
            });
        }

        return { data: orderPackagesWithDetails };
    } catch (err) {
        console.error("-> order_package_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los paquetes de pedido" };
    }
}

async function getById(id_order_package) {
    try {
        const orderPackage = await order_package_model.findByPk(id_order_package);

        if (!orderPackage) {
            return { error: "Paquete de pedido no encontrado" };
        }

        const packageItem = await package_model.findByPk(orderPackage.id_package);
        
        const orderPackageWithDetails = {
            ...orderPackage.toJSON(),
            package: packageItem ? packageItem.toJSON() : null
        };

        return { data: orderPackageWithDetails };
    } catch (err) {
        console.error("-> order_package_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el paquete de pedido" };
    }
}

async function create(orderPackageData) {
    try {
        const packageItem = await package_model.findByPk(orderPackageData.id_package);
        
        if (!packageItem) {
            return { error: "El paquete no existe" };
        }

        const totalPrice = packageItem.price_package * orderPackageData.quantity;

        const orderPackage = await order_package_model.create({
            id_package: orderPackageData.id_package,
            quantity: orderPackageData.quantity,
            unit_price: packageItem.price_package,
            total_price: totalPrice,
            package_notes: orderPackageData.package_notes
        });
        
        return { 
            success: "¡Paquete de pedido creado!",
            data: orderPackage
        };
    } catch (err) {
        console.error("-> order_package_controller.js - create() - Error =", err);
        return { error: "Error al crear el paquete de pedido." };
    }
}

async function update(id_order_package, orderPackageData) {
    try {
        const orderPackage = await order_package_model.findByPk(id_order_package);
        
        if (!orderPackage) {
            return { error: "Paquete de pedido no encontrado" };
        }

        if (orderPackageData.quantity !== undefined) {
            const totalPrice = orderPackage.unit_price * orderPackageData.quantity;
            orderPackageData.total_price = totalPrice;
        }

        await orderPackage.update(orderPackageData);
        
        const updatedOrderPackage = await getById(id_order_package);
        
        return { data: updatedOrderPackage.data };
    } catch (err) {
        console.error("Error al actualizar el paquete de pedido =", err);
        return { error: "Error al actualizar el paquete de pedido" };
    }
}

async function removeById(id_order_package) {
    try {
        const orderPackage = await order_package_model.findByPk(id_order_package);
        
        if (!orderPackage) {
            return { error: "Paquete de pedido no encontrado" };
        }

        await orderPackage.destroy();

        return { 
            data: id_order_package,
            message: "El paquete de pedido se ha eliminado." 
        };
    } catch (err) {
        console.error("-> order_package_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el paquete de pedido" };
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