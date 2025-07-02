import userController from "./user_controller.js";
import bcrypt from 'bcrypt';
import user_model from "../../models/user_model.js";


async function getAll(req, res) {
    const {error, data} = await userController.getAll();
    res.json({error, data});
}

async function create(req, res) {
    //update: Added age_user to destructured fields
    const {name_user, pass_user, location_user, type_user, image_user, age_user } = req.body;
    const {error, data} = await userController.create({name_user, pass_user, location_user, type_user, image_user, age_user});
    res.json({error, data});
}

async function getById(req, res) {
    const id = req.body.id_user;
    const {error, data} = await userController.getById(id);
    res.json({error, data});
}

async function getByUserName(req, res) {
    const name = req.body.name_user;
    const {error, data} = await userController.getByUserName(name);
    res.json({error, data});
}

async function login(req, res) {
    const { name_user, pass_user} = req.body;
    try {
        if(!name_user || !pass_user){
            res.status(400).json({ 
                error: 'Los parámetros name_user, pass_user son obligatorios', 
                requestBody: req.body 
            });
        }
        
        const {error, data} = await userController.login({ name_user, pass_user});

        res.json({error, data});
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
 
}

async function register(req, res) {
    //update: Added age_user to destructured fields
    let {name_user, pass_user, location_user, type_user, image_user, calification_user, age_user } = req.body;
    try{
        if(!name_user || !pass_user || !location_user || !type_user){
            res.status(400).json({ 
                error: 'Los parámetros name_user, pass_user, location_user y type_user son obligatorios', 
                requestBody: req.body 
            });
        }

        if (calification_user !== undefined && calification_user < 0) {
            return res.status(400).json({
                error: 'La calificación no puede ser negativa'
            });
        }

        const hashedPassword = await bcrypt.hash(pass_user, 5);

        pass_user = hashedPassword;

        const {error, data} = await userController.register({
            name_user, 
            pass_user, 
            location_user, 
            type_user, 
            image_user, 
            calification_user,
            //update: Added age_user to register call
            age_user
        });

        res.json({error, data});
    }catch(err){
        console.error('-> user_api_controller.js - register() - Error = ', err);
        res.status(500).json({ error: 'Error en el registro de usuario' });
    }
}

async function update(req, res) {
    const {
        id_user, 
        name_user, 
        pass_user, 
        location_user, 
        type_user, 
        image_user, 
        calification_user,
        category_user,
        //update: Added age_user to destructured fields
        age_user 
    } = req.body;
    
    if (calification_user !== undefined && calification_user < 0) {
        return res.status(400).json({
            error: 'La calificación no puede ser negativa'
        });
    }
    
    const {error, data} = await userController.update(id_user, { 
        name_user, 
        pass_user, 
        location_user, 
        type_user, 
        image_user,
        calification_user,
        category_user,
        //update: Added age_user to update call
        age_user 
    });
    
    res.json({error, data});
}

async function removeById(req, res) {
    try {
        const id_user = req.params.id_user;

        if (!id_user) {
            res.status(400).json({ error: 'El ID del usuario es obligatorio' });
        }

        const { error, data } = await userController.removeById(id_user);

        res.json({ error, data });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el usuario', details: err.message });
    }
}

async function updateProfileImage(userName, imagePath) {
    try {
        console.log('Updating profile image with:', { userName, imagePath });
        
        const user = await user_model.findOne({
            where: { name_user: userName }
        });
        
        if (!user) {
            return {
                error: "Usuario no encontrado"
            };
        }

        // Update the user's image path in the database
        await user.update({ image_user: imagePath });

        return {
            data: {
                image_user: imagePath
            },
            message: "Imagen de perfil actualizada ."
        };
    } catch (err) {
        console.error("Error updating profile image:", err);
        return {
            error: "Error al actualizar la imagen de perfil",
            details: err.message
        };
    }
}

export {
    getAll,
    getById,
    create,
    update,
    removeById,
    login,
    register,
    getByUserName,
    updateProfileImage
}

export default {
    getAll,
    getById,
    create,
    update,
    removeById,
    login,
    register,
    getByUserName,
    updateProfileImage
}