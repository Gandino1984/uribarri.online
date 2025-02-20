import productController from "./product_controller.js";
import product_model from "../../models/product_model.js";

async function getAll(req, res) {
    try {
        const {error, data, success} = await productController.getAll();
        res.json({error, data, success});
    } catch (err) {
        console.error("-> product_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los productos", 
            data: data
        });
    }
}

async function create(req, res) {
    try {
        const {
            name_product, 
            price_product, 
            discount_product, 
            season_product, 
            calification_product, 
            type_product, 
            subtype_product, 
            stock_product, 
            info_product, 
            id_shop,
            second_hand
        } = req.body;

        if (name_product === undefined || 
            price_product === undefined || 
            discount_product === undefined || 
            season_product === undefined || 
            calification_product === undefined || 
            type_product === undefined || 
            subtype_product === undefined || 
            stock_product === undefined || 
            info_product === undefined || 
            id_shop === undefined ||
            second_hand === undefined) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }

        if(price_product < 0 || 
           discount_product < 0 || 
           calification_product < 0 || 
           stock_product < 0) {
            return res.status(400).json({
                error: "Los campos numéricos no pueden ser negativos"
            });
        }

        const {error, data, success} = await productController.create({
            name_product, 
            price_product, 
            discount_product, 
            season_product, 
            calification_product, 
            type_product, 
            subtype_product, 
            stock_product, 
            info_product, 
            id_shop,
            second_hand
        });

        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - create() - Error =", err);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            error: "Error al crear un producto", 
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_product,
            name_product, 
            price_product, 
            discount_product, 
            season_product, 
            calification_product, 
            type_product,
            subtype_product, 
            stock_product, 
            info_product, 
            id_shop,
            second_hand
        } = req.body;

        if(id_product === undefined || 
           name_product === undefined || 
           price_product === undefined || 
           discount_product === undefined || 
           season_product === undefined || 
           calification_product === undefined || 
           type_product === undefined ||
           subtype_product === undefined || 
           stock_product === undefined || 
           info_product === undefined || 
           id_shop === undefined ||
           second_hand === undefined) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }

        if(price_product < 0 || 
           discount_product < 0 || 
           calification_product < 0 || 
           stock_product < 0) {
            return res.status(400).json({
                error: "Los campos numéricos no pueden ser negativos"
            });
        }
        
        const {error, data, success} = await productController.update(
            id_product, 
            {
                name_product, 
                price_product, 
                discount_product, 
                season_product, 
                calification_product, 
                type_product,
                subtype_product, 
                stock_product, 
                info_product, 
                id_shop,
                second_hand
            }
        );   

        res.json({error, data, success}); 
    } catch (err) {
        console.error("-> product_api_controller.js - update() - Error =", err);
        res.status(500).json({ 
            error: "Error al actualizar un producto", 
            data: null
        });
    }
}

async function getById(req, res) {
    try {
        const id_product = req.params.id_product;

        if (!id_product) {  
            console.error('-> product_api_controller.js - getById() - Error = El parámetro id_product es obligatorio');
            res.status(400).json({ 
                error: 'El parámetro id_product es obligatorio', 
            });
        }

        const {error, data, success} = await productController.getById(id_product);

        res.json({error, data, success});
    } catch (err) {
        console.error("-> product_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener un producto", 
            data: data
        });
    }
}



async function removeById(req, res) {
    try {
        const id_product = req.params.id_product;
        
        if (!id_product) {  
            console.error('-> product_api_controller.js - removeById() - Error = El parámetro id_product es obligatorio');
            res.status(400).json({ 
                error: 'El parámetro id_product es obligatorio', 
            });
        }

        const {error, data, success} = await productController.removeById(id_product);
        
        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar un producto", 
            data: data
        });
    }
}

async function getByShopId(req, res) {
    try {
        const { id_shop } = req.params;

        if (!id_shop) {
            console.error('-> product_api_controller.js - getByShopId() - Error = El id del comercio es obligatorio');
            res.status(400).json({ 
                error: 'El parámetro id_shop es obligatorio', 
            });
        }

        const {error, data, success} = await productController.getByShopId(id_shop);

        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los productos del comercio", 
            data: data
        });
    }
}

async function getByType(req, res) {
    try {
        const {type_product} = req.params;
        
        if (!type_product){
            res.status(400).json({
                error: "El tipo de producto es obligatorio"
            });
        }
        
        const {error, data, success} = await productController.getByType(type_product);
        
        res.json({error, data, success});
    } catch (err) {
        console.error("-> product_api_controller.js - getByType() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los productos por tipo", 
            data: data
        });
    }
}

async function getOnSale(req, res) {    
    try {
        const {error, data, success} = await productController.getOnSale();
        
        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - getOnSale() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los productos en oferta", 
            data: data
        });
    }
}

async function updateProductImage(id_product, imagePath) {
    try {
        if (!id_product || !imagePath) {
            return { 
                error: 'El ID del producto y la ruta de la imagen son obligatorios' 
            };
        }

        const product = await product_model.findByPk(id_product);
        if (!product) {
            return { 
                error: "Producto no encontrado" 
            };
        }

        // Update the product's image path
        product.image_product = imagePath;
        await product.save();

        return { 
            data: { image_product: imagePath },
            success: "Imagen de producto actualizada correctamente"
        };
    } catch (err) {
        console.error("-> product_api_controller.js - updateProductImage() - Error =", err);
        return { 
            error: "Error al actualizar la imagen de producto",
            details: err.message 
        };
    }
}

async function deleteImage(req, res) {
    try {
      const { id_product } = req.params;
      const { imagePath, folderPath } = req.body;
  
      if (!id_product || !imagePath || !folderPath) {
        return res.status(400).json({ error: 'ID del producto, ruta de la imagen y ruta de la carpeta son obligatorios' });
      }
  
      // Call the productController to delete the image and folder
      const result = await productController.deleteImage(id_product, imagePath, folderPath);
  
      if (result.error) {
        return res.status(400).json(result);
      }
  
      return res.json(result);
    } catch (error) {
      console.error('Error deleting image and folder:', error);
      return res.status(500).json({
        error: 'Error al eliminar la imagen y la carpeta',
        details: error.message,
      });
    }
  }
  

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getByType,
    getOnSale,
    updateProductImage,
    deleteImage
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getByType,
    getOnSale,
    updateProductImage,
    deleteImage
}