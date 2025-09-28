// back-end/controllers/social_event/social_event_controller.js
import social_event_model from "../../models/social_event_model.js";
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

function validateEventData(eventData) {
    const errors = [];
    
    if (!eventData.title_soc_ev) {
        errors.push("El título es obligatorio");
    } else if (eventData.title_soc_ev.length > 150) {
        errors.push("El título no puede exceder 150 caracteres");
    }
    
    if (!eventData.initial_date_soc_ev) {
        errors.push("La fecha inicial es obligatoria");
    }
    
    if (!eventData.final_date_soc_ev) {
        errors.push("La fecha final es obligatoria");
    }
    
    if (!eventData.start_time_soc_ev) {
        errors.push("La hora de inicio es obligatoria");
    }
    
    if (!eventData.end_time_soc_ev) {
        errors.push("La hora de fin es obligatoria");
    }
    
    if (!eventData.id_user_creator) {
        errors.push("El usuario creador es obligatorio");
    }
    
    //update: Validate date logic
    if (eventData.initial_date_soc_ev && eventData.final_date_soc_ev) {
        const initialDate = new Date(eventData.initial_date_soc_ev);
        const finalDate = new Date(eventData.final_date_soc_ev);
        
        if (finalDate < initialDate) {
            errors.push("La fecha final no puede ser anterior a la fecha inicial");
        }
    }
    
    //update: Validate time logic if same day
    if (eventData.initial_date_soc_ev === eventData.final_date_soc_ev && 
        eventData.start_time_soc_ev && eventData.end_time_soc_ev) {
        if (eventData.end_time_soc_ev <= eventData.start_time_soc_ev) {
            errors.push("La hora de fin debe ser posterior a la hora de inicio");
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

async function getAll() {
    try {
        const events = await social_event_model.findAll({
            order: [['initial_date_soc_ev', 'DESC'], ['start_time_soc_ev', 'DESC']]
        });

        if (!events || events.length === 0) {
            return { error: "No hay eventos registrados" };
        }

        //update: Include creator information
        const eventsWithCreator = [];
        for (const event of events) {
            const creator = await user_model.findByPk(event.id_user_creator);
            eventsWithCreator.push({
                ...event.toJSON(),
                creator: creator ? {
                    id_user: creator.id_user,
                    name_user: creator.name_user,
                    email_user: creator.email_user,
                    image_user: creator.image_user
                } : null
            });
        }

        console.log("-> social_event_controller.js - getAll() - eventos encontrados = ", eventsWithCreator.length);

        return { data: eventsWithCreator };
    } catch (err) {
        console.error("-> social_event_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todos los eventos" };
    }
}

async function getById(id_social_event) {
    try {
        const event = await social_event_model.findByPk(id_social_event);

        if (!event) {
            return { error: "Evento no encontrado" };
        }

        //update: Include creator information
        const creator = await user_model.findByPk(event.id_user_creator);
        
        const eventWithCreator = {
            ...event.toJSON(),
            creator: creator ? {
                id_user: creator.id_user,
                name_user: creator.name_user,
                email_user: creator.email_user,
                image_user: creator.image_user
            } : null
        };

        return { data: eventWithCreator };
    } catch (err) {
        console.error("-> social_event_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener el evento" };
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

        const events = await social_event_model.findAll({
            where: { id_user_creator: id_user },
            order: [['initial_date_soc_ev', 'DESC'], ['start_time_soc_ev', 'DESC']]
        });

        if (!events || events.length === 0) {
            return { error: "No hay eventos creados por este usuario", data: [] };
        }

        //update: Include creator information
        const eventsWithCreator = events.map(event => ({
            ...event.toJSON(),
            creator: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user,
                image_user: userValidation.user.image_user
            }
        }));

        return { data: eventsWithCreator };
    } catch (err) {
        console.error("-> social_event_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener eventos por usuario" };
    }
}

async function getUpcoming() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const events = await social_event_model.findAll({
            where: {
                initial_date_soc_ev: {
                    [Op.gte]: today
                }
            },
            order: [['initial_date_soc_ev', 'ASC'], ['start_time_soc_ev', 'ASC']]
        });

        if (!events || events.length === 0) {
            return { error: "No hay eventos próximos", data: [] };
        }

        //update: Include creator information
        const eventsWithCreator = [];
        for (const event of events) {
            const creator = await user_model.findByPk(event.id_user_creator);
            eventsWithCreator.push({
                ...event.toJSON(),
                creator: creator ? {
                    id_user: creator.id_user,
                    name_user: creator.name_user,
                    email_user: creator.email_user,
                    image_user: creator.image_user
                } : null
            });
        }

        return { data: eventsWithCreator };
    } catch (err) {
        console.error("-> social_event_controller.js - getUpcoming() - Error = ", err);
        return { error: "Error al obtener eventos próximos" };
    }
}

