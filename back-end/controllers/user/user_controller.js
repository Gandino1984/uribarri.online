import { console } from "inspector";
import user_model from "../../models/user_model.js";
import shop_model from "../../models/shop_model.js";
import organization_model from "../../models/organization_model.js";
import publication_model from "../../models/publication_model.js";
import order_model from "../../models/order_model.js";
import bcrypt from "bcrypt";
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../../services/emailService.js";
import { Op } from "sequelize";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//update: Helper function to create properly formatted expiration dates using UTC
const createExpirationDate = (hoursFromNow) => {
    const now = new Date();
    const expiration = new Date(now.getTime() + (hoursFromNow * 60 * 60 * 1000));
    
    console.log('=== EXPIRATION DATE DEBUG ===');
    console.log('Current time (local):', now.toString());
    console.log('Current time (UTC):', now.toISOString());
    console.log('Current timestamp:', now.getTime());
    console.log('Expiration time (local):', expiration.toString());
    console.log('Expiration time (UTC):', expiration.toISOString());
    console.log('Expiration timestamp:', expiration.getTime());
    console.log('Hours added:', hoursFromNow);
    console.log('Milliseconds added:', hoursFromNow * 60 * 60 * 1000);
    console.log('============================');
    
    return expiration;
};

//update: Improved expiration check with detailed debugging and proper comparison
const isExpired = (expirationDate) => {
    if (!expirationDate) {
        console.log('=== EXPIRATION CHECK: No expiration date provided ===');
        return true;
    }
    
    const now = new Date();
    const expiration = new Date(expirationDate);
    
    // Get timestamps for accurate comparison
    const nowTimestamp = now.getTime();
    const expirationTimestamp = expiration.getTime();
    const diffMs = expirationTimestamp - nowTimestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    console.log('=== EXPIRATION CHECK DEBUG ===');
    console.log('Current time:', now.toISOString());
    console.log('Current timestamp:', nowTimestamp);
    console.log('Expiration time from DB:', expirationDate);
    console.log('Expiration time parsed:', expiration.toISOString());
    console.log('Expiration timestamp:', expirationTimestamp);
    console.log('Difference (ms):', diffMs);
    console.log('Difference (minutes):', diffMinutes);
    console.log('Is expired:', nowTimestamp >= expirationTimestamp);
    console.log('==============================');
    
    return nowTimestamp >= expirationTimestamp;
};

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

        const existingUser = await user_model.findOne({ 
            where: { name_user: userData.name_user } 
        });

        if (existingUser) {
            return { 
                error: "El usuario ya existe"
            };
        }
        
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

        console.log('-> login() - Full user object from DB:', user);
        console.log('-> login() - User dataValues:', user.dataValues);
        console.log('-> login() - is_manager raw value:', user.dataValues.is_manager);
        console.log('-> login() - is_manager type:', typeof user.dataValues.is_manager);

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
            is_manager: user.dataValues.is_manager
        };

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

        const existingUser = await user_model.findOne({ 
            where: { name_user: userData.name_user } 
        });

        if (existingUser) {
            console.log('-> register() - El usuario ', existingUser, ' ya existe');
            return { 
                error: "El usuario ya existe",
            };
        }
        
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

        if (userData.calification_user === undefined) {
            userData.calification_user = 5;
        }
        if (userData.contributor_user === undefined) {
            userData.contributor_user = false;
        }
        if (userData.age_user === undefined) {
            userData.age_user = 18;
        }

        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = createExpirationDate(24);

        userData.verification_token = verificationToken;
        userData.verification_token_expires = verificationTokenExpires;
        userData.email_verified = false;

        const user = await user_model.create(userData);

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

