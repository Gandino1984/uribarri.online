//update: back-end/controllers/publication/publication_controller.js
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

async function getByOrganizationId(id_org) {
    try {
        if (!id_org) {
            return { error: "El ID de la asociación es obligatorio" };
        }

        const publications = await publication_model.findAll({
            where: { id_org: id_org },
            order: [['date_pub', 'DESC'], ['time_pub', 'DESC']]
        });

        if (!publications || publications.length === 0) {
            return { data: [], message: "No hay publicaciones de esta asociación" };
        }

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
        return { error: "Error al obtener publicaciones por asociación" };
    }
}

//update: Set pub_approved to false by default for new publications
async function create(pubData) {
    try {
        const validation = validatePublicationData(pubData);
        if (!validation.isValid) {
            return { 
                error: "Validación fallida",
                details: validation.errors 
            };
        }

        const userValidation = await validateUser(pubData.id_user_pub);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        if (pubData.id_org) {
            const organization = await organization_model.findByPk(pubData.id_org);
            if (!organization) {
                return { error: "La asociación especificada no existe" };
            }
        }

        if (!pubData.date_pub) {
            pubData.date_pub = new Date().toISOString().split('T')[0];
        }
        if (!pubData.time_pub) {
            pubData.time_pub = new Date().toTimeString().split(' ')[0];
        }

        //update: CRITICAL FIX - Set pub_approved to false by default so publications need manager approval
        const publication = await publication_model.create({
            ...pubData,
            publication_active: pubData.publication_active !== undefined ? pubData.publication_active : true,
            pub_approved: pubData.pub_approved !== undefined ? pubData.pub_approved : false
        });
        
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
        
        console.log('-> publication_controller.js - create() - Publication created with pub_approved:', publication.pub_approved);
        
        return { 
            success: "¡Publicación creada! Pendiente de aprobación del gestor de la asociación.",
            data: pubWithDetails
        };
    } catch (err) {
        console.error("-> publication_controller.js - create() - Error al crear la publicación =", err);
        return { error: "Error al crear la publicación." };
    }
}

async function update(id_publication, pubData) {
    try {
        const publication = await publication_model.findByPk(id_publication);
        
        if (!publication) {
            console.log("Publicación no encontrada con id:", id_publication);
            return { error: "Publicación no encontrada" };
        }

        if (pubData.title_pub && pubData.title_pub.length > 150) {
            return { error: "El título no puede exceder 150 caracteres" };
        }

        if (pubData.id_user_pub !== undefined && pubData.id_user_pub !== publication.id_user_pub) {
            const userValidation = await validateUser(pubData.id_user_pub);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        if (pubData.id_org !== undefined && pubData.id_org !== publication.id_org) {
            if (pubData.id_org) {
                const organization = await organization_model.findByPk(pubData.id_org);
                if (!organization) {
                    return { error: "La asociación especificada no existe" };
                }
            }
        }

        await publication.update(pubData);
        
        const updatedPub = await publication_model.findByPk(id_publication);
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

//update: Updated to handle new assets/images path structure
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

        //update: Handle image deletion from new location
        if (publication.image_pub) {
            const backendDir = path.resolve(__dirname, '..', '..');
            const imagePath = path.join(backendDir, publication.image_pub);
            
            console.log('Attempting to delete publication image:', imagePath);
            
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`✔ Imagen de la publicación eliminada: ${publication.image_pub}`);
                } catch (err) {
                    console.error("Error al eliminar la imagen de la publicación:", err);
                }
            } else {
                console.log('Image file not found at:', imagePath);
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

        //update: Delete old image file if it exists
        if (publication.image_pub) {
            const fs = await import('fs');
            const path = await import('path');
            const oldImagePath = path.join(process.cwd(), publication.image_pub);

            try {
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('Old publication image deleted:', oldImagePath);
                }
            } catch (deleteErr) {
                console.error('Error deleting old publication image:', deleteErr);
                // Continue even if deletion fails
            }
        }

        console.log('Updating publication image path:', {
            id_publication,
            imagePath
        });

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

//update: New function to remove publication image
async function removeImage(id_publication) {
    try {
        const publication = await publication_model.findByPk(id_publication);

        if (!publication) {
            return { error: "Publicación no encontrada" };
        }

        //update: Delete image file if it exists
        if (publication.image_pub) {
            const fs = await import('fs');
            const path = await import('path');
            const imagePath = path.join(process.cwd(), publication.image_pub);

            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Publication image deleted:', imagePath);
                }
            } catch (deleteErr) {
                console.error('Error deleting publication image file:', deleteErr);
                return { error: "Error al eliminar el archivo de imagen" };
            }
        }

        //update: Clear image_pub field in database
        await publication.update({ image_pub: null });

        return {
            data: {
                id_publication: id_publication,
                image_pub: null
            },
            message: "Imagen eliminada correctamente"
        };
    } catch (err) {
        console.error("Error al eliminar imagen de la publicación =", err);
        return { error: "Error al eliminar la imagen" };
    }
}

async function approvePublication(id_publication, pub_approved) {
    try {
        const publication = await publication_model.findByPk(id_publication);
        
        if (!publication) {
            console.log("Publicación no encontrada con id:", id_publication);
            return { error: "Publicación no encontrada" };
        }

        await publication.update({ 
            pub_approved: pub_approved
        });
        
        const updatedPub = await publication_model.findByPk(id_publication);
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
        
        console.log(`-> publication_controller.js - approvePublication() - Publicación ${pub_approved ? 'aprobada' : 'rechazada'} con id: ${id_publication}`);
        
        return { 
            data: pubWithDetails,
            message: pub_approved ? "Publicación aprobada exitosamente" : "Publicación rechazada"
        };
    } catch (err) {
        console.error("-> publication_controller.js - approvePublication() - Error =", err);
        return { error: "Error al aprobar/rechazar la publicación" };
    }
}

async function toggleActive(id_publication, publication_active) {
    try {
        const publication = await publication_model.findByPk(id_publication);
        
        if (!publication) {
            console.log("Publicación no encontrada con id:", id_publication);
            return { error: "Publicación no encontrada" };
        }

        await publication.update({ 
            publication_active: publication_active
        });
        
        const updatedPub = await publication_model.findByPk(id_publication);
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
        
        console.log(`-> publication_controller.js - toggleActive() - Publicación ${publication_active ? 'activada' : 'desactivada'} con id: ${id_publication}`);
        
        return { 
            data: pubWithDetails,
            message: publication_active ? "Publicación activada exitosamente" : "Publicación desactivada"
        };
    } catch (err) {
        console.error("-> publication_controller.js - toggleActive() - Error =", err);
        return { error: "Error al activar/desactivar la publicación" };
    }
}

export {
    getAll,
    getById,
    getByUserId,
    getByDateRange,
    getByOrganizationId,
    create,
    update,
    removeById,
    uploadImage,
    removeImage, //update: Added removeImage export
    approvePublication,
    toggleActive
};

export default {
    getAll,
    getById,
    getByUserId,
    getByDateRange,
    getByOrganizationId,
    create,
    update,
    removeById,
    uploadImage,
    removeImage, //update: Added removeImage export
    approvePublication,
    toggleActive
};