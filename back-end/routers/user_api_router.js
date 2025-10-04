import { Router } from "express";
import userApiController from "../controllers/user/user_api_controller.js";
import IpRegistry from '../../back-end/models/ip_registry_model.js'; 
import dotenv from 'dotenv';
// import multer from 'multer';
import path from 'path';
// import fs from 'fs';
import { handleProfileImageUpload } from '../middleware/ProfileUploadMiddleware.js';
//update: Import user controller for verification functions
import userController from "../controllers/user/user_controller.js";

dotenv.config();

const router = Router();

const MAX_REGISTRATIONS = parseInt(process.env.MAX_REGISTRATIONS) || 2;

const RESET_HOURS = parseInt(process.env.RESET_HOURS) || 72;

router.get('/ip/check', async (req, res) => {
    const userIp = req.socket.remoteAddress;

    try {
        const [ipRecord, created] = await IpRegistry.findOrCreate({
            where: { ip_address: userIp },
            defaults: {
                registration_count: 0,
                last_attempt: new Date()
            }
        });

        console.log("-> user_api_router - /ip/check - IP Record = ", ipRecord);
        
        if (!created) {
            console.log("->  /ip/check - Su dirección IP no ha sido registrada");
            
            const hoursSinceLastAttempt = (Date.now() - new Date(ipRecord.last_attempt).getTime()) / (1000 * 60 * 60); 
            
            // Reset counter if RESET_HOURS have passed
            if (hoursSinceLastAttempt >= RESET_HOURS) {
                await ipRecord.update({
                    registration_count: 0,
                    last_attempt: new Date()
                });
                return res.json({ canRegister: true, hoursUntilReset: 0 });
            }
            // Check if limit exceeded
            if (ipRecord.registration_count >= MAX_REGISTRATIONS) {
                const hoursUntilReset = RESET_HOURS - hoursSinceLastAttempt;
                return res.json({ canRegister: false, hoursUntilReset });
            }
        }
        res.json({ canRegister: true, hoursUntilReset: 0 });

    } catch (error) {

        console.error('IP check error:', {
            message: error.message,
            stack: error.stack
        });
        
        if (error.name === 'SequelizeConnectionError') {
            res.status(500).json({ 
                error: 'La conexión con la base de datos ha fallado',
                details: 'Unable to connect to the database'
            });
        } else {
            res.status(500).json({ 
                error: 'Error en la comprobación de la IP',
                details: error.message
            });
        }
    }
});

router.get("/", userApiController.getAll);

router.post("/byId", userApiController.getById);

router.post("/login", userApiController.login);

router.post("/create", userApiController.create);

//update: Route for searching by email
router.post("/by-email", userApiController.getByEmail);

//update: Route for searching by name (partial match)
router.post("/search-by-name", userApiController.searchByName);

router.patch("/update", userApiController.update);

router.delete("/remove/:id_user", userApiController.removeById);

router.post('/register', async (req, res) => {
    const userIp = req.ip || req.socket.remoteAddress;

    console.log('-> /registerI - IP del usuario:', userIp);

    try {
        const [ipRecord, created] = await IpRegistry.findOrCreate({
            where: { ip_address: userIp },
            defaults: {
                registration_count: 0,
                last_attempt: new Date()
            }
        });

        const hoursSinceLastAttempt = created ? 0 : (Date.now() - new Date(ipRecord.last_attempt).getTime()) / (1000 * 60 * 60);
        
        if (!created && hoursSinceLastAttempt < RESET_HOURS && ipRecord.registration_count >= MAX_REGISTRATIONS) {
            return res.status(429).json({ 
                error: 'Has excedido el límite de registros permitidos.' 
            });
        }
        
        // Update registration count
        await ipRecord.update({
            registration_count: hoursSinceLastAttempt >= RESET_HOURS ? 1 : ipRecord.registration_count + 1,
            last_attempt: new Date()
        });

        await userApiController.register(req, res);

    } catch (error) {
        console.error('-> Registration error:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
});

router.post("/details", userApiController.getByUserName);

//update: Add email verification route
router.post('/verify-email', async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({
                error: 'Email y token son requeridos'
            });
        }

        const result = await userController.verifyEmail(email, token);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            error: 'Error al verificar el email',
            details: error.message
        });
    }
});

//update: Add resend verification email route
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email es requerido'
            });
        }

        const result = await userController.resendVerificationEmail(email);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({
            error: 'Error al reenviar el email de verificación',
            details: error.message
        });
    }
});

router.post('/upload-profile-image', handleProfileImageUpload, async (req, res) => {
    try {
        if (!req.file || !req.body.name_user) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos' 
            });
        }

        // Construir la ruta relativa al directorio público
        const relativePath = path.join(
            'images', 
            'uploads', 
            'users', 
            req.body.name_user, 
            req.file.filename
        ).split(path.sep).join('/'); // Asegura que las barras sean forward slashes
        
        const result = await userApiController.updateProfileImage(req.body.name_user, relativePath);
        
        if (result.error) {
            return res.status(400).json(result);
        }

        return res.json({
            ...result,
            data: {
                ...result.data,
                image_user: relativePath // Devuelve la ruta relativa limpia
            }
        });
    } catch (error) {
        console.error('Error handling upload:', error);
        return res.status(500).json({ 
            error: 'Error en la carga de la imagen de perfil',
            details: error.message 
        });
    }
});


// Add this test route temporarily
router.post('/test-email-direct', async (req, res) => {
    try {
        console.log('Direct email test starting...');
        const { sendVerificationEmail, generateVerificationToken } = await import('../services/emailService.js');
        
        const testToken = generateVerificationToken();
        const testEmail = req.body.email || 'andinogerman@gmail.com';
        
        console.log('Sending test email to:', testEmail);
        const result = await sendVerificationEmail(testEmail, 'Test User', testToken);
        console.log('Test email result:', result);
        
        res.json({
            message: 'Email test completed',
            result: result
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            error: 'Email test failed',
            details: error.message
        });
    }
});




export default router;