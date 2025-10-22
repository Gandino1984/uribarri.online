import { Router } from "express";
import userApiController from "../controllers/user/user_api_controller.js";
import IpRegistry from '../../back-end/models/ip_registry_model.js'; 
import dotenv from 'dotenv';
import path from 'path';
import { handleProfileImageUpload } from '../middleware/ProfileUploadMiddleware.js';
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
            
            if (hoursSinceLastAttempt >= RESET_HOURS) {
                await ipRecord.update({
                    registration_count: 0,
                    last_attempt: new Date()
                });
                return res.json({ canRegister: true, hoursUntilReset: 0 });
            }
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

router.post("/by-email", userApiController.getByEmail);

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

//update:
router.post('/request-password-reset', userApiController.requestPasswordReset);

//update:
router.post('/reset-password', userApiController.resetPasswordWithToken);

//update:
router.post('/change-password', userApiController.changePassword);

//update: Contact shop owner route
router.post('/contact-shop-owner', userApiController.contactShopOwner);

const handleUpload = async (req, res) => {
    try {
        console.log('=== HANDLE UPLOAD START ===');
        console.log('req.file:', req.file);
        console.log('req.headers:', req.headers);
        
        const userName = req.headers['x-user-name'];
        
        console.log('userName from headers:', userName);
        console.log('req.file exists:', !!req.file);
        
        if (!req.file || !userName) {
            console.error('Missing required fields:', {
                hasFile: !!req.file,
                hasUserName: !!userName
            });
            return res.status(400).json({ 
                error: 'Faltan campos requeridos',
                details: !req.file ? 'No file uploaded' : 'Missing x-user-name header'
            });
        }

        console.log('Calling updateProfileImage with userName:', userName);
        const result = await userApiController.updateProfileImage(userName, userName);
        
        console.log('updateProfileImage result:', result);
        
        if (result.error) {
            console.error('updateProfileImage returned error:', result.error);
            return res.status(400).json(result);
        }

        const response = {
            ...result,
            data: {
                ...result.data,
                image_user: userName
            }
        };
        
        console.log('Sending success response:', response);
        console.log('=== HANDLE UPLOAD END ===');
        
        return res.json(response);
    } catch (error) {
        console.error('Error handling upload:', error);
        return res.status(500).json({ 
            error: 'Error en la carga de la imagen de perfil',
            details: error.message 
        });
    }
};

router.post('/upload-image', handleProfileImageUpload, handleUpload);
router.post('/upload-profile-image', handleProfileImageUpload, handleUpload);

router.get('/image/:userName', userApiController.getUserImage);

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