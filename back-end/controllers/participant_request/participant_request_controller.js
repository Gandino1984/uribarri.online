// back-end/controllers/participant_request/participant_request_controller.js
import participant_request_model from "../../models/participant_request_model.js";
import participant_model from "../../models/participant_model.js";
import organization_model from "../../models/organization_model.js";
import user_model from "../../models/user_model.js";

//update: Create a join request
async function createRequest(requestData) {
    try {
        // Check if organization exists
        const organization = await organization_model.findByPk(requestData.id_org);
        if (!organization) {
            return { error: "La asociación no existe" };
        }
        
        // Check if user exists
        const user = await user_model.findByPk(requestData.id_user);
        if (!user) {
            return { error: "El usuario no existe" };
        }
        
        // Check if user is already a participant
        const existingParticipant = await participant_model.findOne({
            where: {
                id_user: requestData.id_user,
                id_org: requestData.id_org
            }
        });
        
        if (existingParticipant) {
            return { error: "Ya eres miembro de esta asociación" };
        }
        
        // Check if there's already a pending request
        const existingRequest = await participant_request_model.findOne({
            where: {
                id_user: requestData.id_user,
                id_org: requestData.id_org,
                request_status: 'pending'
            }
        });
        
        if (existingRequest) {
            return { error: "Ya tienes una solicitud pendiente para esta asociación" };
        }
        
        // Create the request
        const request = await participant_request_model.create({
            id_user: requestData.id_user,
            id_org: requestData.id_org,
            request_message: requestData.request_message || null
        });
        
        return { 
            success: "Solicitud enviada. El gestor de la asociación revisará tu solicitud.",
            data: request
        };
    } catch (err) {
        console.error("Error creating participant request:", err);
        return { error: "Error al crear la solicitud" };
    }
}

//update: Get all pending requests for an organization
async function getOrganizationRequests(id_org, status = 'pending') {
    try {
        const whereClause = { id_org };
        if (status !== 'all') {
            whereClause.request_status = status;
        }
        
        const requests = await participant_request_model.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });
        
        // Include user information
        const requestsWithUsers = [];
        for (const request of requests) {
            const user = await user_model.findByPk(request.id_user, {
                attributes: ['id_user', 'name_user', 'email_user', 'image_user', 'location_user']
            });
            requestsWithUsers.push({
                ...request.toJSON(),
                user: user ? user.toJSON() : null
            });
        }
        
        return { data: requestsWithUsers };
    } catch (err) {
        console.error("Error getting organization requests:", err);
        return { error: "Error al obtener las solicitudes" };
    }
}

//update: Get user's requests
async function getUserRequests(id_user) {
    try {
        const requests = await participant_request_model.findAll({
            where: { id_user },
            order: [['created_at', 'DESC']]
        });
        
        // Include organization information
        const requestsWithOrgs = [];
        for (const request of requests) {
            const organization = await organization_model.findByPk(request.id_org);
            requestsWithOrgs.push({
                ...request.toJSON(),
                organization: organization ? organization.toJSON() : null
            });
        }
        
        return { data: requestsWithOrgs };
    } catch (err) {
        console.error("Error getting user requests:", err);
        return { error: "Error al obtener las solicitudes del usuario" };
    }
}

//update: Approve a request
async function approveRequest(id_request, response_message = null) {
    try {
        const request = await participant_request_model.findByPk(id_request);
        
        if (!request) {
            return { error: "Solicitud no encontrada" };
        }
        
        if (request.request_status !== 'pending') {
            return { error: "Esta solicitud ya fue procesada" };
        }
        
        // Update request status
        await request.update({
            request_status: 'approved',
            response_message: response_message
        });
        
        // Add user as participant
        await participant_model.create({
            id_org: request.id_org,
            id_user: request.id_user,
            org_managed: false
        });
        
        return { 
            success: "Solicitud aprobada. El usuario ahora es miembro de la asociación.",
            data: request
        };
    } catch (err) {
        console.error("Error approving request:", err);
        return { error: "Error al aprobar la solicitud" };
    }
}

//update: Reject a request
async function rejectRequest(id_request, response_message = null) {
    try {
        const request = await participant_request_model.findByPk(id_request);
        
        if (!request) {
            return { error: "Solicitud no encontrada" };
        }
        
        if (request.request_status !== 'pending') {
            return { error: "Esta solicitud ya fue procesada" };
        }
        
        // Update request status
        await request.update({
            request_status: 'rejected',
            response_message: response_message
        });
        
        return { 
            success: "Solicitud rechazada.",
            data: request
        };
    } catch (err) {
        console.error("Error rejecting request:", err);
        return { error: "Error al rechazar la solicitud" };
    }
}

//update: Cancel a pending request (by user)
async function cancelRequest(id_user, id_org) {
    try {
        const request = await participant_request_model.findOne({
            where: {
                id_user,
                id_org,
                request_status: 'pending'
            }
        });
        
        if (!request) {
            return { error: "No se encontró solicitud pendiente" };
        }
        
        await request.destroy();
        
        return { 
            success: "Solicitud cancelada exitosamente"
        };
    } catch (err) {
        console.error("Error canceling request:", err);
        return { error: "Error al cancelar la solicitud" };
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