async function getByDateRange(startDate, endDate) {
    try {
        if (!startDate || !endDate) {
            return { error: "Las fechas de inicio y fin son obligatorias" };
        }

        const events = await social_event_model.findAll({
            where: {
                [Op.or]: [
                    {
                        initial_date_soc_ev: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        final_date_soc_ev: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        [Op.and]: [
                            {
                                initial_date_soc_ev: {
                                    [Op.lte]: startDate
                                }
                            },
                            {
                                final_date_soc_ev: {
                                    [Op.gte]: endDate
                                }
                            }
                        ]
                    }
                ]
            },
            order: [['initial_date_soc_ev', 'ASC'], ['start_time_soc_ev', 'ASC']]
        });

        if (!events || events.length === 0) {
            return { error: "No hay eventos en este rango de fechas", data: [] };
        }

        //update: Include creator information
        const eventsWithCreator = [];
        for (const event of events) {
            const creator = await user_model.findByPk(event.id_user_creator);
            eventsWithCreator.push({
                ...event.toJSON(),
                creator: creator ? {
                    id_user: creator.id_user,
                    name_user: creator.name_user,
                    email_user: creator.email_user,
                    image_user: creator.image_user
                } : null
            });
        }

        return { data: eventsWithCreator };
    } catch (err) {
        console.error("-> social_event_controller.js - getByDateRange() - Error = ", err);
        return { error: "Error al obtener eventos por rango de fechas" };
    }
}

async function create(eventData) {
    try {
        //update: Validate event data
        const validation = validateEventData(eventData);
        if (!validation.isValid) {
            return { 
                error: "Validación fallida",
                details: validation.errors 
            };
        }

        //update: Validate creator exists
        const userValidation = await validateUser(eventData.id_user_creator);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        //update: Set creation date if not provided
        if (!eventData.creation_date_soc_ev) {
            eventData.creation_date_soc_ev = new Date().toISOString().split('T')[0];
        }

        //update: Create the event
        const event = await social_event_model.create(eventData);
        
        const eventWithCreator = {
            ...event.toJSON(),
            creator: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user,
                image_user: userValidation.user.image_user
            }
        };
        
        return { 
            success: "¡Evento creado!",
            data: eventWithCreator
        };
    } catch (err) {
        console.error("-> social_event_controller.js - create() - Error al crear el evento =", err);
        return { error: "Error al crear el evento." };
    }
}

async function update(id, eventData) {
    try {
        const event = await social_event_model.findByPk(id);
        
        if (!event) {
            console.log("Evento no encontrado con id:", id);
            return { error: "Evento no encontrado" };
        }

        //update: Validate event data if being updated
        const validation = validateEventData({ ...event.toJSON(), ...eventData });
        if (!validation.isValid) {
            return { 
                error: "Validación fallida",
                details: validation.errors 
            };
        }

        //update: If changing creator, validate new creator exists
        if (eventData.id_user_creator !== undefined && eventData.id_user_creator !== event.id_user_creator) {
            const userValidation = await validateUser(eventData.id_user_creator);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
        }

        await event.update(eventData);
        
        //update: Fetch updated event with creator information
        const updatedEvent = await social_event_model.findByPk(id);
        const creator = await user_model.findByPk(updatedEvent.id_user_creator);
        
        const eventWithCreator = {
            ...updatedEvent.toJSON(),
            creator: creator ? {
                id_user: creator.id_user,
                name_user: creator.name_user,
                email_user: creator.email_user,
                image_user: creator.image_user
            } : null
        };
        
        return { data: eventWithCreator };
    } catch (err) {
        console.error("Error al actualizar el evento =", err);
        return { error: "Error al actualizar el evento" };
    }
}

async function removeById(id_social_event) {
    try {
        if (!id_social_event) {
            return { error: "Evento no encontrado" };
        }

        const event = await social_event_model.findByPk(id_social_event);
        
        if (!event) {
            return { 
                error: "Evento no encontrado"
            };
        }

        //update: Delete event image if exists
        if (event.image_soc_ev) {
            const imagePath = path.join(__dirname, '..', '..', '..', 'public', event.image_soc_ev);
            
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Imagen del evento eliminada: ${event.image_soc_ev}`);
                } catch (err) {
                    console.error("Error al eliminar la imagen del evento:", err);
                }
            }
        }

        await event.destroy();

        return { 
            data: id_social_event,
            message: "El evento se ha eliminado." 
        };
    } catch (err) {
        console.error("-> social_event_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar el evento" };
    }
}

async function uploadImage(id_social_event, imagePath) {
    try {
        const event = await social_event_model.findByPk(id_social_event);
        
        if (!event) {
            return { error: "Evento no encontrado" };
        }

        await event.update({ image_soc_ev: imagePath });
        
        return { 
            data: { 
                id_social_event: id_social_event,
                image_soc_ev: imagePath 
            },
            message: "Imagen actualizada correctamente" 
        };
    } catch (err) {
        console.error("Error al actualizar imagen del evento =", err);
        return { error: "Error al actualizar la imagen" };
    }
}

export { 
    getAll, 
    getById,
    getByUserId,
    getUpcoming,
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
    getUpcoming,
    getByDateRange,
    create, 
    update, 
    removeById,
    uploadImage
};