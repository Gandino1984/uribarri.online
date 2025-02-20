import { Router } from "express";
import userApiController from "../controllers/user/user_api_controller.js";
import IpRegistry from '../../back-end/models/ip_registry_model.js'; 
import dotenv from 'dotenv';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { handleProfileImageUpload } from '../middleware/uploadMiddleware.js';

dotenv.config();

const router = Router();

const MAX_REGISTRATIONS = parseInt(process.env.MAX_REGISTRATIONS) || 2;

const RESET_HOURS = parseInt(process.env.RESET_HOURS) || 24;

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

router.post('/upload-profile-image', handleProfileImageUpload, async (req, res) => {
    try {
        if (!req.file || !req.body.name_user) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos' 
            });
        }

        // Construct the path relative to the public directory
        const relativePath = path.join('images', 'uploads', 'users', req.body.name_user, path.basename(req.file.path))
            .split(path.sep)
            .join('/');
        
        const result = await userApiController.updateProfileImage(req.body.name_user, relativePath);
        
        if (result.error) {
            return res.status(400).json(result);
        }

        return res.json({
            ...result,
            data: {
                ...result.data,
                image_user: relativePath // Return the clean relative path
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


export default router;