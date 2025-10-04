// back-end/controllers/user/user_controller.js
import { console } from "inspector";
import user_model from "../../models/user_model.js";
import bcrypt from "bcrypt";
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } from "../../services/emailService.js";
import { Op } from "sequelize";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUserData = (userData) => {
    console.log("-> user_controller.js - validateUserData() - userData = ", userData);
    
    const errors = [];
    const requiredFields = ['name_user', 'type_user', 'location_user'];
    
    if (userData.is_manager !== undefined && typeof userData.is_manager !== 'boolean') {
        errors.push('is_manager debe ser un valor booleano');
    }

    requiredFields.forEach(field => {
        if (!userData[field]) {
            errors.push(`Falta el campo: ${field}`);
        }
    });
    
    if (userData.email_user !== undefined) {
        if (!userData.email_user) {
            errors.push('El email es requerido');
        } else if (!emailRegex.test(userData.email_user)) {
            errors.push('El formato del email no es válido');
        }
    }
    
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
        const validTypes = ['user', 'seller', 'rider', 'admin'];
        if (!validTypes.includes(userData.type_user)) {
            errors.push('Tipo de usuari@ no valido');
        }
    }
    if (!userData.location_user) {
        errors.push(`Falta el campo: location_user`);
    }
    if (userData.calification_user !== undefined && userData.calification_user < 0) {
        errors.push('La calificación no puede ser negativa');
    }
    if (userData.contributor_user !== undefined && typeof userData.contributor_user !== 'boolean') {
        errors.push('La categoría de usuario debe ser un valor booleano');
    }
    if (userData.age_user !== undefined) {
        if (!Number.isInteger(userData.age_user) || userData.age_user < 0) {
            errors.push('La edad debe ser un número entero positivo');
        }
        if (userData.age_user < 18) {
            errors.push('La edad mínima es 18 años');
        }
        if (userData.age_user > 120) {
            errors.push('La edad no puede ser mayor a 120 años');
        }
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
        
        if (!user) {
            console.warn("-> user_controller.js - getById() - User not found");
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
        
        //update: Check if email+type combination already exists
        if (userData.email_user && userData.type_user) {
            const existingEmailType = await user_model.findOne({ 
                where: { 
                    email_user: userData.email_user,
                    type_user: userData.type_user
                } 
            });
            
            if (existingEmailType) {
                return { 
                    error: `Ya existe una cuenta de tipo ${userData.type_user} con este email`
                };
            }
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

        //update: Enhanced debugging for is_manager field
        console.log('-> login() - Full user object from DB:', user);
        console.log('-> login() - User dataValues:', user.dataValues);
        console.log('-> login() - is_manager raw value:', user.dataValues.is_manager);
        console.log('-> login() - is_manager type:', typeof user.dataValues.is_manager);

        //update: Check if email is verified - BLOCK LOGIN if not verified
        if (user.email_verified === false || user.email_verified === 0) {
            console.log('-> login() - User email not verified, blocking login');
            return {
                error: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
                needsVerification: true,
                email: user.email_user
            };
        }

        const isPasswordValid = await bcrypt.compare(userData.pass_user, user.pass_user);

        if (!isPasswordValid) {
            console.error('-> user_controller.js - login() - Contraseña incorrecta');
            return { 
                error: "Contraseña incorrecta"
            };
        }

        //update: Build complete user response including ALL fields from database
        const userResponse = {
            id_user: user.dataValues.id_user,
            name_user: user.dataValues.name_user,
            email_user: user.dataValues.email_user,
            type_user: user.dataValues.type_user,
            location_user: user.dataValues.location_user,
            image_user: user.dataValues.image_user,
            contributor_user: user.dataValues.contributor_user,
            age_user: user.dataValues.age_user,
            calification_user: user.dataValues.calification_user,
            email_verified: user.dataValues.email_verified,
            is_manager: user.dataValues.is_manager // Use raw value from database
        };

        //update: Final debug check before sending response
        console.log('-> login() - FINAL userResponse being sent:', JSON.stringify(userResponse));
        console.log('-> login() - FINAL is_manager value:', userResponse.is_manager);
        console.log('-> login() - FINAL is_manager type:', typeof userResponse.is_manager);

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

        if (userData.is_manager === undefined) {
            userData.is_manager = false; 
        }

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
        
        //update: Check if email+type combination already exists
        const existingEmailType = await user_model.findOne({ 
            where: { 
                email_user: userData.email_user,
                type_user: userData.type_user
            } 
        });
        
        if (existingEmailType) {
            console.log('-> register() - Ya existe una cuenta con este email y tipo de usuario');
            return { 
                error: `Ya existe una cuenta de tipo ${userData.type_user} con este email. Puedes crear una cuenta con un tipo de usuario diferente.`,
            };
        }

        //update: Check if email exists with other user types and suggest available types
        const existingEmailAccounts = await user_model.findAll({ 
            where: { 
                email_user: userData.email_user
            },
            attributes: ['type_user'] 
        });
        
        if (existingEmailAccounts.length > 0) {
            const existingTypes = existingEmailAccounts.map(acc => acc.type_user);
            const availableTypes = ['user', 'seller', 'rider', 'provider'].filter(type => !existingTypes.includes(type));
            
            console.log('-> register() - Email exists with types:', existingTypes);
            console.log('-> register() - Available types for this email:', availableTypes);
        }

        // Add default values if not provided
        if (userData.calification_user === undefined) {
            userData.calification_user = 5;
        }
        if (userData.contributor_user === undefined) {
            userData.contributor_user = false;
        }
        if (userData.age_user === undefined) {
            userData.age_user = 18;
        }

        //update: Generate verification token and expiry
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        userData.verification_token = verificationToken;
        userData.verification_token_expires = verificationTokenExpires;
        userData.email_verified = false;

        const user = await user_model.create(userData);

        //update: Send verification email
        console.log('About to send verification email to:', userData.email_user);
        const emailResult = await sendVerificationEmail(
            userData.email_user,
            userData.name_user,
            verificationToken
        );
        console.log('Email send result:', emailResult);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
        }

        // Return user data without sensitive information
        const userResponse = {
            id_user: user.id_user,
            name_user: user.name_user,
            email_user: user.email_user,
            type_user: user.type_user,
            location_user: user.location_user,
            calification_user: user.calification_user,
            contributor_user: user.contributor_user,
            age_user: user.age_user,
            email_verified: user.email_verified,
            is_manager: user.is_manager
        };

        return { 
            message: "Registro exitoso. Por favor verifica tu correo electrónico.", 
            data: userResponse,
            verificationEmailSent: emailResult.success
        };
    } catch (err) {
        console.error("Error en el registro = ", err);
        return { 
            error: "Error de registro",
            details: err.message 
        };
    }
}

