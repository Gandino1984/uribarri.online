// back-end/controllers/organization_transfer/organization_transfer_controller.js
import organization_transfer_request_model from "../../models/organization_transfer_request_model.js";
import organization_model from "../../models/organization_model.js";
import user_model from "../../models/user_model.js";
import participant_model from "../../models/participant_model.js";
import participantController from "../participant/participant_controller.js";

//update: Helper function to validate user exists
async function validateUser(id_user) {
    try {
        const user = await user_model.findOne({
            where: { id_user: id_user }
        });
        
        if (!user) {
            return {
                isValid: false,
                error: "El usuario no existe"
            };
        }
        
        return {
            isValid: true,
            user: user
        };
    } catch (err) {
        console.error("Error validating user:", err);
        return {
            isValid: false,
            error: "Error al validar el usuario"
        };
    }
}

//update: Helper function to validate organization exists
async function validateOrganization(id_org) {
    try {
        const organization = await organization_model.findOne({
            where: { id_organization: id_org }
        });
        
        if (!organization) {
            return {
                isValid: false,
                error: "La organización no existe"
            };
        }
        
        return {
            isValid: true,
            organization: organization
        };
    } catch (err) {
        console.error("Error validating organization:", err);
        return {
            isValid: false,
            error: "Error al validar la organización"
        };
    }
}

//update: Get all transfer requests
async function getAll() {
    try {
        const requests = await organization_transfer_request_model.findAll({
            order: [['created_at', 'DESC']]
        });

        if (!requests || requests.length === 0) {
            return { error: "No hay solicitudes de traspaso registradas", data: [] };
        }

        //update: Include user and organization details
        const requestsWithDetails = [];
        for (const request of requests) {
            const fromUser = await user_model.findByPk(request.id_from_user);
            const toUser = await user_model.findByPk(request.id_to_user);
            const organization = await organization_model.findByPk(request.id_org);
            
            requestsWithDetails.push({
                ...request.toJSON(),
                from_user: fromUser ? {
                    id_user: fromUser.id_user,
                    name_user: fromUser.name_user,
                    email_user: fromUser.email_user
                } : null,
                to_user: toUser ? {
                    id_user: toUser.id_user,
                    name_user: toUser.name_user,
                    email_user: toUser.email_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org
                } : null
            });
        }

        console.log("-> organization_transfer_controller.js - getAll() - solicitudes encontradas = ", requestsWithDetails.length);

        return { data: requestsWithDetails };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las solicitudes de traspaso" };
    }
}

//update: Get transfer requests by organization
async function getByOrganizationId(id_org) {
    try {
        if (!id_org) {
            return { error: "El ID de la organización es obligatorio" };
        }

        const orgValidation = await validateOrganization(id_org);
        if (!orgValidation.isValid) {
            return { error: orgValidation.error };
        }

        const requests = await organization_transfer_request_model.findAll({
            where: { id_org: id_org },
            order: [['created_at', 'DESC']]
        });

        if (!requests || requests.length === 0) {
            return { error: "No hay solicitudes de traspaso para esta organización", data: [] };
        }

        //update: Include user details
        const requestsWithUsers = [];
        for (const request of requests) {
            const fromUser = await user_model.findByPk(request.id_from_user);
            const toUser = await user_model.findByPk(request.id_to_user);
            
            requestsWithUsers.push({
                ...request.toJSON(),
                from_user: fromUser ? {
                    id_user: fromUser.id_user,
                    name_user: fromUser.name_user,
                    email_user: fromUser.email_user
                } : null,
                to_user: toUser ? {
                    id_user: toUser.id_user,
                    name_user: toUser.name_user,
                    email_user: toUser.email_user
                } : null
            });
        }

        return { data: requestsWithUsers };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - getByOrganizationId() - Error = ", err);
        return { error: "Error al obtener solicitudes por organización" };
    }
}

//update: Get transfer requests sent by a user
async function getByFromUserId(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID del usuario es obligatorio" };
        }

        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const requests = await organization_transfer_request_model.findAll({
            where: { id_from_user: id_user },
            order: [['created_at', 'DESC']]
        });

        if (!requests || requests.length === 0) {
            return { error: "El usuario no ha enviado solicitudes de traspaso", data: [] };
        }

        //update: Include organization and recipient details
        const requestsWithDetails = [];
        for (const request of requests) {
            const toUser = await user_model.findByPk(request.id_to_user);
            const organization = await organization_model.findByPk(request.id_org);
            
            requestsWithDetails.push({
                ...request.toJSON(),
                to_user: toUser ? {
                    id_user: toUser.id_user,
                    name_user: toUser.name_user,
                    email_user: toUser.email_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org
                } : null
            });
        }

        return { data: requestsWithDetails };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - getByFromUserId() - Error = ", err);
        return { error: "Error al obtener solicitudes enviadas por el usuario" };
    }
}

