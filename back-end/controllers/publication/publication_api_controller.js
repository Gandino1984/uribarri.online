import publicationController from "./publication_controller.js";
import path from 'path';

async function getAll(req, res) {
    try {
        const { error, data } = await publicationController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> publication_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las publicaciones",
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_publication } = req.body;
        
        if (!id_publication) {
            return res.status(400).json({ 
                error: 'El ID de la publicación es obligatorio' 
            });
        }
        
        const { error, data } = await publicationController.getById(id_publication);
        res.json({ error, data });
    } catch (err) {
        console.error("-> publication_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener la publicación",
            details: err.message
        });
    }
}

async function getByUserId(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({ 
                error: 'El ID del usuario es obligatorio' 
            });
        }
        
        const { error, data } = await publicationController.getByUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> publication_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener publicaciones del usuario",
            details: err.message
        });
    }
}

async function getByDateRange(req, res) {
    try {
        const { start_date, end_date } = req.body;
        
        if (!start_date || !end_date) {
            return res.status(400).json({ 
                error: 'Las fechas de inicio y fin son obligatorias' 
            });
        }
        
        const { error, data } = await publicationController.getByDateRange(start_date, end_date);
        res.json({ error, data });
    } catch (err) {
        console.error("-> publication_api_controller.js - getByDateRange() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener publicaciones por rango de fechas",
            details: err.message
        });
    }
}

//update: Add getByOrganization endpoint
async function getByOrganization(req, res) {
    try {
        const { id_org } = req.body;
        
        if (!id_org) {
            return res.status(400).json({ 
                error: 'El ID de la organización es obligatorio' 
            });
        }
        
        const { error, data, message } = await publicationController.getByOrganizationId(id_org);
        res.json({ error, data, message });
    } catch (err) {
        console.error("-> publication_api_controller.js - getByOrganization() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener publicaciones de la organización",
            details: err.message
        });
    }
}

async function create(req, res) {
    try {
        const { 
            title_pub,
            content_pub,
            date_pub,
            time_pub,
            id_user_pub,
            id_org, //update: Add organization field
            image_pub
        } = req.body;
        
        //update: Validate required fields
        if (!title_pub || !content_pub || !id_user_pub) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    title_pub: !title_pub,
                    content_pub: !content_pub,
                    id_user_pub: !id_user_pub
                }
            });
        }
        
        const { error, data, success } = await publicationController.create({
            title_pub,
            content_pub,
            date_pub,
            time_pub,
            id_user_pub,
            id_org: id_org || null, //update: Include organization
            image_pub: image_pub || null
        });
        
        if (error) {
            return res.status(400).json({ error, details: data });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> publication_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la publicación",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_publication,
            title_pub,
            content_pub,
            date_pub,
            time_pub,
            id_user_pub,
            id_org, //update: Add organization field
            image_pub
        } = req.body;
        
        if (!id_publication) {
            return res.status(400).json({
                error: 'El ID de la publicación es obligatorio'
            });
        }
        
        const updateData = {};
        if (title_pub !== undefined) updateData.title_pub = title_pub;
        if (content_pub !== undefined) updateData.content_pub = content_pub;
        if (date_pub !== undefined) updateData.date_pub = date_pub;
        if (time_pub !== undefined) updateData.time_pub = time_pub;
        if (id_user_pub !== undefined) updateData.id_user_pub = id_user_pub;
        if (id_org !== undefined) updateData.id_org = id_org; //update: Include organization
        if (image_pub !== undefined) updateData.image_pub = image_pub;
        
        const { error, data } = await publicationController.update(id_publication, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> publication_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la publicación",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const id_publication = req.params.id_publication;
        
        if (!id_publication) {
            return res.status(400).json({ 
                error: 'El ID de la publicación es obligatorio'
            });
        }
        
        const { error, data, message } = await publicationController.removeById(id_publication);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> publication_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la publicación",
            details: err.message 
        });
    }
}

async function uploadImage(req, res) {
    try {
        const id_publication = req.headers['x-publication-id'];
        
        if (!id_publication) {
            return res.status(400).json({
                error: 'Publication ID is required'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }
        
        // Construct the relative path for storing in the database
        const relativePath = path.join(
            'images', 
            'uploads', 
            'publications', 
            req.file.filename
        ).replace(/\\/g, '/');
        
        const { error, data } = await publicationController.uploadImage(id_publication, relativePath);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json({ error: null, data });
    } catch (err) {
        console.error('Error uploading publication image:', err);
        res.status(500).json({
            error: 'Error uploading publication image',
            details: err.message
        });
    }
}

// Export with new function included
export {
    getAll,
    getById,
    getByUserId,
    getByDateRange,
    getByOrganization, //update: Add new function
    create,
    update,
    removeById,
    uploadImage
};

export default {
    getAll,
    getById,
    getByUserId,
    getByDateRange,
    getByOrganization, //update: Add new function
    create,
    update,
    removeById,
    uploadImage
};