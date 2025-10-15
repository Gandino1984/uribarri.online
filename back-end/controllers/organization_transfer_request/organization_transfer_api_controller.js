// back-end/controllers/organization_transfer/organization_transfer_api_controller.js
import organizationTransferController from "./organization_transfer_controller.js";

//update: Get all transfer requests
async function getAll(req, res) {
    try {
        const { error, data } = await organizationTransferController.getAll();
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las solicitudes de traspaso",
            details: err.message
        });
    }
}

//update: Get transfer requests by organization
async function getByOrganizationId(req, res) {
    try {
        const { id_org } = req.body;
        
        if (!id_org) {
            return res.status(400).json({ 
                error: 'El ID de la asociación es obligatorio' 
            });
        }
        
        const { error, data } = await organizationTransferController.getByOrganizationId(id_org);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - getByOrganizationId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener solicitudes de la asociación",
            details: err.message
        });
    }
}

//update: Get transfer requests sent by a user
async function getByFromUserId(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({ 
                error: 'El ID del usuario es obligatorio' 
            });
        }
        
        const { error, data } = await organizationTransferController.getByFromUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - getByFromUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener solicitudes enviadas",
            details: err.message
        });
    }
}

//update: Get transfer requests received by a user
async function getByToUserId(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({ 
                error: 'El ID del usuario es obligatorio' 
            });
        }
        
        const { error, data } = await organizationTransferController.getByToUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - getByToUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener solicitudes recibidas",
            details: err.message
        });
    }
}

//update: Create a new transfer request
async function create(req, res) {
    try {
        const { 
            id_org,
            id_from_user,
            id_to_user,
            transfer_message
        } = req.body;
        
        //update: Validate required fields
        if (!id_org || !id_from_user || !id_to_user) {
            return res.status(400).json({
                error: 'Campos obligatorios faltantes',
                missingFields: {
                    id_org: !id_org,
                    id_from_user: !id_from_user,
                    id_to_user: !id_to_user
                }
            });
        }
        
        const { error, data, success } = await organizationTransferController.create({
            id_org,
            id_from_user,
            id_to_user,
            transfer_message: transfer_message || null
        });
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la solicitud de traspaso",
            details: err.message
        });
    }
}

//update: Accept a transfer request
async function acceptTransfer(req, res) {
    try {
        const { id_transfer_request, response_message } = req.body;
        
        if (!id_transfer_request) {
            return res.status(400).json({ 
                error: 'El ID de la solicitud es obligatorio'
            });
        }
        
        const { error, data, success } = await organizationTransferController.acceptTransfer(
            id_transfer_request, 
            response_message || null
        );
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success, error });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - acceptTransfer() - Error =", err);
        res.status(500).json({ 
            error: "Error al aceptar el traspaso",
            details: err.message 
        });
    }
}

//update: Reject a transfer request
async function rejectTransfer(req, res) {
    try {
        const { id_transfer_request, response_message } = req.body;
        
        if (!id_transfer_request) {
            return res.status(400).json({ 
                error: 'El ID de la solicitud es obligatorio'
            });
        }
        
        const { error, data, success } = await organizationTransferController.rejectTransfer(
            id_transfer_request,
            response_message || null
        );
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success, error });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - rejectTransfer() - Error =", err);
        res.status(500).json({ 
            error: "Error al rechazar el traspaso",
            details: err.message 
        });
    }
}

//update: Cancel a transfer request
async function cancelTransfer(req, res) {
    try {
        const { id_transfer_request } = req.body;
        
        if (!id_transfer_request) {
            return res.status(400).json({ 
                error: 'El ID de la solicitud es obligatorio'
            });
        }
        
        const { error, data, success } = await organizationTransferController.cancelTransfer(id_transfer_request);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, success, error });
    } catch (err) {
        console.error("-> organization_transfer_api_controller.js - cancelTransfer() - Error =", err);
        res.status(500).json({ 
            error: "Error al cancelar el traspaso",
            details: err.message 
        });
    }
}

export {
    getAll,
    getByOrganizationId,
    getByFromUserId,
    getByToUserId,
    create,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer
};

export default {
    getAll,
    getByOrganizationId,
    getByFromUserId,
    getByToUserId,
    create,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer
};