import providerController from "./provider_controller.js";

async function getAll(req, res) {
    const {error, data} = await providerController.getAll();
    res.json({error, data});
}

async function getById(req, res) {
    const id = req.params.id;
    const {error, data} = await providerController.getById(id);
    res.json({error, data});
}

async function create(req, res) {
    //post method
    // const {id_provider, name_provider, pass_provider, location_provider } = req.body;
    //get method
    const { name_provider, location_provider, pass_provider } = req.query;
    const {error, data} = await providerController.create({name_provider, location_provider, pass_provider});
    res.json({error, data});
}

async function update(req, res) {
     //post method
    // const {id_provider, name_provider, pass_provider, location_provider } = req.body;
    //get method
    const id = req.params.id;
    const {id_provider, name_provider, location_provider } = req.query;
    const {error, data} = await providerController.update(id, {id_provider, name_provider, location_provider, pass_provider});
    res.json({error, data});
}

async function removeById(req, res) {
    const id = req.params.id;
    const {error, data} = await providerController.removeById(id);
    res.json({error, data});
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