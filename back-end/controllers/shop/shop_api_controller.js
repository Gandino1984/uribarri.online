import shopController from "./shop_controller.js";

async function getAll(req, res) {
    const {error, data} = await shopController.getAll();
    res.json({error, data});
}

async function getById(req, res) {
    const id = req.params.id;
    const {error, data} = await shopController.getById(id);
    res.json({error, data});
}

async function getByType(req, res) {
    console.log('Full Request Object:', req);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    console.log('Request Query:', req.query);
    // Add explicit destructuring and logging
    const { type_shop } = req.body;
    console.log('Destructured type_shop:', type_shop);
    if (!type_shop) {
        return res.status(400).json({ 
            error: 'type_shop parameter is missing', 
            requestBody: req.body 
        });
    }
    const {error, data} = await shopController.getByType(type_shop);
    console.log('Shop Type Response - Error:', error);
    console.log('Shop Type Response - Data:', data);
    
    res.json({error, data});
}

async function create(req, res) {
    const { name_shop, location_shop, type_shop, id_user, calification_shop } = req.body;
    const {error, data} = await shopController.create({name_shop, location_shop, type_shop, id_user, calification_shop});
    res.json({error, data});
}

async function update(req, res) {
    const id = req.params.id;
    const {id_shop, name_shop, pass_shop, location_shop } = req.query;
    const {error, data} = await shopController.update(id, {id_shop, name_shop, pass_shop, location_shop});
    res.json({error, data});
}

async function removeById(req, res) {
    const id = req.params.id;
    const {error, data} = await shopController.removeById(id);
    res.json({error, data});
}

const getByUserId = async (req, res) => {
    console.log('!!! getByUserId function called');
    try {
        const { id_user } = req.body;
        console.log('Received user ID:', id_user);  // Added logging
        if (!id_user) {
            return res.status(400).json({
                error: 'User ID is required',
                success: false
            });
        }
        const {error, data} = await shopController.getByUserId(id_user);
        // Add handling for when an error is returned from the controller
        if (error) {
            return res.status(404).json({
                error: error,
                success: false
            });
        }
        res.json({error, data, success: true});
    } catch (error) {
        console.error('Error fetching user shops:', error);
        return res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByType,
    getByUserId
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    getByType,
    getByUserId
    
}