// Rest of functions remain the same...
async function verifyEmail(email, token) {
    try {
        const users = await user_model.findAll({
            where: {
                email_user: email,
                verification_token: token,
                verification_token_expires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!users || users.length === 0) {
            return {
                error: "Token inválido o expirado"
            };
        }

        for (const user of users) {
            await user.update({
                email_verified: true,
                verification_token: null,
                verification_token_expires: null
            });
            
            await sendWelcomeEmail(user.email_user, user.name_user);
        }

        return {
            message: "Email verificado exitosamente",
            data: {
                email_verified: true,
                accounts_verified: users.length,
                user_types: users.map(u => u.type_user)
            }
        };
    } catch (err) {
        console.error("Error verifying email:", err);
        return {
            error: "Error al verificar el email",
            details: err.message
        };
    }
}

async function resendVerificationEmail(email) {
    try {
        const user = await user_model.findOne({
            where: { email_user: email }
        });

        if (!user) {
            return {
                error: "Usuario no encontrado"
            };
        }

        if (user.email_verified) {
            return {
                error: "El email ya está verificado"
            };
        }

        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

        await user.update({
            verification_token: verificationToken,
            verification_token_expires: verificationTokenExpires
        });

        const emailResult = await sendVerificationEmail(
            user.email_user,
            user.name_user,
            verificationToken
        );

        if (!emailResult.success) {
            return {
                error: "Error al enviar el email de verificación"
            };
        }

        return {
            message: "Email de verificación reenviado exitosamente"
        };
    } catch (err) {
        console.error("Error resending verification email:", err);
        return {
            error: "Error al reenviar el email de verificación",
            details: err.message
        };
    }
}

async function update(id, userData) {
    try {
        if (!id) {
            return { error: "El ID de usuario es requerido" };
        }

        if (Object.keys(userData).length === 0) {
            return { 
                error: "No hay campos para actualizar",
                details: "At least one field must be provided for update" 
            };
        }

        const user = await user_model.findByPk(id);
        if (!user) {
            return { 
                error: "El usuario no existe",
            };
        }
        
        //update: Check if email+type combination would be duplicated
        if (userData.email_user && userData.email_user !== user.email_user) {
            const existingEmailType = await user_model.findOne({ 
                where: { 
                    email_user: userData.email_user,
                    type_user: user.type_user,
                    id_user: { [Op.ne]: id }
                } 
            });
            
            if (existingEmailType) {
                return { 
                    error: `Ya existe otra cuenta de tipo ${user.type_user} con este email`,
                };
            }

            //update: If email is changed, require re-verification
            userData.email_verified = false;
            const verificationToken = generateVerificationToken();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            
            userData.verification_token = verificationToken;
            userData.verification_token_expires = verificationTokenExpires;

            await sendVerificationEmail(
                userData.email_user,
                user.name_user,
                verificationToken
            );
        }

        const fieldsToUpdate = {};
        if (userData.is_manager !== undefined) fieldsToUpdate.is_manager = userData.is_manager;
        if (userData.name_user) fieldsToUpdate.name_user = userData.name_user;
        if (userData.email_user) fieldsToUpdate.email_user = userData.email_user;
        if (userData.pass_user) fieldsToUpdate.pass_user = userData.pass_user;
        if (userData.location_user) fieldsToUpdate.location_user = userData.location_user;
        if (userData.type_user) fieldsToUpdate.type_user = userData.type_user;
        if (userData.calification_user !== undefined) fieldsToUpdate.calification_user = userData.calification_user;
        if (userData.contributor_user !== undefined) fieldsToUpdate.contributor_user = userData.contributor_user;
        if (userData.age_user !== undefined) fieldsToUpdate.age_user = userData.age_user;
        if (userData.email_verified !== undefined) fieldsToUpdate.email_verified = userData.email_verified;
        if (userData.verification_token !== undefined) fieldsToUpdate.verification_token = userData.verification_token;
        if (userData.verification_token_expires !== undefined) fieldsToUpdate.verification_token_expires = userData.verification_token_expires;

        const validation = validateUserData(fieldsToUpdate);
        if (!validation.isValid) {
            return { 
                error: "La validación fallo",
                details: validation.errors 
            };
        }

        Object.assign(user, fieldsToUpdate);
        await user.save();

        console.log("Updated user:", user);
        return { 
            message: userData.email_user ? "Usuario actualizado. Por favor verifica tu nuevo email." : "Usuario actualizado.",
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
            message: "El usuario se ha borrado." 
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
        
        await user.update({ image_user: imagePath });

        return {
            data: { image_user: imagePath },
            message: "Imagen de perfil actualizada."
        };
    } catch (err) {
        console.error("Error updating profile image:", err);
        return {
            error: "Error al actualizar la imagen de perfil",
            details: err.message
        };
    }
}

//update: Get user by email
async function getByEmail(email_user) {
    try {
        if (!email_user) {
            return { error: "El email es obligatorio" };
        }

        const user = await user_model.findOne({
            where: { email_user: email_user },
            attributes: { exclude: ['pass_user'] }
        });

        if (!user) {
            return { error: "Usuario no encontrado con ese email" };
        }

        return { data: user };
    } catch (err) {
        console.error("-> user_controller.js - getByEmail() - Error = ", err);
        return { error: "Error al buscar usuario por email" };
    }
}

//update: Search users by name (partial match using LIKE)
async function searchByName(name_user) {
    try {
        if (!name_user || name_user.length < 2) {
            return { error: "Ingresa al menos 2 caracteres para buscar" };
        }

        const users = await user_model.findAll({
            where: {
                name_user: {
                    [Op.like]: `%${name_user}%`
                }
            },
            attributes: { exclude: ['pass_user'] },
            limit: 10
        });

        if (!users || users.length === 0) {
            return { error: "No se encontraron usuarios con ese nombre", data: [] };
        }

        return { data: users };
    } catch (err) {
        console.error("-> user_controller.js - searchByName() - Error = ", err);
        return { error: "Error al buscar usuarios por nombre" };
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
    updateProfileImage,
    verifyEmail,
    resendVerificationEmail,
     getByEmail,  
    searchByName  
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
    updateProfileImage,
    verifyEmail,
    resendVerificationEmail,
     getByEmail,  
    searchByName  
};