import productController from "./product_controller.js";

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
        const {name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop } = req.body;

        if (name_product === undefined || price_product === undefined || discount_product === undefined || season_product === undefined || calification_product === undefined || type_product === undefined || stock_product === undefined || info_product === undefined || id_shop === undefined) {
            res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }

        if(price_product < 0 || discount_product < 0 || calification_product < 0 || stock_product < 0) {
            res.status(400).json({
                error: "Los campos numéricos no pueden ser negativos"
            });
        }

        const {error, data, success} = await productController.create({name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop});

        
        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - create() - Error =", err);
        res.status(500).json({ 
            error: "Error al crear un producto", 
            data: data
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

async function update(req, res) {
    try {
        const {id_product, name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop  } = req.body;

        if(id_product === undefined|| name_product === undefined || price_product === undefined || discount_product === undefined || season_product === undefined || calification_product === undefined || type_product === undefined || stock_product === undefined || info_product === undefined || id_shop === undefined) {
            res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }
        
        const {error, data, success} = await productController.update(id_product, {name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop});   

        res.json({error, data, success}); 
    } catch (err) {
        console.error("-> product_api_controller.js - update() - Error =", err);
        res.status(500).json({ 
            error: "Error al actualizar un producto", 
            data: data
        });
    }

    // res.json({error, data});
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
            console.error('-> product_api_controller.js - getByShopId() - Error = El id del negocio es obligatorio');
            res.status(400).json({ 
                error: 'El parámetro id_shop es obligatorio', 
            });
        }

        const {error, data, success} = await productController.getByShopId(id_shop);

        res.json({error, data, success});    
    } catch (err) {
        console.error("-> product_api_controller.js - getByShopId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener los productos del negocio", 
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

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getByType,
    getOnSale
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByShopId,
    getByType,
    getOnSale
}