async function verifyEmail(email, token) {
    try {
        console.log('=== VERIFY EMAIL START ===');
        console.log('Email:', email);
        console.log('Token:', token);
        
        const users = await user_model.findAll({
            where: {
                email_user: email,
                verification_token: token
            }
        });

        console.log('Found users with matching email and token:', users.length);

        if (!users || users.length === 0) {
            console.log('No users found with this email and token');
            return {
                error: "Token inválido o no encontrado"
            };
        }

        const validUsers = [];
        for (const user of users) {
            console.log(`Checking user ${user.name_user}:`);
            console.log('  - verification_token_expires:', user.verification_token_expires);
            console.log('  - Type:', typeof user.verification_token_expires);
            
            if (isExpired(user.verification_token_expires)) {
                console.log(`  - Token EXPIRED for user ${user.name_user}`);
            } else {
                console.log(`  - Token VALID for user ${user.name_user}`);
                validUsers.push(user);
            }
        }

        if (validUsers.length === 0) {
            console.log('All tokens are expired');
            return {
                error: "El enlace de verificación ha expirado. Por favor solicita un nuevo enlace."
            };
        }

        for (const user of validUsers) {
            await user.update({
                email_verified: true,
                verification_token: null,
                verification_token_expires: null
            });
            
            console.log(`Email verified for user: ${user.name_user}`);
            
            await sendWelcomeEmail(user.email_user, user.name_user);
        }

        console.log('=== VERIFY EMAIL SUCCESS ===');

        return {
            message: "Email verificado exitosamente",
            data: {
                email_verified: true,
                accounts_verified: validUsers.length,
                user_types: validUsers.map(u => u.type_user)
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
        const verificationTokenExpires = createExpirationDate(24);

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

//update: Improved password reset request with better logging
async function requestPasswordReset(email) {
    try {
        console.log('=== REQUEST PASSWORD RESET START ===');
        console.log('Email:', email);
        
        if (!email || !emailRegex.test(email)) {
            return {
                error: "Email inválido"
            };
        }

        const users = await user_model.findAll({
            where: { email_user: email }
        });

        if (!users || users.length === 0) {
            return {
                error: "No existe ninguna cuenta con ese email"
            };
        }

        console.log('Found', users.length, 'user(s) with this email');

        const resetToken = generateVerificationToken();
        const resetTokenExpires = createExpirationDate(1); // 1 hour expiration

        console.log('Generated reset token:', resetToken);
        console.log('Token will expire at:', resetTokenExpires.toISOString());

        for (const user of users) {
            console.log(`Updating user ${user.name_user} with reset token`);
            await user.update({
                password_reset_token: resetToken,
                password_reset_token_expires: resetTokenExpires
            });
            
            // Verify the update
            const updatedUser = await user_model.findByPk(user.id_user);
            console.log('Verified saved expiration for', user.name_user, ':', updatedUser.password_reset_token_expires);
        }

        const emailResult = await sendPasswordResetEmail(
            email,
            users[0].name_user,
            resetToken
        );

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            return {
                error: "Error al enviar el email de restablecimiento"
            };
        }

        console.log('=== REQUEST PASSWORD RESET SUCCESS ===');

        return {
            message: "Se ha enviado un email con instrucciones para restablecer tu contraseña",
            data: {
                email: email,
                accounts_count: users.length
            }
        };
    } catch (err) {
        console.error("Error in requestPasswordReset:", err);
        return {
            error: "Error al solicitar el restablecimiento de contraseña",
            details: err.message
        };
    }
}

//update: Improved password reset with detailed debugging
async function resetPasswordWithToken(email, token, newPassword) {
    try {
        console.log('=== RESET PASSWORD WITH TOKEN START ===');
        console.log('Email:', email);
        console.log('Token:', token);
        
        if (!email || !token || !newPassword) {
            return {
                error: "Email, token y nueva contraseña son requeridos"
            };
        }

        if (newPassword.length !== 4 || !/^\d+$/.test(newPassword)) {
            return {
                error: "La contraseña debe tener exactamente 4 dígitos"
            };
        }

        const users = await user_model.findAll({
            where: {
                email_user: email,
                password_reset_token: token
            }
        });

        console.log('Found users with matching email and token:', users.length);

        if (!users || users.length === 0) {
            console.log('No users found - invalid token');
            return {
                error: "Token inválido. Por favor solicita un nuevo enlace de restablecimiento."
            };
        }

        //update: Check each user's expiration with detailed logging
        const validUsers = [];
        for (const user of users) {
            console.log(`\nChecking user: ${user.name_user}`);
            console.log('User ID:', user.id_user);
            console.log('password_reset_token_expires from DB:', user.password_reset_token_expires);
            console.log('Type:', typeof user.password_reset_token_expires);
            
            const expired = isExpired(user.password_reset_token_expires);
            console.log('Is expired:', expired);
            
            if (!expired) {
                validUsers.push(user);
            }
        }

        if (validUsers.length === 0) {
            console.log('All tokens expired');
            return {
                error: "Token expirado. Por favor solicita un nuevo enlace de restablecimiento."
            };
        }

        console.log('Valid users found:', validUsers.length);

        const hashedPassword = await bcrypt.hash(newPassword, 5);

        for (const user of validUsers) {
            console.log(`Updating password for user: ${user.name_user}`);
            await user.update({
                pass_user: hashedPassword,
                password_reset_token: null,
                password_reset_token_expires: null
            });
        }

        console.log('=== RESET PASSWORD WITH TOKEN SUCCESS ===');

        return {
            message: "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
            data: {
                accounts_updated: validUsers.length,
                user_types: validUsers.map(u => u.type_user)
            }
        };
    } catch (err) {
        console.error("Error in resetPasswordWithToken:", err);
        return {
            error: "Error al restablecer la contraseña",
            details: err.message
        };
    }
}

async function changePassword(userId, oldPassword, newPassword) {
    try {
        console.log('-> changePassword() - User ID:', userId);
        
        if (!userId || !oldPassword || !newPassword) {
            return {
                error: "ID de usuario, contraseña actual y nueva contraseña son requeridos"
            };
        }

        if (oldPassword.length !== 4 || !/^\d+$/.test(oldPassword)) {
            return {
                error: "La contraseña actual debe tener exactamente 4 dígitos"
            };
        }

        if (newPassword.length !== 4 || !/^\d+$/.test(newPassword)) {
            return {
                error: "La nueva contraseña debe tener exactamente 4 dígitos"
            };
        }

        if (oldPassword === newPassword) {
            return {
                error: "La nueva contraseña debe ser diferente a la actual"
            };
        }

        const user = await user_model.findByPk(userId);

        if (!user) {
            return {
                error: "Usuario no encontrado"
            };
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.pass_user);

        if (!isPasswordValid) {
            return {
                error: "La contraseña actual es incorrecta"
            };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);

        await user.update({
            pass_user: hashedPassword
        });

        console.log('-> changePassword() - Password changed successfully for user:', user.name_user);

        return {
            message: "Contraseña cambiada exitosamente",
            data: {
                user_id: user.id_user,
                user_name: user.name_user
            }
        };
    } catch (err) {
        console.error("Error in changePassword:", err);
        return {
            error: "Error al cambiar la contraseña",
            details: err.message
        };
    }
}

//update: Enhanced user update with user type change validation
async function update(id, userData) {
    try {
        if (!id) {
            return {
                error: "El ID de usuario es requerido",
                details: "Falta el identificador del usuario"
            };
        }

        if (Object.keys(userData).length === 0) {
            return {
                error: "No hay campos para actualizar",
                details: "Debes proporcionar al menos un campo para actualizar"
            };
        }

        const user = await user_model.findByPk(id);
        if (!user) {
            return {
                error: "El usuario no existe",
                details: "No se encontró un usuario con ese identificador"
            };
        }

        //update: Validate user type change restrictions
        if (userData.type_user && userData.type_user !== user.type_user) {
            // If user is a seller, check if they have any shops
            if (user.type_user === 'seller') {
                const userShops = await shop_model.findAll({
                    where: { id_user: id }
                });

                if (userShops && userShops.length > 0) {
                    return {
                        error: "No puedes cambiar tu tipo de usuario mientras tengas tiendas creadas. Por favor, elimina tus tiendas primero.",
                        details: `Tienes ${userShops.length} tienda(s) activa(s)`
                    };
                }
            }

            // If user is a rider, check for pending deliveries
            if (user.type_user === 'rider') {
                const pendingOrders = await order_model.findAll({
                    where: {
                        id_rider: id,
                        order_status: {
                            [Op.in]: ['confirmed', 'preparing', 'ready', 'in_delivery']
                        }
                    }
                });

                if (pendingOrders && pendingOrders.length > 0) {
                    return {
                        error: "No puedes cambiar tu tipo de usuario mientras tengas entregas pendientes. Por favor, completa tus entregas primero.",
                        details: `Tienes ${pendingOrders.length} entrega(s) pendiente(s)`
                    };
                }

                //update: If changing from rider to another type, clear all rider-related data
                console.log(`User ${id} changing from rider to ${userData.type_user}, clearing rider data...`);
                await order_model.update(
                    { id_rider: null },
                    { where: { id_rider: id } }
                );
            }
        }

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
                    details: "Por favor usa un email diferente o inicia sesión con la cuenta existente"
                };
            }

            userData.email_verified = false;
            const verificationToken = generateVerificationToken();
            const verificationTokenExpires = createExpirationDate(24);

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
                error: "La validación falló",
                details: validation.errors.join(', ')
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
        //update: Return specific error details for better user feedback
        let errorMessage = "Error de actualización";
        let errorDetails = "";

        // Try to provide more specific error messages based on error type
        if (error.name === 'SequelizeValidationError') {
            errorMessage = "Error de validación de datos";
            errorDetails = error.errors.map(e => e.message).join(', ');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessage = "Datos duplicados";
            errorDetails = "El email o nombre de usuario ya está en uso";
        } else if (error.name === 'SequelizeDatabaseError') {
            errorMessage = "Error de base de datos";
            errorDetails = "Error al guardar los cambios en la base de datos";
        } else if (error.name === 'SequelizeConnectionError') {
            errorMessage = "Error de conexión";
            errorDetails = "No se pudo conectar con la base de datos";
        } else {
            errorDetails = error.message || "Error desconocido al actualizar el usuario";
        }

        return {
            error: errorMessage,
            details: errorDetails
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

        console.log(`🗑️ Iniciando eliminación del usuario ${user.name_user} (ID: ${id_user})`);

        //update: Check for active orders (prevent deletion if user has active orders)
        const activeOrders = await order_model.findAll({
            where: {
                id_user: id_user,
                order_status: {
                    [Op.in]: ['pending', 'confirmed', 'preparing', 'ready']
                }
            }
        });

        if (activeOrders && activeOrders.length > 0) {
            return {
                error: `No se puede eliminar el usuario porque tiene ${activeOrders.length} pedido(s) activo(s)`,
                details: "Completa o cancela los pedidos activos antes de eliminar el usuario"
            };
        }

        let deletedCounts = {
            shops: 0,
            products: 0,
            packages: 0,
            organizations: 0,
            publications: 0
        };

        //update: Import shop controller to use removeByIdWithProducts
        const shopController = await import('../shop/shop_controller.js');

        //update: Delete all shops owned by this user (cascades to products and packages)
        const shops = await shop_model.findAll({
            where: { id_user: id_user }
        });

        if (shops && shops.length > 0) {
            for (const shop of shops) {
                console.log(`Eliminando comercio: ${shop.name_shop}`);
                const result = await shopController.default.removeByIdWithProducts(shop.id_shop);
                if (result.deletedProducts) deletedCounts.products += result.deletedProducts;
                if (result.deletedPackages) deletedCounts.packages += result.deletedPackages;
                deletedCounts.shops++;
            }
        }

        //update: Import organization controller
        const organizationController = await import('../organization/organization_controller.js');

        //update: Delete all organizations managed by this user (cascades to publications)
        const organizations = await organization_model.findAll({
            where: { id_user: id_user }
        });

        if (organizations && organizations.length > 0) {
            for (const org of organizations) {
                console.log(`Eliminando asociación: ${org.name_org}`);
                const result = await organizationController.default.removeById(org.id_organization);
                if (result.deletedPublications) deletedCounts.publications += result.deletedPublications;
                deletedCounts.organizations++;
            }
        }

        //update: Import publication controller
        const publicationController = await import('../publication/publication_controller.js');

        //update: Delete all standalone publications by this user (not tied to organizations)
        const standalonePublications = await publication_model.findAll({
            where: {
                id_user_pub: id_user,
                id_org: null
            }
        });

        if (standalonePublications && standalonePublications.length > 0) {
            for (const publication of standalonePublications) {
                console.log(`Eliminando publicación: ${publication.title_pub}`);
                await publicationController.default.removeById(publication.id_publication);
                deletedCounts.publications++;
            }
        }

        //update: Delete user image if exists
        if (user.image_user) {
            const imagePath = path.join(__dirname, '..', '..', user.image_user);
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Imagen de usuario eliminada: ${user.image_user}`);
                }
            } catch (err) {
                console.error('Error al eliminar imagen de usuario:', err);
            }
        }

        //update: Delete user folder if exists
        const userFolderPath = path.join(__dirname, '..', '..', 'assets', 'images', 'users', user.name_user);
        if (fs.existsSync(userFolderPath)) {
            try {
                fs.rmSync(userFolderPath, { recursive: true, force: true });
                console.log(`Carpeta del usuario ${user.name_user} eliminada`);
            } catch (err) {
                console.error('Error al eliminar carpeta de usuario:', err);
            }
        }

        //update: Finally, delete the user
        await user.destroy();

        console.log(`✅ Usuario ${user.name_user} eliminado exitosamente`);

        return {
            data: id_user,
            message: `El usuario se ha eliminado junto con ${deletedCounts.shops} comercio(s), ${deletedCounts.products} producto(s), ${deletedCounts.packages} paquete(s), ${deletedCounts.organizations} asociación(es) y ${deletedCounts.publications} publicación(es).`,
            deletedCounts: deletedCounts
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

const contactShopOwner = async (senderName, senderEmail, recipientEmail, shopName, message, subject) => {
    console.log('-> user_controller - contactShopOwner');

    try {
        // Validate inputs
        if (!senderName || !senderEmail || !recipientEmail || !shopName || !message) {
            return {
                error: 'Todos los campos son requeridos'
            };
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(senderEmail)) {
            return {
                error: 'El email del remitente no es válido'
            };
        }
        if (!emailRegex.test(recipientEmail)) {
            return {
                error: 'El email del destinatario no es válido'
            };
        }

        // Validate message length
        if (message.length > 500) {
            return {
                error: 'El mensaje no puede exceder 500 caracteres'
            };
        }

        if (message.length < 10) {
            return {
                error: 'El mensaje debe tener al menos 10 caracteres'
            };
        }

        // Send email using the email service
        const { sendContactShopOwnerEmail } = await import('../../services/emailService.js');
        const result = await sendContactShopOwnerEmail(
            senderName,
            senderEmail,
            recipientEmail,
            shopName,
            message,
            subject
        );

        if (result.success) {
            console.log('Contact email sent successfully');
            return {
                message: 'Mensaje enviado correctamente',
                success: true
            };
        } else {
            console.error('Failed to send contact email:', result.error);
            return {
                error: 'Error al enviar el mensaje: ' + result.error
            };
        }
    } catch (error) {
        console.error('Error in contactShopOwner:', error);
        return {
            error: 'Error al procesar la solicitud'
        };
    }
};

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
    searchByName,
    requestPasswordReset,
    resetPasswordWithToken,
    changePassword,
    contactShopOwner
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
    searchByName,
    requestPasswordReset,
    resetPasswordWithToken,
    changePassword,
    contactShopOwner
};