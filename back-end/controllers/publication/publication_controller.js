// back-end/controllers/publication/publication_controller.js
import publication_model from "../../models/publication_model.js";
import user_model from "../../models/user_model.js";
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

        //update: Include publisher information
        const pubsWithPublisher = [];
        for (const pub of publications) {
            const publisher = await user_model.findByPk(pub.id_user_pub);
            pubsWithPublisher.push({
                ...pub.toJSON(),
                publisher: publisher ? {
                    id_user: publisher.id_user,
                    name_user: publisher.name_user,
                    email_user: publisher.email_user,
                    image_user: publisher.image_user
                } : null
            });
        }

        console.log("-> publication_controller.js - getAll() - publicaciones encontradas = ", pubsWithPublisher.length);

        return { data: pubsWithPublisher };
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

        //update: Include publisher information
        const publisher = await user_model.findByPk(publication.id_user_pub);
        
        const pubWithPublisher = {
            ...publication.toJSON(),
            publisher: publisher ? {
                id_user: publisher.id_user,
                name_user: publisher.name_user,
                email_user: publisher.email_user,
                image_user: publisher.image_user
            } : null
        };

        return { data: pubWithPublisher };
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

        //update: Include publisher information
        const pubsWithPublisher = publications.map(pub => ({
            ...pub.toJSON(),
            publisher: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user,
                image_user: userValidation.user.image_user
            }
        }));

        return { data: pubsWithPublisher };
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

        //update: Include publisher information
        const pubsWithPublisher = [];
        for (const pub of publications) {
            const publisher = await user_model.findByPk(pub.id_user_pub);
            pubsWithPublisher.push({
                ...pub.toJSON(),
                publisher: publisher ? {
                    id_user: publisher.id_user,
                    name_user: publisher.name_user,
                    email_user: publisher.email_user,
                    image_user: publisher.image_user
                } : null
            });
        }

        return { data: pubsWithPublisher };
    } catch (err) {
        console.error("-> publication_controller.js - getByDateRange() - Error = ", err);
        return { error: "Error al obtener publicaciones por rango de fechas" };
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

        //update: Set current date and time if not provided
        if (!pubData.date_pub) {
            pubData.date_pub = new Date().toISOString().split('T')[0];
        }
        if (!pubData.time_pub) {
            pubData.time_pub = new Date().toTimeString().split(' ')[0];
        }

        //update: Create the publication
        const publication = await publication_model.create(pubData);
        
        const pubWithPublisher = {
            ...publication.toJSON(),
            publisher: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user,
                image_user: userValidation.user.image_user
            }
        };
        
        return { 
            success: "¡Publicación creada!",
            data: pubWithPublisher
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

        await publication.update(pubData);
        
        //update: Fetch updated publication with publisher information
        const updatedPub = await publication_model.findByPk(id);
        const publisher = await user_model.findByPk(updatedPub.id_user_pub);
        
        const pubWithPublisher = {
            ...updatedPub.toJSON(),
            publisher: publisher ? {
                id_user: publisher.id_user,
                name_user: publisher.name_user,
                email_user: publisher.email_user,
                image_user: publisher.image_user
            } : null
        };
        
        return { data: pubWithPublisher };
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

export { 
    getAll, 
    getById,
    getByUserId,
    getByDateRange,
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
    create, 
    update, 
    removeById,
    uploadImage
};