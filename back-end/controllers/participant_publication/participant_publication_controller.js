// back-end/controllers/participant_publication/participant_publication_controller.js
import participant_publication_model from "../../models/participant_publication_model.js";
import participant_model from "../../models/participant_model.js";
import publication_model from "../../models/publication_model.js";
import user_model from "../../models/user_model.js";
import organization_model from "../../models/organization_model.js";

//update: Validation helper functions
async function validateParticipant(id_participant) {
    try {
        const participant = await participant_model.findOne({
            where: { id_participant: id_participant }
        });
        
        if (!participant) {
            return {
                isValid: false,
                error: "El participante no existe"
            };
        }
        
        return {
            isValid: true,
            participant: participant
        };
    } catch (err) {
        console.error("Error validating participant:", err);
        return {
            isValid: false,
            error: "Error al validar el participante"
        };
    }
}

async function validatePublication(id_publication) {
    try {
        const publication = await publication_model.findOne({
            where: { id_publication: id_publication }
        });
        
        if (!publication) {
            return {
                isValid: false,
                error: "La publicación no existe"
            };
        }
        
        return {
            isValid: true,
            publication: publication
        };
    } catch (err) {
        console.error("Error validating publication:", err);
        return {
            isValid: false,
            error: "Error al validar la publicación"
        };
    }
}

async function getAll() {
    try {
        const participantPublications = await participant_publication_model.findAll();

        if (!participantPublications || participantPublications.length === 0) {
            return { error: "No hay relaciones participante-publicación registradas" };
        }

        //update: Include full participant and publication information
        const ppWithDetails = [];
        for (const pp of participantPublications) {
            const participant = await participant_model.findByPk(pp.id_participant);
            const publication = await publication_model.findByPk(pp.id_publication);
            
            let user = null;
            let organization = null;
            
            if (participant) {
                user = await user_model.findByPk(participant.id_user);
                organization = await organization_model.findByPk(participant.id_org);
            }
            
            ppWithDetails.push({
                ...pp.toJSON(),
                participant: participant ? {
                    id_participant: participant.id_participant,
                    id_user: participant.id_user,
                    id_org: participant.id_org,
                    org_managed: participant.org_managed
                } : null,
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org
                } : null,
                publication: publication ? {
                    id_publication: publication.id_publication,
                    title_pub: publication.title_pub,
                    date_pub: publication.date_pub,
                    publication_active: publication.publication_active
                } : null
            });
        }

        console.log("-> participant_publication_controller.js - getAll() - relaciones encontradas = ", ppWithDetails.length);

        return { data: ppWithDetails };
    } catch (err) {
        console.error("-> participant_publication_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las relaciones participante-publicación" };
    }
}

async function getByParticipantId(id_participant) {
    try {
        if (!id_participant) {
            return { error: "El ID del participante es obligatorio" };
        }

        const participantValidation = await validateParticipant(id_participant);
        if (!participantValidation.isValid) {
            return { error: participantValidation.error };
        }

        const participantPublications = await participant_publication_model.findAll({
            where: { id_participant: id_participant }
        });

        if (!participantPublications || participantPublications.length === 0) {
            return { error: "No hay publicaciones de este participante", data: [] };
        }

        //update: Include publication details
        const ppWithDetails = [];
        for (const pp of participantPublications) {
            const publication = await publication_model.findByPk(pp.id_publication);
            
            ppWithDetails.push({
                ...pp.toJSON(),
                publication: publication ? {
                    id_publication: publication.id_publication,
                    title_pub: publication.title_pub,
                    content_pub: publication.content_pub,
                    date_pub: publication.date_pub,
                    time_pub: publication.time_pub,
                    image_pub: publication.image_pub,
                    pub_approved: publication.pub_approved,
                    publication_active: publication.publication_active
                } : null
            });
        }

        return { data: ppWithDetails };
    } catch (err) {
        console.error("-> participant_publication_controller.js - getByParticipantId() - Error = ", err);
        return { error: "Error al obtener publicaciones por participante" };
    }
}

async function getByPublicationId(id_publication) {
    try {
        if (!id_publication) {
            return { error: "El ID de la publicación es obligatorio" };
        }

        const publicationValidation = await validatePublication(id_publication);
        if (!publicationValidation.isValid) {
            return { error: publicationValidation.error };
        }

        const participantPublication = await participant_publication_model.findOne({
            where: { id_publication: id_publication }
        });

        if (!participantPublication) {
            return { error: "No se encontró información del participante para esta publicación", data: null };
        }

        //update: Include participant, user and organization details
        const participant = await participant_model.findByPk(participantPublication.id_participant);
        let user = null;
        let organization = null;
        
        if (participant) {
            user = await user_model.findByPk(participant.id_user);
            organization = await organization_model.findByPk(participant.id_org);
        }
        
        const ppWithDetails = {
            ...participantPublication.toJSON(),
            participant: participant ? {
                id_participant: participant.id_participant,
                id_user: participant.id_user,
                id_org: participant.id_org,
                org_managed: participant.org_managed
            } : null,
            user: user ? {
                id_user: user.id_user,
                name_user: user.name_user,
                email_user: user.email_user,
                image_user: user.image_user
            } : null,
            organization: organization ? {
                id_organization: organization.id_organization,
                name_org: organization.name_org,
                image_org: organization.image_org
            } : null
        };

        return { data: ppWithDetails };
    } catch (err) {
        console.error("-> participant_publication_controller.js - getByPublicationId() - Error = ", err);
        return { error: "Error al obtener información del participante por publicación" };
    }
}

