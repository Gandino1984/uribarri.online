// back-end/controllers/participant/participant_api_controller.js
import participantController from "./participant_controller.js";

async function getAll(req, res) {
    try {
        const { error, data } = await participantController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todos los participantes",
            details: err.message
        });
    }
}

async function getByOrganizationId(req, res) {
    try {
        const { id_org } = req.body;
        
        if (!id_org) {
            return res.status(400).json({ 
                error: 'El ID de la organización es obligatorio' 
            });
        }
        
        const { error, data } = await participantController.getByOrganizationId(id_org);
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_api_controller.js - getByOrganizationId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener participantes de la organización",
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
        
        const { error, data } = await participantController.getByUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> participant_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener organizaciones del usuario",
            details: err.message
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_org,
            id_user,
            org_managed // update: Accept org_managed field
        } = req.body;
        
        //update: Validate required fields
        if (!id_org || !id_user) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_org: !id_org,
                    id_user: !id_user
                }
            });
        }
        
        const { error, data, success } = await participantController.create({
            id_org,
            id_user,
            org_managed: org_managed || false // update: Pass org_managed field
        });
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> participant_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al agregar participante",
            details: err.message
        });
    }
}

//update: New function to set participant as manager
async function setAsManager(req, res) {
    try {
        const { id_participant } = req.params;
        
        if (!id_participant) {
            return res.status(400).json({ 
                error: 'El ID del participante es obligatorio'
            });
        }
        
        const { error, data, success } = await participantController.setAsManager(id_participant);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success, error });
    } catch (err) {
        console.error("-> participant_api_controller.js - setAsManager() - Error =", err);
        res.status(500).json({ 
            error: "Error al establecer el gestor",
            details: err.message 
        });
    }
}

//update: New function to remove manager status
async function removeAsManager(req, res) {
    try {
        const { id_participant } = req.params;
        
        if (!id_participant) {
            return res.status(400).json({ 
                error: 'El ID del participante es obligatorio'
            });
        }
        
        const { error, data, success } = await participantController.removeAsManager(id_participant);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success, error });
    } catch (err) {
        console.error("-> participant_api_controller.js - removeAsManager() - Error =", err);
        res.status(500).json({ 
            error: "Error al remover el estatus de gestor",
            details: err.message 
        });
    }
}

async function removeById(req, res) {
    try {
        const id_participant = req.params.id_participant;
        
        if (!id_participant) {
            return res.status(400).json({ 
                error: 'El ID del participante es obligatorio'
            });
        }
        
        const { error, data, message } = await participantController.removeById(id_participant);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> participant_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el participante",
            details: err.message 
        });
    }
}

async function removeByUserAndOrg(req, res) {
    try {
        const { id_user, id_org } = req.body;
        
        if (!id_user || !id_org) {
            return res.status(400).json({ 
                error: 'El ID del usuario y organización son obligatorios' 
            });
        }
        
        const { error, data, message } = await participantController.removeByUserAndOrg(id_user, id_org);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> participant_api_controller.js - removeByUserAndOrg() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar el participante",
            details: err.message 
        });
    }
}

export {
    getAll,
    getByOrganizationId,
    getByUserId,
    create,
    setAsManager,
    removeAsManager,
    removeById,
    removeByUserAndOrg
};

export default {
    getAll,
    getByOrganizationId,
    getByUserId,
    create,
    setAsManager,
    removeAsManager,
    removeById,
    removeByUserAndOrg
};