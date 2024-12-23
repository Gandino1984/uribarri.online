import shop_model from "../../models/shop_model.js";
import user_model from "../../models/user_model.js";

async function getAll() {
    try {
        const shops = await shop_model.findAll();

        if (!shops || shops.length === 0) {
            return { error: "No hay tiendas registradas", data: [] };
        }

        console.log("-> shop_controller.js - getAll() - Tiendas encontradas = ", shops);

        return { data: shops };
    } catch (err) {
        console.error("-> shop_controller.js - getAll() -Error = ", err);
        return { error: err.message };
    }
}

async function create(shopData) {
    try {
        // Check if user already exists by name
        console.log('-> shop_controller.js - create() - Buscando shopData.name_shop en la DB = ', shopData.name_shop);

        const existingShop = await shop_model.findOne({ 
            where: { name_shop: shopData.name_shop } 
        });

        if (existingShop) {
            console.error("Ya existe una tienda con ese nombre");
            return { 
                error: "Ya existe una tienda con ese nombre", 
                data: null 
            };
        }

        // If no existing shop, proceed with creation
        const shop = await shop_model.create(shopData);
        
        return { data: shop };
    } catch (err) {
        return { error: err.message };
    }
}

async function getByType(shopType) {
    try {
        const shops = await shop_model.findAll({ 
            where: { type_shop: shopType }
        });

        if (shops.length === 0) {
            console.warn(`No hay tiendas registradas de tipo =  ${shopType}`);
            return { error: "No hay tiendas registradas de este tipo" }
             }

        return { data: shops };
    
    } catch (err) {
        console.error("-> shop_controller.js - getByType() - Error = ", err);
        return { error: err.message };
    }
}

async function update(id, shopData) {
    try {
        const { name_shop, location_shop, type_shop } = shopData;
        const shop = await shop_model.findByPk(id);
        if (!shop) {
            console.log("shop not found with id:", id);
            return { error: "shop not found" };
        }
        // Only update fields that were provided
        if (name_shop) shop.name_shop = name_shop;
        if (location_shop) shop.location_shop = location_shop;
        if (type_shop) shop.type_shop = type_shop;
        await shop.save();
        console.log("Updated shop:", shop);
        return { data: shop };
    } catch (err) {
        console.error("Error al actualizar la tienda =", err);
        return { error: err.message };
    }
}

async function getByUserId(id) {
    try {
        const shops = await shop_model.findAll({ 
            where: { id_user: id }
        }); 

        console.log(`-> shop_controller.js - getByUserId() - Retrieved shops for user ${id}:`, shops);
        
        if (shops.length === 0) {
            console.log(`-> shop_controller.js - getByUserId() - No shops found for user ID: ${id}`);
            return { error: "No se encontraron tiendas para este usuario" };
        }
        return { data: shops };
    } catch (err) {
        console.error("-> shop_controller.js - getByUserId() - Error = ", err);
        return { error: err.message };
    }
}

async function removeById(id_shop) {
    try {
        if (!id_shop) {
            return { error: "Shop not found"};
        }

        const shop = await shop_model.findByPk(id_shop);
        
        if (!shop) {
            return { 
                error: "Negocio no encontrado",
                details: "Negocio no encontrado" 
            };
        }
   
      await shop.destroy();

      return { 
        data:  id_shop,
        message: "El usuario se ha borrado correctamente" 
        };
    } catch (err) {
      console.error("Error in removeById:", err);
      return { 
        error: "An error occurred while deleting the shop",
        details: err.message
       };
    }
  }

async function getTypesOfShops() {
    try {
      const shopTypes = await shop_model.findAll({
        attributes: ['type_shop'],
        group: ['type_shop'],
      });
      return { data: shopTypes.map((type) => type.type_shop) };
    } catch (err) {
      console.error('Error al obtener todos los tipos de tiendas', err);
      return { error: err.message };
    }
  }

export { getAll, 
    create, 
    update, 
    removeById, 
    getByType, 
    getByUserId, 
    getTypesOfShops }

export default { getAll, 
    create, 
    update, 
    removeById, 
    getByType, 
    getByUserId, 
    getTypesOfShops }