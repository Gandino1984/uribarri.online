// back-end/controllers/participant_publication/participant_publication_api_controller.js
import participantPublicationController from "./participant_publication_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await participantPublicationController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las relaciones participante-publicación",
            details: err.message
        });
    }
}

async function getByParticipantId(req, res) {
    try {
        const { id_participant } = req.body;
        
        if (!id_participant) {
            return res.status(400).json({ 
                error: 'El ID del participante es obligatorio' 
            });
        }
        
        const { error, data } = await participantPublicationController.getByParticipantId(id_participant);
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - getByParticipantId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener publicaciones del participante",
            details: err.message
        });
    }
}

async function getByPublicationId(req, res) {
    try {
        const { id_publication } = req.body;
        
        if (!id_publication) {
            return res.status(400).json({ 
                error: 'El ID de la publicación es obligatorio' 
            });
        }
        
        const { error, data } = await participantPublicationController.getByPublicationId(id_publication);
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - getByPublicationId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener información del participante por publicación",
            details: err.message
        });
    }
}

async function getByOrganizationId(req, res) {
    try {
        const { id_org } = req.body;
        
        if (!id_org) {
            return res.status(400).json({ 
                error: 'El ID de la asociación es obligatorio' 
            });
        }
        
        const { error, data } = await participantPublicationController.getByOrganizationId(id_org);
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - getByOrganizationId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener publicaciones de la asociación",
            details: err.message
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_participant,
            id_publication
        } = req.body;
        
        //update: Validate required fields
        if (!id_participant || !id_publication) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_participant: !id_participant,
                    id_publication: !id_publication
                }
            });
        }
        
        const { error, data, success } = await participantPublicationController.create({
            id_participant,
            id_publication
        });
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la relación participante-publicación",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const id_participant_publication = req.params.id_participant_publication;
        
        if (!id_participant_publication) {
            return res.status(400).json({ 
                error: 'El ID de la relación es obligatorio'
            });
        }
        
        const { error, data, message } = await participantPublicationController.removeById(id_participant_publication);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la relación",
            details: err.message 
        });
    }
}

async function removeByParticipantAndPublication(req, res) {
    try {
        const { id_participant, id_publication } = req.body;
        
        if (!id_participant || !id_publication) {
            return res.status(400).json({ 
                error: 'El ID del participante y publicación son obligatorios' 
            });
        }
        
        const { error, data, message } = await participantPublicationController.removeByParticipantAndPublication(id_participant, id_publication);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> participant_publication_api_controller.js - removeByParticipantAndPublication() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la relación",
            details: err.message 
        });
    }
}

export {
    getAll,
    getByParticipantId,
    getByPublicationId,
    getByOrganizationId,
    create,
    removeById,
    removeByParticipantAndPublication
};

export default {
    getAll,
    getByParticipantId,
    getByPublicationId,
    getByOrganizationId,
    create,
    removeById,
    removeByParticipantAndPublication
};