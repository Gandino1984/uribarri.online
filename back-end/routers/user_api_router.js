import { Router } from "express";
import userApiController from "../controllers/user/user_api_controller.js";
import IpRegistry from '../../back-end/models/ip_registry_model.js'; 
import dotenv from 'dotenv';
dotenv.config();
const router = Router();
const MAX_REGISTRATIONS = parseInt(process.env.MAX_REGISTRATIONS) || 2;
const RESET_HOURS = parseInt(process.env.RESET_HOURS) || 24;


router.get("/", userApiController.getAll);

router.get('/ip/check', async (req, res) => {
    console.log('!!! -> user_api_router.js - /ip/check endpoint hit');

    const ip = req.socket.remoteAddress;
    console.log('-> /ip/check - Your ip address = ', ip);
    
    try {
        const [ipRecord, created] = await IpRegistry.findOrCreate({
            where: { ip_address: ip },
            defaults: {
                registration_count: 0,
                last_attempt: new Date()
            }
        });
        console.log('-> /ip/check - IP record = ', ipRecord);
        console.log('-> /ip/check - Created = ', created);
        // if an ip record does not exist, create a new one
        if (!created) {
            const hoursSinceLastAttempt = (Date.now() - new Date(ipRecord.last_attempt).getTime()) / (1000 * 60 * 60); 
            // Reset counter if RESET_HOURS have passed
            if (hoursSinceLastAttempt >= RESET_HOURS) {
                console.log('-> /ip/check - RESET_HOURS have passed, resetting registration attempt counter...');
                await ipRecord.update({
                    registration_count: 0,
                    last_attempt: new Date()
                });
                // Return response with canRegister = true and hoursUntilReset = 0
                console.log('-> /ip/check - IP record updated');
                console.log('-> /ip/check - canRegister = true & hoursUntilReset = 0');
                return res.json({ canRegister: true, hoursUntilReset: 0 });
            }
            // Check if limit exceeded
            if (ipRecord.registration_count >= MAX_REGISTRATIONS) {
                console.log('-> /ip/check - Limit of registrations exceeded, returning response with canRegister = false & hoursUntilReset = ', RESET_HOURS - hoursSinceLastAttempt);
                const hoursUntilReset = RESET_HOURS - hoursSinceLastAttempt;
                return res.json({ canRegister: false, hoursUntilReset });
            }
        }
        res.json({ canRegister: true, hoursUntilReset: 0 });
    } catch (error) {
        console.error('-> ip/check - Error checking registration limits - Error = ', error, {
            message: error.message,
            stack: error.stack
        });
        if (error.name === 'SequelizeConnectionError') {
            res.status(500).json({ 
                error: 'Database connection failed',
                details: 'Unable to connect to the database'
            });
        } else {
            res.status(500).json({ 
                error: 'Error checking registration limits',
                details: error.message
            });
        }
    }
});

router.post("/login", userApiController.login);
// to create any type of user
router.post("/create", userApiController.create);
router.post("/remove", userApiController.removeById);
// to register a user without an associated shop
router.post('/register', async (req, res) => {
    console.log('Register endpoint hit');  
    const ip = req.ip || req.connection.remoteAddress;
    try {
        const [ipRecord, created] = await IpRegistry.findOrCreate({
            where: { ip_address: ip },
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
        // Proceed with registration
        await userApiController.register(req, res);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error en el registro' });
    }
});
router.post("/details", userApiController.getByUserName);

// route for creating a seller with a shop that he/she owns
router.post('/seller/create', async (req, res) => {
    console.log('Seller creation endpoint hit');  
    const ip = req.ip || req.connection.remoteAddress;
    try {
        const [ipRecord, created] = await IpRegistry.findOrCreate({
            where: { ip_address: ip },
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
        // Proceed with seller and shop creation
        await userApiController.createSellerWithShop(req, res);
    } catch (error) {
        console.error('Seller creation error:', error);
        res.status(500).json({ error: 'Error en la creación del seller' });
    }
});

export default router;