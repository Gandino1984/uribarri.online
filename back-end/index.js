//update: back-end/index.js - Added route to serve backend assets
import express from 'express'; 
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/sequelize.js';
import router from './routers/main_router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const INTERNAL_PORT = 3000;
const EXTERNAL_PORT = process.env.APP_PORT || 3007;

// Middlewares
//update: Serve images from both public (legacy) and backend assets folders
// Keep the old route for backward compatibility with existing images
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

//update: Add new route to serve images from backend assets folder
// This will handle requests to /assets/images/*
app.use('/assets/images', express.static(path.join(__dirname, 'assets', 'images')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//update: CORS configuration with X-Organization-ID header added
app.use(cors({
    origin: [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      `http://localhost:${EXTERNAL_PORT}`
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Shop-ID', 
        'X-Shop-Name', 
        'X-Product-ID',
        'X-Package-ID',
        'X-Publication-ID',
        'X-Organization-ID',
        'Content-Disposition'
    ],
    exposedHeaders: ['Content-Disposition']
}));

// Database Initialization
async function initializeDatabase() {
    try {
        await sequelize.sync({ alter: true });
        
        console.log('-> SEQUELIZE: La base de datos ha sido sincronizada con el modelo');
    } catch (err) {
        console.error('!!! SEQUELIZE: Error en la sincronización de la base de datos = ', err);
        process.exit(1);
    }
}

initializeDatabase().then(() => {
    app.use("/", router);

    app.listen(INTERNAL_PORT, '0.0.0.0', () => {
        console.log(`SERVIDOR INTERNO EN EL PUERTO = ${INTERNAL_PORT}`);
        console.log(`PUERTO EXTERNO MAPEADO A = ${EXTERNAL_PORT}`);
        //update: Log the static file routes
        console.log(`Serving legacy images from: /images`);
        console.log(`Serving backend assets from: /assets/images`);
    });
});