async function getByOrganizationId(id_org) {
    try {
        if (!id_org) {
            return { error: "El ID de la asociación es obligatorio" };
        }

        //update: First get all participants of the organization
        const participants = await participant_model.findAll({
            where: { id_org: id_org }
        });

        if (!participants || participants.length === 0) {
            return { error: "No hay participantes en esta asociación", data: [] };
        }

        const participantIds = participants.map(p => p.id_participant);

        //update: Get all participant_publications for these participants
        const participantPublications = await participant_publication_model.findAll({
            where: {
                id_participant: participantIds
            }
        });

        if (!participantPublications || participantPublications.length === 0) {
            return { error: "No hay publicaciones de participantes en esta asociación", data: [] };
        }

        //update: Include full details
        const ppWithDetails = [];
        for (const pp of participantPublications) {
            const participant = participants.find(p => p.id_participant === pp.id_participant);
            const publication = await publication_model.findByPk(pp.id_publication);
            const user = await user_model.findByPk(participant.id_user);
            
            ppWithDetails.push({
                ...pp.toJSON(),
                participant: {
                    id_participant: participant.id_participant,
                    id_user: participant.id_user,
                    id_org: participant.id_org,
                    org_managed: participant.org_managed
                },
                user: user ? {
                    id_user: user.id_user,
                    name_user: user.name_user,
                    email_user: user.email_user
                } : null,
                publication: publication ? {
                    id_publication: publication.id_publication,
                    title_pub: publication.title_pub,
                    content_pub: publication.content_pub,
                    date_pub: publication.date_pub,
                    publication_active: publication.publication_active
                } : null
            });
        }

        return { data: ppWithDetails };
    } catch (err) {
        console.error("-> participant_publication_controller.js - getByOrganizationId() - Error = ", err);
        return { error: "Error al obtener publicaciones por asociación" };
    }
}

async function create(ppData) {
    try {
        //update: Validate participant exists
        const participantValidation = await validateParticipant(ppData.id_participant);
        if (!participantValidation.isValid) {
            return { error: participantValidation.error };
        }

        //update: Validate publication exists
        const publicationValidation = await validatePublication(ppData.id_publication);
        if (!publicationValidation.isValid) {
            return { error: publicationValidation.error };
        }

        //update: Check if relation already exists
        const existingRelation = await participant_publication_model.findOne({ 
            where: { 
                id_participant: ppData.id_participant,
                id_publication: ppData.id_publication
            } 
        });

        if (existingRelation) {
            return { 
                error: "La relación participante-publicación ya existe"
            };
        }

        //update: Create the participant_publication record
        const participantPublication = await participant_publication_model.create(ppData);
        
        //update: Get full details for response
        const participant = participantValidation.participant;
        const publication = publicationValidation.publication;
        const user = await user_model.findByPk(participant.id_user);
        const organization = await organization_model.findByPk(participant.id_org);
        
        const ppWithDetails = {
            ...participantPublication.toJSON(),
            participant: {
                id_participant: participant.id_participant,
                id_user: participant.id_user,
                id_org: participant.id_org,
                org_managed: participant.org_managed
            },
            user: user ? {
                id_user: user.id_user,
                name_user: user.name_user,
                email_user: user.email_user
            } : null,
            organization: organization ? {
                id_organization: organization.id_organization,
                name_org: organization.name_org
            } : null,
            publication: {
                id_publication: publication.id_publication,
                title_pub: publication.title_pub
            }
        };
        
        return { 
            success: "¡Relación participante-publicación creada!",
            data: ppWithDetails
        };
    } catch (err) {
        console.error("-> participant_publication_controller.js - create() - Error al crear relación =", err);
        return { error: "Error al crear la relación participante-publicación." };
    }
}

async function removeById(id_participant_publication) {
    try {
        if (!id_participant_publication) {
            return { error: "ID de relación no válido" };
        }

        const participantPublication = await participant_publication_model.findByPk(id_participant_publication);
        
        if (!participantPublication) {
            return { 
                error: "Relación participante-publicación no encontrada"
            };
        }

        await participantPublication.destroy();

        return { 
            data: id_participant_publication,
            message: "La relación participante-publicación se ha eliminado." 
        };
    } catch (err) {
        console.error("-> participant_publication_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la relación" };
    }
}

async function removeByParticipantAndPublication(id_participant, id_publication) {
    try {
        if (!id_participant || !id_publication) {
            return { error: "ID de participante y publicación son obligatorios" };
        }

        const participantPublication = await participant_publication_model.findOne({
            where: {
                id_participant: id_participant,
                id_publication: id_publication
            }
        });
        
        if (!participantPublication) {
            return { 
                error: "Relación participante-publicación no encontrada"
            };
        }

        await participantPublication.destroy();

        return { 
            data: {
                id_participant: id_participant,
                id_publication: id_publication
            },
            message: "La relación participante-publicación se ha eliminado." 
        };
    } catch (err) {
        console.error("-> participant_publication_controller.js - removeByParticipantAndPublication() - Error = ", err);
        return { error: "Error al eliminar la relación" };
    }
}

// Export all functions
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