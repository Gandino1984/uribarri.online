import productController from "./product_controller.js";

async function getAll(req, res) {
    const {error, data} = await productController.getAll();
    res.json({error, data});
}

async function getById(req, res) {
    const id = req.params.id;
    const {error, data} = await productController.getById(id);
    res.json({error, data});
}

async function create(req, res) {
    const { name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop } = req.body;
    const {error, data} = await productController.create({name_product, price_product, discount_product, season_product, calification_product, type_product, stock_product, info_product, id_shop});
    res.json({error, data});
}

async function update(req, res) {
    const id = req.params.id;
    const {id_product, name_product, price_product, discount_product, season_product } = req.query;
    const {error, data} = await productController.update(id, {id_product, name_product, price_product, discount_product, season_product});
    res.json({error, data});
}

async function removeById(req, res) {
    const id = req.params.id;
    const {error, data} = await productController.removeById(id);
    res.json({error, data});
}

async function getByShopId(req, res) {
    const { id_shop } = req.body;
    const {error, data} = await productController.getByShopId(id_shop);
    res.json({error, data});
}

async function getByType(req, res) {
    const {error, data} = await productController.getByType();
    res.json({error, data});
}

async function getOnSale(req, res) {
    const {error, data} = await productController.getOnSale();
    if (error) {
        res.status(500).json({ error: error });
    } else {
        res.json({ data: data });
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