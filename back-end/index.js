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
// Always use 3000 internally for Docker compatibility
const INTERNAL_PORT = 3000;
// APP_PORT is only for external mapping in Docker
const EXTERNAL_PORT = process.env.APP_PORT || 3007;

console.log(`Server will listen on internal port ${INTERNAL_PORT}`);
console.log(`External port mapping is set to ${EXTERNAL_PORT}`);

// Middlewares
// Serve static files from the public directory at project root
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration optimized for Docker environment
app.use(cors({
    // Allow multiple frontend origins
    origin: [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      // Add your Docker frontend URL if different
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
        'Content-Disposition'
    ],
    exposedHeaders: ['Content-Disposition']
}));

// Database Initialization
async function initializeDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('*******************************************************************');
        console.log('-> SEQUELIZE: La base de datos ha sido sincronizada con el modelo');
    } catch (err) {
        console.error('!!! SEQUELIZE: Error en la sincronización de la base de datos = ', err);
        process.exit(1);
    }
}

// Initialize database before starting the server
initializeDatabase().then(() => {
    app.use("/", router);

    // FIXED: Always use INTERNAL_PORT (3000) inside the container
    app.listen(INTERNAL_PORT, '0.0.0.0', () => {
        console.log(`SERVIDOR INTERNO EN EL PUERTO = ${INTERNAL_PORT}`);
        console.log(`PUERTO EXTERNO MAPEADO A = ${EXTERNAL_PORT}`);
    });
});