//update: Get transfer requests received by a user
async function getByToUserId(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID del usuario es obligatorio" };
        }

        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const requests = await organization_transfer_request_model.findAll({
            where: { id_to_user: id_user },
            order: [['created_at', 'DESC']]
        });

        if (!requests || requests.length === 0) {
            return { error: "El usuario no ha recibido solicitudes de traspaso", data: [] };
        }

        //update: Include organization and sender details
        const requestsWithDetails = [];
        for (const request of requests) {
            const fromUser = await user_model.findByPk(request.id_from_user);
            const organization = await organization_model.findByPk(request.id_org);
            
            requestsWithDetails.push({
                ...request.toJSON(),
                from_user: fromUser ? {
                    id_user: fromUser.id_user,
                    name_user: fromUser.name_user,
                    email_user: fromUser.email_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org
                } : null
            });
        }

        return { data: requestsWithDetails };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - getByToUserId() - Error = ", err);
        return { error: "Error al obtener solicitudes recibidas por el usuario" };
    }
}

//update: Create a new transfer request
async function create(transferData) {
    try {
        //update: Validate all required fields
        if (!transferData.id_org || !transferData.id_from_user || !transferData.id_to_user) {
            return { 
                error: "Campos obligatorios faltantes",
                missingFields: {
                    id_org: !transferData.id_org,
                    id_from_user: !transferData.id_from_user,
                    id_to_user: !transferData.id_to_user
                }
            };
        }

        //update: Validate users exist
        const fromUserValidation = await validateUser(transferData.id_from_user);
        if (!fromUserValidation.isValid) {
            return { error: `Usuario emisor: ${fromUserValidation.error}` };
        }

        const toUserValidation = await validateUser(transferData.id_to_user);
        if (!toUserValidation.isValid) {
            return { error: `Usuario receptor: ${toUserValidation.error}` };
        }

        //update: Validate organization exists
        const orgValidation = await validateOrganization(transferData.id_org);
        if (!orgValidation.isValid) {
            return { error: orgValidation.error };
        }

        //update: Check if from_user is actually a manager of this organization
        const fromUserParticipation = await participant_model.findOne({
            where: {
                id_user: transferData.id_from_user,
                id_org: transferData.id_org,
                org_managed: true
            }
        });

        if (!fromUserParticipation) {
            return { 
                error: "Solo los gestores de la organización pueden crear solicitudes de traspaso"
            };
        }

        //update: Check if trying to transfer to self
        if (transferData.id_from_user === transferData.id_to_user) {
            return { 
                error: "No puedes transferir una organización a ti mismo"
            };
        }

        //update: Check if there's already a pending transfer for this organization
        const existingPendingTransfer = await organization_transfer_request_model.findOne({
            where: {
                id_org: transferData.id_org,
                request_status: 'pending'
            }
        });

        if (existingPendingTransfer) {
            return { 
                error: "Ya existe una solicitud de traspaso pendiente para esta organización"
            };
        }

        //update: Create the transfer request
        const transferRequest = await organization_transfer_request_model.create({
            id_org: transferData.id_org,
            id_from_user: transferData.id_from_user,
            id_to_user: transferData.id_to_user,
            transfer_message: transferData.transfer_message || null,
            request_status: 'pending'
        });
        
        const requestWithDetails = {
            ...transferRequest.toJSON(),
            from_user: {
                id_user: fromUserValidation.user.id_user,
                name_user: fromUserValidation.user.name_user,
                email_user: fromUserValidation.user.email_user
            },
            to_user: {
                id_user: toUserValidation.user.id_user,
                name_user: toUserValidation.user.name_user,
                email_user: toUserValidation.user.email_user
            },
            organization: {
                id_organization: orgValidation.organization.id_organization,
                name_org: orgValidation.organization.name_org
            }
        };
        
        return { 
            success: "¡Solicitud de traspaso creada exitosamente!",
            data: requestWithDetails
        };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - create() - Error al crear solicitud de traspaso =", err);
        return { error: "Error al crear la solicitud de traspaso." };
    }
}

