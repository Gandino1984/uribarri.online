// back-end/controllers/user/user_api_controller.js
import userController from "./user_controller.js";
import bcrypt from 'bcrypt';
import user_model from "../../models/user_model.js";


async function getAll(req, res) {
    const {error, data} = await userController.getAll();
    res.json({error, data});
}

async function create(req, res) {
    //update: Added email_user and is_manager to destructured fields
    const {name_user, pass_user, email_user, location_user, type_user, image_user, age_user, is_manager } = req.body;
    const {error, data} = await userController.create({name_user, pass_user, email_user, location_user, type_user, image_user, age_user, is_manager });
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
            return;
        }
        
        const {error, data, message} = await userController.login({ name_user, pass_user});

        //update: Log what we're about to send to frontend
        console.log('=== user_api_controller LOGIN RESPONSE ===');
        console.log('Response error:', error);
        console.log('Response data:', data);
        console.log('data.is_manager:', data?.is_manager);
        console.log('typeof data.is_manager:', typeof data?.is_manager);
        console.log('Full response being sent:', JSON.stringify({error, data}));
        console.log('==========================================');

        res.json({error, data, message});
    } catch (error) {
        console.error('Login API error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}

async function register(req, res) {
    //update: Added email_user and is_manager to destructured fields
    let {name_user, pass_user, email_user, location_user, type_user, image_user, calification_user, age_user, is_manager  } = req.body;
    try{
        //update: Added email_user to required fields check
        if(!name_user || !pass_user || !email_user || !location_user || !type_user){
            res.status(400).json({ 
                error: 'Los parámetros name_user, pass_user, email_user, location_user y type_user son obligatorios', 
                requestBody: req.body 
            });
            return;
        }

        if (calification_user !== undefined && calification_user < 0) {
            return res.status(400).json({
                error: 'La calificación no puede ser negativa'
            });
        }

        const hashedPassword = await bcrypt.hash(pass_user, 5);

        pass_user = hashedPassword;

        const {error, data, message, verificationEmailSent} = await userController.register({
            name_user, 
            pass_user,
            //update: Added email_user and is_manager to register call
            email_user,
            location_user, 
            type_user, 
            image_user, 
            calification_user,
            age_user,
            is_manager 
        });

        res.json({error, data, message, verificationEmailSent});
    }catch(err){
        console.error('-> user_api_controller.js - register() - Error = ', err);
        res.status(500).json({ error: 'Error en el registro de usuario' });
    }
}

async function update(req, res) {
    const {
        id_user, 
        name_user,
        //update: Added email_user and is_manager
        email_user,
        pass_user, 
        location_user, 
        type_user, 
        image_user, 
        calification_user,
        contributor_user,
        age_user,
        is_manager  
    } = req.body;
    
    if (calification_user !== undefined && calification_user < 0) {
        return res.status(400).json({
            error: 'La calificación no puede ser negativa'
        });
    }
    
    const {error, data, message} = await userController.update(id_user, { 
        name_user,
        //update: Added email_user and is_manager to update call
        email_user,
        pass_user, 
        location_user, 
        type_user, 
        image_user,
        calification_user,
        contributor_user,
        age_user,
        is_manager  
    });
    
    res.json({error, data, message});
}

async function removeById(req, res) {
    try {
        const id_user = req.params.id_user;

        if (!id_user) {
            return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
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