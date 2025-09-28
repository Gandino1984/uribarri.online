// back-end/controllers/social_event/social_event_api_controller.js
import socialEventController from "./social_event_controller.js";
import path from 'path';

async function getAll(req, res) {
    try {
        const { error, data } = await socialEventController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los eventos",
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_social_event } = req.body;
        
        if (!id_social_event) {
            return res.status(400).json({ 
                error: 'El ID del evento es obligatorio' 
            });
        }
        
        const { error, data } = await socialEventController.getById(id_social_event);
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener el evento",
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
        
        const { error, data } = await socialEventController.getByUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener eventos del usuario",
            details: err.message
        });
    }
}

async function getUpcoming(req, res) {
    try {
        const { error, data } = await socialEventController.getUpcoming();
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - getUpcoming() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener eventos próximos",
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
        
        const { error, data } = await socialEventController.getByDateRange(start_date, end_date);
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - getByDateRange() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener eventos por rango de fechas",
            details: err.message
        });
    }
}

async function create(req, res) {
    try {
        const { 
            title_soc_ev,
            creation_date_soc_ev,
            initial_date_soc_ev,
            final_date_soc_ev,
            start_time_soc_ev,
            end_time_soc_ev,
            image_soc_ev,
            id_user_creator,
            location_soc_ev,
            description_soc_ev
        } = req.body;
        
        //update: Validate required fields
        if (!title_soc_ev || !initial_date_soc_ev || !final_date_soc_ev || 
            !start_time_soc_ev || !end_time_soc_ev || !id_user_creator) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    title_soc_ev: !title_soc_ev,
                    initial_date_soc_ev: !initial_date_soc_ev,
                    final_date_soc_ev: !final_date_soc_ev,
                    start_time_soc_ev: !start_time_soc_ev,
                    end_time_soc_ev: !end_time_soc_ev,
                    id_user_creator: !id_user_creator
                }
            });
        }
        
        const { error, data, success } = await socialEventController.create({
            title_soc_ev,
            creation_date_soc_ev,
            initial_date_soc_ev,
            final_date_soc_ev,
            start_time_soc_ev,
            end_time_soc_ev,
            image_soc_ev: image_soc_ev || null,
            id_user_creator,
            location_soc_ev: location_soc_ev || null,
            description_soc_ev: description_soc_ev || null
        });
        
        if (error) {
            return res.status(400).json({ error, details: data });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> social_event_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear el evento",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
            id_social_event,
            title_soc_ev,
            creation_date_soc_ev,
            initial_date_soc_ev,
            final_date_soc_ev,
            start_time_soc_ev,
            end_time_soc_ev,
            image_soc_ev,
            id_user_creator,
            location_soc_ev,
            description_soc_ev
        } = req.body;
        
        if (!id_social_event) {
            return res.status(400).json({
                error: 'El ID del evento es obligatorio'
            });
        }
        
        const updateData = {};
        if (title_soc_ev !== undefined) updateData.title_soc_ev = title_soc_ev;
        if (creation_date_soc_ev !== undefined) updateData.creation_date_soc_ev = creation_date_soc_ev;
        if (initial_date_soc_ev !== undefined) updateData.initial_date_soc_ev = initial_date_soc_ev;
        if (final_date_soc_ev !== undefined) updateData.final_date_soc_ev = final_date_soc_ev;
        if (start_time_soc_ev !== undefined) updateData.start_time_soc_ev = start_time_soc_ev;
        if (end_time_soc_ev !== undefined) updateData.end_time_soc_ev = end_time_soc_ev;
        if (image_soc_ev !== undefined) updateData.image_soc_ev = image_soc_ev;
        if (id_user_creator !== undefined) updateData.id_user_creator = id_user_creator;
        if (location_soc_ev !== undefined) updateData.location_soc_ev = location_soc_ev;
        if (description_soc_ev !== undefined) updateData.description_soc_ev = description_soc_ev;
        
        const { error, data } = await socialEventController.update(id_social_event, updateData);
        
        if (error) {
            return res.status(400).json({ error, details: data });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> social_event_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar el evento",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const id_social_event = req.params.id_social_event;
        
        if (!id_social_event) {
            return res.status(400).json({ 
                error: 'El ID del evento es obligatorio'
            });
        }
        
        const { error, data, message } = await socialEventController.removeById(id_social_event);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> social_event_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el evento",
            details: err.message 
        });
    }
}

async function uploadImage(req, res) {
    try {
        const id_social_event = req.headers['x-event-id'];
        
        if (!id_social_event) {
            return res.status(400).json({
                error: 'Event ID is required'
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
            'events', 
            req.file.filename
        ).replace(/\\/g, '/');
        
        const { error, data } = await socialEventController.uploadImage(id_social_event, relativePath);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json({ error: null, data });
    } catch (err) {
        console.error('Error uploading event image:', err);
        res.status(500).json({
            error: 'Error uploading event image',
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    getByUserId,
    getUpcoming,
    getByDateRange,
    create,
    update,
    removeById,
    uploadImage
};

export default {
    getAll,
    getById,
    getByUserId,
    getUpcoming,
    getByDateRange,
    create,
    update,
    removeById,
    uploadImage
};