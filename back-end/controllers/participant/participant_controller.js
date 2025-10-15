// back-end/controllers/participant/participant_controller.js
import participant_model from "../../models/participant_model.js";
import organization_model from "../../models/organization_model.js";
import user_model from "../../models/user_model.js";

//update: Validation helper functions
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

async function validateOrganization(id_org) {
    try {
        const organization = await organization_model.findOne({
            where: { id_organization: id_org }
        });
        
        if (!organization) {
            return {
                isValid: false,
                error: "La asociación no existe"
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
            error: "Error al validar la asociación"
        };
    }
}

async function getAll() {
    try {
        const participants = await participant_model.findAll();

        if (!participants || participants.length === 0) {
            return { error: "No hay participantes registrados" };
        }

        //update: Include user and organization information
        const participantsWithDetails = [];
        for (const participant of participants) {
            const user = await user_model.findByPk(participant.id_user);
            const organization = await organization_model.findByPk(participant.id_org);
            
            participantsWithDetails.push({
                ...participant.toJSON(),
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user,
                    type_user: user.type_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    scope_org: organization.scope_org
                } : null
            });
        }

        console.log("-> participant_controller.js - getAll() - participantes encontrados = ", participantsWithDetails.length);

        return { data: participantsWithDetails };
    } catch (err) {
        console.error("-> participant_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los participantes" };
    }
}

async function getByOrganizationId(id_org) {
    try {
        if (!id_org) {
            return { error: "El ID de la asociación es obligatorio" };
        }

        const orgValidation = await validateOrganization(id_org);
        if (!orgValidation.isValid) {
            return { error: orgValidation.error };
        }

        const participants = await participant_model.findAll({
            where: { id_org: id_org }
        });

        if (!participants || participants.length === 0) {
            return { error: "No hay participantes en esta asociación", data: [] };
        }

        //update: Include user information for each participant with org_managed field
        const participantsWithUsers = [];
        for (const participant of participants) {
            const user = await user_model.findByPk(participant.id_user);
            participantsWithUsers.push({
                ...participant.toJSON(),
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user,
                    type_user: user.type_user,
                    image_user: user.image_user
                } : null
            });
        }

        return { data: participantsWithUsers };
    } catch (err) {
        console.error("-> participant_controller.js - getByOrganizationId() - Error = ", err);
        return { error: "Error al obtener participantes por asociación" };
    }
}

async function getByUserId(id_user) {
    try {
        if (!id_user) {
            return { error: "El ID del usuario es obligatorio" };
        }

        const userValidation = await validateUser(id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        const participations = await participant_model.findAll({
            where: { id_user: id_user }
        });

        if (!participations || participations.length === 0) {
            return { error: "El usuario no participa en ninguna asociación", data: [] };
        }

        //update: Include organization information and org_managed field
        const participationsWithOrgs = [];
        for (const participation of participations) {
            const organization = await organization_model.findByPk(participation.id_org);
            participationsWithOrgs.push({
                ...participation.toJSON(),
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    scope_org: organization.scope_org,
                    image_org: organization.image_org
                } : null
            });
        }

        return { data: participationsWithOrgs };
    } catch (err) {
        console.error("-> participant_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener organizaciones del usuario" };
    }
}

async function create(participantData) {
    try {
        //update: Validate user exists
        const userValidation = await validateUser(participantData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        //update: Validate organization exists
        const orgValidation = await validateOrganization(participantData.id_org);
        if (!orgValidation.isValid) {
            return { error: orgValidation.error };
        }

        //update: Check if user is already a participant
        const existingParticipant = await participant_model.findOne({ 
            where: { 
                id_org: participantData.id_org,
                id_user: participantData.id_user
            } 
        });

        if (existingParticipant) {
            return { 
                error: "El usuario ya es participante de esta asociación"
            };
        }

        //update: Create the participant record with org_managed field
        const participant = await participant_model.create({
            ...participantData,
            org_managed: participantData.org_managed || false
        });
        
        const participantWithDetails = {
            ...participant.toJSON(),
            user: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user
            },
            organization: {
                id_organization: orgValidation.organization.id_organization,
                name_org: orgValidation.organization.name_org
            }
        };
        
        return { 
            success: "¡Participante agregado a la asociación!",
            data: participantWithDetails
        };
    } catch (err) {
        console.error("-> participant_controller.js - create() - Error al crear participante =", err);
        return { error: "Error al agregar participante." };
    }
}

//update: New function to set a participant as manager
async function setAsManager(id_participant) {
    try {
        if (!id_participant) {
            return { error: "ID de participante no válido" };
        }

        const participant = await participant_model.findByPk(id_participant);
        
        if (!participant) {
            return { 
                error: "Participante no encontrado"
            };
        }

        // Update org_managed field
        participant.org_managed = true;
        await participant.save();

        return { 
            success: "Participante establecido como gestor",
            data: participant
        };
    } catch (err) {
        console.error("-> participant_controller.js - setAsManager() - Error = ", err);
        return { error: "Error al establecer el gestor" };
    }
}

//update: New function to remove manager status
async function removeAsManager(id_participant) {
    try {
        if (!id_participant) {
            return { error: "ID de participante no válido" };
        }

        const participant = await participant_model.findByPk(id_participant);
        
        if (!participant) {
            return { 
                error: "Participante no encontrado"
            };
        }

        // Update org_managed field
        participant.org_managed = false;
        await participant.save();

        return { 
            success: "Estatus de gestor removido",
            data: participant
        };
    } catch (err) {
        console.error("-> participant_controller.js - removeAsManager() - Error = ", err);
        return { error: "Error al remover el estatus de gestor" };
    }
}

async function removeById(id_participant) {
    try {
        if (!id_participant) {
            return { error: "ID de participante no válido" };
        }

        const participant = await participant_model.findByPk(id_participant);
        
        if (!participant) {
            return { 
                error: "Participante no encontrado"
            };
        }

        //update: Check if participant is a manager
        if (participant.org_managed) {
            return {
                error: "No se puede eliminar a un gestor de la asociación. Primero debe removerse su estatus de gestor."
            };
        }

        await participant.destroy();

        return { 
            data: id_participant,
            message: "El participante se ha eliminado de la asociación." 
        };
    } catch (err) {
        console.error("-> participant_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el participante" };
    }
}

async function removeByUserAndOrg(id_user, id_org) {
    try {
        if (!id_user || !id_org) {
            return { error: "ID de usuario y asociación son obligatorios" };
        }

        const participant = await participant_model.findOne({
            where: {
                id_user: id_user,
                id_org: id_org
            }
        });
        
        if (!participant) {
            return { 
                error: "El usuario no es participante de esta asociación"
            };
        }

        //update: Check if trying to remove a manager
        if (participant.org_managed) {
            return {
                error: "No se puede eliminar a un gestor de la asociación. Primero debe removerse su estatus de gestor."
            };
        }

        await participant.destroy();

        return { 
            data: {
                id_user: id_user,
                id_org: id_org
            },
            message: "El participante se ha eliminado de la asociación." 
        };
    } catch (err) {
        console.error("-> participant_controller.js - removeByUserAndOrg() - Error = ", err);
        return { error: "Error al eliminar el participante" };
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