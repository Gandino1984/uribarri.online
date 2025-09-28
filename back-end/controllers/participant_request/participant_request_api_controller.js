// back-end/controllers/participant_request/participant_request_api_controller.js
import participantRequestController from "./participant_request_controller.js";

async function createRequest(req, res) {
    try {
        const { id_user, id_org, request_message } = req.body;
        
        if (!id_user || !id_org) {
            return res.status(400).json({ 
                error: 'Usuario y organización son obligatorios' 
            });
        }
        
        const { error, data, success } = await participantRequestController.createRequest({
            id_user,
            id_org,
            request_message
        });
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("Error in createRequest:", err);
        res.status(500).json({ 
            error: "Error al crear la solicitud",
            details: err.message
        });
    }
}

async function getOrganizationRequests(req, res) {
    try {
        const { id_org, status = 'pending' } = req.body;
        
        if (!id_org) {
            return res.status(400).json({ 
                error: 'El ID de la organización es obligatorio' 
            });
        }
        
        const { error, data } = await participantRequestController.getOrganizationRequests(id_org, status);
        res.json({ error, data });
    } catch (err) {
        console.error("Error in getOrganizationRequests:", err);
        res.status(500).json({ 
            error: "Error al obtener las solicitudes",
            details: err.message
        });
    }
}

async function getUserRequests(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({ 
                error: 'El ID del usuario es obligatorio' 
            });
        }
        
        const { error, data } = await participantRequestController.getUserRequests(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("Error in getUserRequests:", err);
        res.status(500).json({ 
            error: "Error al obtener las solicitudes",
            details: err.message
        });
    }
}

async function approveRequest(req, res) {
    try {
        const { id_request, response_message } = req.body;
        
        if (!id_request) {
            return res.status(400).json({ 
                error: 'El ID de la solicitud es obligatorio' 
            });
        }
        
        const { error, data, success } = await participantRequestController.approveRequest(
            id_request, 
            response_message
        );
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("Error in approveRequest:", err);
        res.status(500).json({ 
            error: "Error al aprobar la solicitud",
            details: err.message
        });
    }
}

async function rejectRequest(req, res) {
    try {
        const { id_request, response_message } = req.body;
        
        if (!id_request) {
            return res.status(400).json({ 
                error: 'El ID de la solicitud es obligatorio' 
            });
        }
        
        const { error, data, success } = await participantRequestController.rejectRequest(
            id_request,
            response_message
        );
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("Error in rejectRequest:", err);
        res.status(500).json({ 
            error: "Error al rechazar la solicitud",
            details: err.message
        });
    }
}

async function cancelRequest(req, res) {
    try {
        const { id_user, id_org } = req.body;
        
        if (!id_user || !id_org) {
            return res.status(400).json({ 
                error: 'Usuario y organización son obligatorios' 
            });
        }
        
        const { error, success } = await participantRequestController.cancelRequest(id_user, id_org);
        
        res.json({ error, success });
    } catch (err) {
        console.error("Error in cancelRequest:", err);
        res.status(500).json({ 
            error: "Error al cancelar la solicitud",
            details: err.message
        });
    }
}

export {
    createRequest,
    getOrganizationRequests,
    getUserRequests,
    approveRequest,
    rejectRequest,
    cancelRequest
};

export default {
    createRequest,
    getOrganizationRequests,
    getUserRequests,
    approveRequest,
    rejectRequest,
    cancelRequest
};