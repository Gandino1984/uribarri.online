import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/sequelize.js';
import router from './routers/main_router.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config, { logEnvironmentInfo } from './config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const INTERNAL_PORT = 3000;
const EXTERNAL_PORT = config.app.port;

// Middlewares

app.get('/test-assets', (req, res) => {
    const testPath = path.join(__dirname, 'assets', 'images', 'shops', 'comercio de Germán', 'cover_image', 'cover.webp');
    console.log('🧪 Test endpoint called');
    console.log('Looking for file at:', testPath);
    console.log('File exists:', fs.existsSync(testPath));
    
    if (fs.existsSync(testPath)) {
        return res.sendFile(testPath);
    } else {
        return res.status(404).json({ 
            error: 'File not found',
            path: testPath 
        });
    }
});

app.use('/images', (req, res, next) => {
    const decodedUrl = decodeURIComponent(req.url);
    console.log('📷 Legacy images request:', {
        original: req.url,
        decoded: decodedUrl,
        fullPath: path.join(__dirname, '..', 'public', 'images', decodedUrl)
    });
    next();
}, express.static(path.join(__dirname, '..', 'public', 'images')));

app.use('/assets/images', (req, res, next) => {
    console.log('🖼️ Assets request received!');
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    
    const requestedPath = decodeURIComponent(req.path);
    const fullPath = path.join(__dirname, 'assets', 'images', requestedPath);
    
    console.group('🖼️ Assets Image Request');
    console.log('Original req.path:', req.path);
    console.log('Decoded path:', requestedPath);
    console.log('Full filesystem path:', fullPath);
    console.log('File exists:', fs.existsSync(fullPath));
    
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log('File info:', {
            isFile: stats.isFile(),
            size: stats.size + ' bytes',
            isDirectory: stats.isDirectory()
        });
        
        if (stats.isFile()) {
            console.log('✅ Serving file');
            console.groupEnd();
            return res.sendFile(fullPath);
        } else if (stats.isDirectory()) {
            console.log('❌ Path is a directory, not a file');
            console.groupEnd();
            return res.status(404).json({ error: 'Path is a directory' });
        }
    } else {
        console.log('❌ File does not exist');
        
        const dirPath = path.dirname(fullPath);
        console.log('Parent directory:', dirPath);
        
        if (fs.existsSync(dirPath)) {
            console.log('Directory exists, contents:');
            try {
                const files = fs.readdirSync(dirPath);
                files.forEach(file => {
                    console.log(`  - ${file}`);
                });
            } catch (err) {
                console.log('Error reading directory:', err.message);
            }
        } else {
            console.log('Parent directory does not exist');
            
            const pathParts = requestedPath.split('/').filter(p => p);
            let testPath = path.join(__dirname, 'assets', 'images');
            console.log('Walking directory tree:');
            console.log(`✓ ${testPath}`);
            
            for (const part of pathParts) {
                testPath = path.join(testPath, part);
                if (fs.existsSync(testPath)) {
                    const stat = fs.statSync(testPath);
                    if (stat.isDirectory()) {
                        console.log(`✓ ${testPath} (directory)`);
                        const contents = fs.readdirSync(testPath);
                        console.log(`  Contents: [${contents.join(', ')}]`);
                    } else {
                        console.log(`✓ ${testPath} (file)`);
                    }
                } else {
                    console.log(`✗ ${testPath} (NOT FOUND)`);
                    break;
                }
            }
        }
        
        console.groupEnd();
        return res.status(404).json({ 
            error: 'Image not found',
            path: requestedPath,
            fullPath: fullPath
        });
    }
    
    console.groupEnd();
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS using centralized config
app.use(cors(config.cors));

// Routes
app.use("/", router);


// Start server
app.listen(INTERNAL_PORT, '0.0.0.0', () => {
    console.log('');
    logEnvironmentInfo();
    console.log('');
    console.log(`>>> Internal Port:  ${INTERNAL_PORT}`);
    console.log(`>>> External Port:  ${EXTERNAL_PORT}`);
    console.log(`>>> Legacy images:  ${path.join(__dirname, '..', 'public', 'images')}`);
    console.log(`>>> Backend assets: ${path.join(__dirname, 'assets', 'images')}`);
    console.log('');
});