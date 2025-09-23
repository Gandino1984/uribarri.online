import publication_model from "../../models/publication_model.js";
import user_model from "../../models/user_model.js";
import organization_model from "../../models/organization_model.js";
import { Op } from "sequelize";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function validatePublicationData(pubData) {
    const errors = [];
    
    if (!pubData.title_pub) {
        errors.push("El título es obligatorio");
    } else if (pubData.title_pub.length > 150) {
        errors.push("El título no puede exceder 150 caracteres");
    }
    
    if (!pubData.content_pub) {
        errors.push("El contenido es obligatorio");
    }
    
    if (!pubData.id_user_pub) {
        errors.push("El usuario publicador es obligatorio");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

async function getAll() {
    try {
        const publications = await publication_model.findAll({
            order: [['date_pub', 'DESC'], ['time_pub', 'DESC']]
        });

        if (!publications || publications.length === 0) {
            return { error: "No hay publicaciones registradas" };
        }

        //update: Include publisher and organization information
        const pubsWithDetails = [];
        for (const pub of publications) {
            const publisher = await user_model.findByPk(pub.id_user_pub);
            let organization = null;
            
            if (pub.id_org) {
                organization = await organization_model.findByPk(pub.id_org);
            }
            
            pubsWithDetails.push({
                ...pub.toJSON(),
                publisher: publisher ? {
                    id_user: publisher.id_user,
                    name_user: publisher.name_user,
                    email_user: publisher.email_user,
                    image_user: publisher.image_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    image_org: organization.image_org
                } : null
            });
        }

        console.log("-> publication_controller.js - getAll() - publicaciones encontradas = ", pubsWithDetails.length);

        return { data: pubsWithDetails };
    } catch (err) {
        console.error("-> publication_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las publicaciones" };
    }
}

async function getById(id_publication) {
    try {
        const publication = await publication_model.findByPk(id_publication);

        if (!publication) {
            return { error: "Publicación no encontrada" };
        }

        //update: Include publisher and organization information
        const publisher = await user_model.findByPk(publication.id_user_pub);
        let organization = null;
        
        if (publication.id_org) {
            organization = await organization_model.findByPk(publication.id_org);
        }
        
        const pubWithDetails = {
            ...publication.toJSON(),
            publisher: publisher ? {
                id_user: publisher.id_user,
                name_user: publisher.name_user,
                email_user: publisher.email_user,
                image_user: publisher.image_user
            } : null,
            organization: organization ? {
                id_organization: organization.id_organization,
                name_org: organization.name_org,
                image_org: organization.image_org
            } : null
        };

        return { data: pubWithDetails };
    } catch (err) {
        console.error("-> publication_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la publicación" };
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

        const publications = await publication_model.findAll({
            where: { id_user_pub: id_user },
            order: [['date_pub', 'DESC'], ['time_pub', 'DESC']]
        });

        if (!publications || publications.length === 0) {
            return { error: "No hay publicaciones de este usuario", data: [] };
        }

        //update: Include organization information
        const pubsWithDetails = [];
        for (const pub of publications) {
            let organization = null;
            
            if (pub.id_org) {
                organization = await organization_model.findByPk(pub.id_org);
            }
            
            pubsWithDetails.push({
                ...pub.toJSON(),
                publisher: {
                    id_user: userValidation.user.id_user,
                    name_user: userValidation.user.name_user,
                    email_user: userValidation.user.email_user,
                    image_user: userValidation.user.image_user
                },
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    image_org: organization.image_org
                } : null
            });
        }

        return { data: pubsWithDetails };
    } catch (err) {
        console.error("-> publication_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener publicaciones por usuario" };
    }
}

async function getByDateRange(startDate, endDate) {
    try {
        if (!startDate || !endDate) {
            return { error: "Las fechas de inicio y fin son obligatorias" };
        }

        const publications = await publication_model.findAll({
            where: {
                date_pub: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date_pub', 'DESC'], ['time_pub', 'DESC']]
        });

        if (!publications || publications.length === 0) {
            return { error: "No hay publicaciones en este rango de fechas", data: [] };
        }

        //update: Include publisher and organization information
        const pubsWithDetails = [];
        for (const pub of publications) {
            const publisher = await user_model.findByPk(pub.id_user_pub);
            let organization = null;
            
            if (pub.id_org) {
                organization = await organization_model.findByPk(pub.id_org);
            }
            
            pubsWithDetails.push({
                ...pub.toJSON(),
                publisher: publisher ? {
                    id_user: publisher.id_user,
                    name_user: publisher.name_user,
                    email_user: publisher.email_user,
                    image_user: publisher.image_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    image_org: organization.image_org
                } : null
            });
        }

        return { data: pubsWithDetails };
    } catch (err) {
        console.error("-> publication_controller.js - getByDateRange() - Error = ", err);
        return { error: "Error al obtener publicaciones por rango de fechas" };
    }
}

//update: Add getByOrganizationId function
async function getByOrganizationId(id_org) {
    try {
        if (!id_org) {
            return { error: "El ID de la organización es obligatorio" };
        }

        const publications = await publication_model.findAll({
            where: { id_org: id_org },
            order: [['date_pub', 'DESC'], ['time_pub', 'DESC']]
        });

        if (!publications || publications.length === 0) {
            return { data: [], message: "No hay publicaciones de esta organización" };
        }

        //update: Include publisher and organization information
        const pubsWithDetails = [];
        const organization = await organization_model.findByPk(id_org);
        
        for (const pub of publications) {
            const publisher = await user_model.findByPk(pub.id_user_pub);
            
            pubsWithDetails.push({
                ...pub.toJSON(),
                publisher: publisher ? {
                    id_user: publisher.id_user,
                    name_user: publisher.name_user,
                    email_user: publisher.email_user,
                    image_user: publisher.image_user
                } : null,
                organization: organization ? {
                    id_organization: organization.id_organization,
                    name_org: organization.name_org,
                    image_org: organization.image_org
                } : null
            });
        }

        return { data: pubsWithDetails };
    } catch (err) {
        console.error("-> publication_controller.js - getByOrganizationId() - Error = ", err);
        return { error: "Error al obtener publicaciones por organización" };
    }
}

async function create(pubData) {
    try {
        //update: Validate publication data
        const validation = validatePublicationData(pubData);
        if (!validation.isValid) {
            return { 
                error: "Validación fallida",
                details: validation.errors 
            };
        }

        //update: Validate publisher exists
        const userValidation = await validateUser(pubData.id_user_pub);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        //update: Validate organization if provided
        if (pubData.id_org) {
            const organization = await organization_model.findByPk(pubData.id_org);
            if (!organization) {
                return { error: "La organización especificada no existe" };
            }
        }

        //update: Set current date and time if not provided
        if (!pubData.date_pub) {
            pubData.date_pub = new Date().toISOString().split('T')[0];
        }
        if (!pubData.time_pub) {
            pubData.time_pub = new Date().toTimeString().split(' ')[0];
        }

        //update: Create the publication
        const publication = await publication_model.create(pubData);
        
        let organization = null;
        if (publication.id_org) {
            organization = await organization_model.findByPk(publication.id_org);
        }
        
        const pubWithDetails = {
            ...publication.toJSON(),
            publisher: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user,
                image_user: userValidation.user.image_user
            },
            organization: organization ? {
                id_organization: organization.id_organization,
                name_org: organization.name_org,
                image_org: organization.image_org
            } : null
        };
        
        return { 
            success: "¡Publicación creada!",
            data: pubWithDetails
        };
    } catch (err) {
        console.error("-> publication_controller.js - create() - Error al crear la publicación =", err);
        return { error: "Error al crear la publicación." };
    }
}

async function update(id, pubData) {
    try {
        const publication = await publication_model.findByPk(id);
        
        if (!publication) {
            console.log("Publicación no encontrada con id:", id);
            return { error: "Publicación no encontrada" };
        }

        //update: Validate if title is being updated
        if (pubData.title_pub && pubData.title_pub.length > 150) {
            return { error: "El título no puede exceder 150 caracteres" };
        }

        //update: If changing publisher, validate new publisher exists
        if (pubData.id_user_pub !== undefined && pubData.id_user_pub !== publication.id_user_pub) {
            const userValidation = await validateUser(pubData.id_user_pub);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        //update: If changing organization, validate it exists
        if (pubData.id_org !== undefined && pubData.id_org !== publication.id_org) {
            if (pubData.id_org) {
                const organization = await organization_model.findByPk(pubData.id_org);
                if (!organization) {
                    return { error: "La organización especificada no existe" };
                }
            }
        }

        await publication.update(pubData);
        
        //update: Fetch updated publication with publisher and organization information
        const updatedPub = await publication_model.findByPk(id);
        const publisher = await user_model.findByPk(updatedPub.id_user_pub);
        let organization = null;
        
        if (updatedPub.id_org) {
            organization = await organization_model.findByPk(updatedPub.id_org);
        }
        
        const pubWithDetails = {
            ...updatedPub.toJSON(),
            publisher: publisher ? {
                id_user: publisher.id_user,
                name_user: publisher.name_user,
                email_user: publisher.email_user,
                image_user: publisher.image_user
            } : null,
            organization: organization ? {
                id_organization: organization.id_organization,
                name_org: organization.name_org,
                image_org: organization.image_org
            } : null
        };
        
        return { data: pubWithDetails };
    } catch (err) {
        console.error("Error al actualizar la publicación =", err);
        return { error: "Error al actualizar la publicación" };
    }
}

async function removeById(id_publication) {
    try {
        if (!id_publication) {
            return { error: "Publicación no encontrada" };
        }

        const publication = await publication_model.findByPk(id_publication);
        
        if (!publication) {
            return { 
                error: "Publicación no encontrada"
            };
        }

        //update: Delete publication image if exists
        if (publication.image_pub) {
            const imagePath = path.join(__dirname, '..', '..', '..', 'public', publication.image_pub);
            
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Imagen de la publicación eliminada: ${publication.image_pub}`);
                } catch (err) {
                    console.error("Error al eliminar la imagen de la publicación:", err);
                }
            }
        }

        await publication.destroy();

        return { 
            data: id_publication,
            message: "La publicación se ha eliminado." 
        };
    } catch (err) {
        console.error("-> publication_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la publicación" };
    }
}

async function uploadImage(id_publication, imagePath) {
    try {
        const publication = await publication_model.findByPk(id_publication);
        
        if (!publication) {
            return { error: "Publicación no encontrada" };
        }

        await publication.update({ image_pub: imagePath });
        
        return { 
            data: { 
                id_publication: id_publication,
                image_pub: imagePath 
            },
            message: "Imagen actualizada correctamente" 
        };
    } catch (err) {
        console.error("Error al actualizar imagen de la publicación =", err);
        return { error: "Error al actualizar la imagen" };
    }
}

// Export all functions
export { 
    getAll, 
    getById,
    getByUserId,
    getByDateRange,
    getByOrganizationId, //update: Add new function
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
    getByOrganizationId, //update: Add new function
    create, 
    update, 
    removeById,
    uploadImage
};