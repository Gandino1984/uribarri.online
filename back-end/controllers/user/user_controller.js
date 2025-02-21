import { console } from "inspector";
import user_model from "../../models/user_model.js";
import bcrypt from "bcrypt";


const validateUserData = (userData) => {
    console.log("-> user_controller.js - validateUserData() - userData = ", userData);
    
    const errors = [];
    const requiredFields = ['name_user', 'type_user', 'location_user'];
    
    requiredFields.forEach(field => {
        if (!userData[field]) {
            errors.push(`Falta el campo: ${field}`);
        }
    });
    
    if (userData.name_user) {
        if (userData.name_user.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        if (userData.name_user.length > 100) {
            errors.push('El nombre no puede exceder 50 characters');
        }
        if (!/^[a-zA-Z0-9_ ]+$/.test(userData.name_user)) {
            errors.push('El nombre solo puede contener letras, números, guiones bajos y espacios');
        }
    }
    if (userData.type_user) {
        const validTypes = ['user', 'seller', 'provider', 'admin'];
        if (!validTypes.includes(userData.type_user)) {
            errors.push('Tipo de usuario no valido');
        }
    }
    if (!userData.location_user) {
        errors.push(`Falta el campo: location_user`);
    }
    if (userData.calification_user !== undefined && userData.calification_user < 0) {
        errors.push('La calificación no puede ser negativa');
    }
    if (userData.category_user !== undefined && typeof userData.category_user !== 'boolean') {
        errors.push('La categoría de usuario debe ser un valor booleano');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

async function getAll() {
    try {
        const users = await user_model.findAll();

        console.log("-> user_controller.js - getAll() - Retrieved users = ", users);
        
        if (!users || users.length === 0) {
            return { error: "No hay usuarios registrados"};
        }
        
        return { data: users };
    } catch (err) {
        console.error("-> user_controller.js - getAll() = ", err);
        return { 
            error: "Error obteniendo los usuarios", 
        };
    }
}

async function getById(id) {
    try {
        if (!id) {
            return { error: "ID de usuario requerido" };
        }

        const user = await user_model.findByPk(id);
        
        console.log("-> user_controller.js - getById() - Retrieved user = ", user);

        if (!user) {
            return { error: "Usuario no encontrado" };
        }   
        return { data: user };
    } catch (err) {
        console.error("-> user_controller.js - Error in getById() = ", err);
        return { 
            error: "Error al obtener el usuario",
        };
    }
}

async function getByUserName(userName) {
    console.log("-> user_controller.js - getByUserName() - userName = ", userName);

    try{
        const user = await user_model.findOne({ 
             where: { name_user: userName } 
        });
    
        if (user) {
            //erase this log later
            console.log('->  getByUserName() - Datos completos obtenidos = ', user);
            return { 
                data: user
            };
        }else{
            console.log('->  El usuario no existe');
            return {  
                error: "El usuario no existe"
            };
        }
    }catch(err){
        console.error("-> user_controller.js - Error in getByUserName() = ", err);
        return {
            error: "Error al obtener el usuario"
        };
    }

}

async function create(userData) {
    try {
        const validation = validateUserData(userData);

        if (!validation.isValid) {
            return { 
                error: "Validación fallida"
            };
        }

        // Check if user already exists
        const existingUser = await user_model.findOne({ 
            where: { name_user: userData.name_user } 
        });

        if (existingUser) {
            return { 
                error: "El usuario ya existe"
            };
        }
        // Create new user
        const user = await user_model.create(userData);
        console.log("Created user:", user);

        return { 
            data: user,
            message: "Usuario creado" 
        };
    } catch (err) {
        console.error("Error in create:", err);
        return { 
            error: "Error al crear el usuario",
        };
    }
}

async function login(userData) {
    console.log("-> user_controller.js - login() - userData = ", userData);
    
    try {
        if (!userData.name_user || !userData.pass_user) {
            console.log('-> login() - Información de usuario incompleta');
            return {
                error: "Información de usuario incompleta",
            }; 
        }
        if (userData.pass_user.length !== 4 || !/^\d+$/.test(userData.pass_user)) {
            return {
                error: "Contraseña inválida"
            }; 
        }

        const user = await user_model.findOne({ 
            where: { name_user: userData.name_user } 
        });

        if (!user) {
            return {
                error: "El usuario no existe"
            };
        }

        const isPasswordValid = await bcrypt.compare(userData.pass_user, user.pass_user);

        if (!isPasswordValid) {
            console.error('-> user_controller.js - login() - Contraseña incorrecta');
            return { 
                error: "Contraseña incorrecta"
            };
        }

        // Return user data including category_user
        const userResponse = {
            id_user: user.id_user,
            name_user: user.name_user,
            type_user: user.type_user,
            location_user: user.location_user,
            image_user: user.image_user,
            category_user: user.category_user
        };

        console.log('-> login() - User response:', userResponse); 

        return {
            data: userResponse,
            message: "Login exitoso" 
        };

    } catch (err) {
        console.error("-> user_controller.js - login() - Error al iniciar sesión =", err);
        return {
            error: "Error al iniciar sesión"
        }; 
    }
}

async function register(userData) {
    try {
        const validation = validateUserData(userData);

        if (!validation.isValid) {
            console.error('-> user_controller.js - register() - Error de validación = ', validation.errors);
            return { 
                error: "Validación fallida",
                details: validation.errors 
            };
        }

        // Check if user already exists
        const existingUser = await user_model.findOne({ 
            where: { name_user: userData.name_user } 
        });

        if (existingUser) {
            console.log('-> register() - El usuario ', existingUser, ' ya existe');
            return { 
                error: "El usuario ya existe",
            };
        }

        // Add default values if not provided
        if (userData.calification_user === undefined) {
            userData.calification_user = 5;
        }
        if (userData.category_user === undefined) {
            //if category is false it means the user is not a sponsor of the app
            //by default all users are not sponsors
            userData.category_user = false;
        }

        const user = await user_model.create(userData);

        // Return user data without sensitive information
        const userResponse = {
            id_user: user.id_user,
            name_user: user.name_user,
            type_user: user.type_user,
            location_user: user.location_user,
            calification_user: user.calification_user,
            category_user: user.category_user
        };

        return { 
            message: "Registro exitoso", 
            data: userResponse
        };
    } catch (err) {
        console.error("Error en el registro = ", err);
        return { 
            error: "Error de registro",
            details: err.message 
        };
    }
}

async function update(id, userData) {
    try {
        if (!id) {
            return { error: "El ID de usuario es requerido" };
        }

        // Check if userData is empty
        if (Object.keys(userData).length === 0) {
            return { 
                error: "No hay campos para actualizar",
                details: "At least one field must be provided for update" 
            };
        }

        // Find user
        const user = await user_model.findByPk(id);
        if (!user) {
            return { 
                error: "El usuario no existe",
            };
        }

        // Validate the fields that are being updated
        const fieldsToUpdate = {};
        if (userData.name_user) fieldsToUpdate.name_user = userData.name_user;
        if (userData.pass_user) fieldsToUpdate.pass_user = userData.pass_user;
        if (userData.location_user) fieldsToUpdate.location_user = userData.location_user;
        if (userData.type_user) fieldsToUpdate.type_user = userData.type_user;
        if (userData.calification_user !== undefined) fieldsToUpdate.calification_user = userData.calification_user;
        if (userData.category_user !== undefined) fieldsToUpdate.category_user = userData.category_user;

        const validation = validateUserData(fieldsToUpdate);
        if (!validation.isValid) {
            return { 
                error: "La validación fallo",
                details: validation.errors 
            };
        }

        // Update user
        Object.assign(user, fieldsToUpdate);
        await user.save();

        console.log("Updated user:", user);
        return { 
            message: "Usuario actualizado correctamente" ,
            data: user
            
        };
    } catch (error) {
        console.error("Error in update:", error);
        return { 
            error: "Error de actualización"
        };
    }
}

async function removeById(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID de usuario es requerido" };
        }

        const user = await user_model.findByPk(id_user);
        
        if (!user) {
            return { 
                error: "Usuario no encontrado",
                details: "Usuario no encontrado" 
            };
        }

        await user.destroy();       
        
        return { 
            data: id_user,
            message: "El usuario se ha borrado correctamente" 
        };

    } catch (err) {
        console.error("-> user_controller.js - removeById() - Error = ", err);
        return { 
            error: "Error al borrar el usuario",
            details: err.message 
        };
    }
}

async function updateProfileImage(userName, imagePath) {
    try {
        const user = await user_model.findOne({
            where: { name_user: userName }
        });
        
        if (!user) {
            return {
                error: "Usuario no encontrado"
            };
        }
        
        // Store the path relative to the public directory
        await user.update({ image_user: imagePath });

        return {
            data: { image_user: imagePath },
            message: "Imagen de perfil actualizada correctamente"
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
};

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
};