//update: Accept a transfer request
async function acceptTransfer(id_transfer_request, response_message = null) {
    try {
        if (!id_transfer_request) {
            return { error: "ID de solicitud de traspaso no válido" };
        }

        const transferRequest = await organization_transfer_request_model.findByPk(id_transfer_request);
        
        if (!transferRequest) {
            return { 
                error: "Solicitud de traspaso no encontrada"
            };
        }

        //update: Check if request is still pending
        if (transferRequest.request_status !== 'pending') {
            return { 
                error: `Esta solicitud ya ha sido ${transferRequest.request_status === 'accepted' ? 'aceptada' : 'rechazada'}`
            };
        }

        //update: Update the transfer request status
        transferRequest.request_status = 'accepted';
        transferRequest.response_message = response_message;
        await transferRequest.save();

        //update: Remove manager status from old manager
        const oldManagerParticipation = await participant_model.findOne({
            where: {
                id_user: transferRequest.id_from_user,
                id_org: transferRequest.id_org
            }
        });

        if (oldManagerParticipation) {
            await participantController.removeAsManager(oldManagerParticipation.id_participant);
        }

        //update: Check if new manager is already a participant
        let newManagerParticipation = await participant_model.findOne({
            where: {
                id_user: transferRequest.id_to_user,
                id_org: transferRequest.id_org
            }
        });

        if (newManagerParticipation) {
            //update: If already a participant, just set as manager
            await participantController.setAsManager(newManagerParticipation.id_participant);
        } else {
            //update: If not a participant, create participation with manager status
            await participantController.create({
                id_org: transferRequest.id_org,
                id_user: transferRequest.id_to_user,
                org_managed: true
            });
        }

        //update: Update user's is_manager flag if needed
        const newManager = await user_model.findByPk(transferRequest.id_to_user);
        if (newManager && !newManager.is_manager) {
            await newManager.update({ is_manager: true });
        }

        return { 
            success: "Traspaso de organización aceptado exitosamente",
            data: transferRequest
        };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - acceptTransfer() - Error = ", err);
        return { error: "Error al aceptar el traspaso" };
    }
}

//update: Reject a transfer request
async function rejectTransfer(id_transfer_request, response_message = null) {
    try {
        if (!id_transfer_request) {
            return { error: "ID de solicitud de traspaso no válido" };
        }

        const transferRequest = await organization_transfer_request_model.findByPk(id_transfer_request);
        
        if (!transferRequest) {
            return { 
                error: "Solicitud de traspaso no encontrada"
            };
        }

        //update: Check if request is still pending
        if (transferRequest.request_status !== 'pending') {
            return { 
                error: `Esta solicitud ya ha sido ${transferRequest.request_status === 'accepted' ? 'aceptada' : 'rechazada'}`
            };
        }

        //update: Update the transfer request status
        transferRequest.request_status = 'rejected';
        transferRequest.response_message = response_message;
        await transferRequest.save();

        return { 
            success: "Solicitud de traspaso rechazada",
            data: transferRequest
        };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - rejectTransfer() - Error = ", err);
        return { error: "Error al rechazar el traspaso" };
    }
}

//update: Cancel a transfer request (by sender)
async function cancelTransfer(id_transfer_request) {
    try {
        if (!id_transfer_request) {
            return { error: "ID de solicitud de traspaso no válido" };
        }

        const transferRequest = await organization_transfer_request_model.findByPk(id_transfer_request);
        
        if (!transferRequest) {
            return { 
                error: "Solicitud de traspaso no encontrada"
            };
        }

        //update: Check if request is still pending
        if (transferRequest.request_status !== 'pending') {
            return { 
                error: `No se puede cancelar una solicitud que ya ha sido ${transferRequest.request_status === 'accepted' ? 'aceptada' : 'rechazada'}`
            };
        }

        //update: Update the transfer request status
        transferRequest.request_status = 'cancelled';
        await transferRequest.save();

        return { 
            success: "Solicitud de traspaso cancelada",
            data: transferRequest
        };
    } catch (err) {
        console.error("-> organization_transfer_controller.js - cancelTransfer() - Error = ", err);
        return { error: "Error al cancelar el traspaso" };
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