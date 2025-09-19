// back-end/controllers/organization/organization_controller.js
import organization_model from "../../models/organization_model.js";
import participant_model from "../../models/participant_model.js";
import user_model from "../../models/user_model.js";
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

async function getAll() {
    try {
        const organizations = await organization_model.findAll();

        if (!organizations || organizations.length === 0) {
            return { error: "No hay organizaciones registradas" };
        }

        //update: Include manager information
        const orgsWithManagers = [];
        for (const org of organizations) {
            const manager = await user_model.findByPk(org.id_user);
            orgsWithManagers.push({
                ...org.toJSON(),
                manager: manager ? {
                    id_user: manager.id_user,
                    name_user: manager.name_user,
                    email_user: manager.email_user
                } : null
            });
        }

        console.log("-> organization_controller.js - getAll() - organizaciones encontradas = ", orgsWithManagers.length);

        return { data: orgsWithManagers };
    } catch (err) {
        console.error("-> organization_controller.js - getAll() - Error = ", err);
        return { error: "Error al obtener todas las organizaciones" };
    }
}

async function getById(id_organization) {
    try {
        const organization = await organization_model.findByPk(id_organization);

        if (!organization) {
            return { error: "Organización no encontrada" };
        }

        //update: Include manager information
        const manager = await user_model.findByPk(organization.id_user);
        
        //update: Get participants count
        const participantsCount = await participant_model.count({
            where: { id_org: id_organization }
        });
        
        const orgWithDetails = {
            ...organization.toJSON(),
            manager: manager ? {
                id_user: manager.id_user,
                name_user: manager.name_user,
                email_user: manager.email_user
            } : null,
            participants_count: participantsCount
        };

        return { data: orgWithDetails };
    } catch (err) {
        console.error("-> organization_controller.js - getById() - Error = ", err);
        return { error: "Error al obtener la organización" };
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

        //update: Get organizations where user is manager
        const managedOrgs = await organization_model.findAll({
            where: { id_user: id_user }
        });

        //update: Get organizations where user is participant
        const participations = await participant_model.findAll({
            where: { id_user: id_user }
        });

        const participatingOrgIds = participations.map(p => p.id_org);
        const participatingOrgs = await organization_model.findAll({
            where: { id_organization: participatingOrgIds }
        });

        return { 
            data: {
                managed: managedOrgs,
                participating: participatingOrgs
            }
        };
    } catch (err) {
        console.error("-> organization_controller.js - getByUserId() - Error = ", err);
        return { error: "Error al obtener organizaciones por usuario" };
    }
}

async function create(orgData) {
    try {
        //update: Check if organization already exists by name
        const existingOrg = await organization_model.findOne({ 
            where: { name_org: orgData.name_org } 
        });

        if (existingOrg) {
            console.error("Ya existe una organización con ese nombre");
            return { 
                error: "Ya existe una organización con ese nombre"
            };
        }

        //update: Validate manager exists
        const userValidation = await validateUser(orgData.id_user);
        if (!userValidation.isValid) {
            return { error: userValidation.error };
        }

        //update: Create the organization
        const organization = await organization_model.create(orgData);
        
        //update: Automatically add the manager as a participant
        await participant_model.create({
            id_org: organization.id_organization,
            id_user: orgData.id_user
        });
        
        const orgWithManager = {
            ...organization.toJSON(),
            manager: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user
            }
        };
        
        return { 
            success: "¡Organización creada!",
            data: orgWithManager
        };
    } catch (err) {
        console.error("-> organization_controller.js - create() - Error al crear la organización =", err);
        return { error: "Error al crear la organización." };
    }
}

async function update(id, orgData) {
    try {
        const organization = await organization_model.findByPk(id);
        
        if (!organization) {
            console.log("Organización no encontrada con id:", id);
            return { error: "Organización no encontrada" };
        }

        //update: If changing manager, validate new manager exists
        if (orgData.id_user !== undefined && orgData.id_user !== organization.id_user) {
            const userValidation = await validateUser(orgData.id_user);
            if (!userValidation.isValid) {
                return { error: userValidation.error };
            }
            
            //update: Add new manager as participant if not already
            const existingParticipation = await participant_model.findOne({
                where: {
                    id_org: id,
                    id_user: orgData.id_user
                }
            });
            
            if (!existingParticipation) {
                await participant_model.create({
                    id_org: id,
                    id_user: orgData.id_user
                });
            }
        }

        //update: Check if name is being changed and if it's already taken
        if (orgData.name_org && orgData.name_org !== organization.name_org) {
            const existingOrg = await organization_model.findOne({ 
                where: { name_org: orgData.name_org } 
            });
            
            if (existingOrg) {
                return { error: "Ya existe otra organización con ese nombre" };
            }
        }

        await organization.update(orgData);
        
        //update: Fetch updated organization with manager information
        const updatedOrg = await organization_model.findByPk(id);
        const manager = await user_model.findByPk(updatedOrg.id_user);
        
        const orgWithManager = {
            ...updatedOrg.toJSON(),
            manager: manager ? {
                id_user: manager.id_user,
                name_user: manager.name_user,
                email_user: manager.email_user
            } : null
        };
        
        return { data: orgWithManager };
    } catch (err) {
        console.error("Error al actualizar la organización =", err);
        return { error: "Error al actualizar la organización" };
    }
}

async function removeById(id_organization) {
    try {
        if (!id_organization) {
            return { error: "Organización no encontrada" };
        }

        const organization = await organization_model.findByPk(id_organization);
        
        if (!organization) {
            return { 
                error: "Organización no encontrada"
            };
        }

        //update: Check if organization has participants (besides the manager)
        const participantsCount = await participant_model.count({
            where: { id_org: id_organization }
        });
        
        if (participantsCount > 1) { // More than just the manager
            return { 
                error: `No se puede eliminar la organización porque tiene ${participantsCount} participante(s)`
            };
        }

        //update: Delete all participant records for this organization
        await participant_model.destroy({
            where: { id_org: id_organization }
        });

        //update: Delete organization folder if exists
        const orgPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'uploads', 'organizations', organization.name_org);
        
        if (fs.existsSync(orgPath)) {
            try {
                fs.rmSync(orgPath, { recursive: true, force: true });
                console.log(`Carpeta de la organización ${organization.name_org} eliminada`);
            } catch (err) {
                console.error("Error al eliminar la carpeta de la organización:", err);
            }
        }

        await organization.destroy();

        return { 
            data: id_organization,
            message: "La organización se ha eliminado." 
        };
    } catch (err) {
        console.error("-> organization_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la organización" };
    }
}

async function uploadImage(id_organization, imagePath) {
    try {
        const organization = await organization_model.findByPk(id_organization);
        
        if (!organization) {
            return { error: "Organización no encontrada" };
        }

        await organization.update({ image_org: imagePath });
        
        return { 
            data: { 
                id_organization: id_organization,
                image_org: imagePath 
            },
            message: "Imagen actualizada correctamente" 
        };
    } catch (err) {
        console.error("Error al actualizar imagen de la organización =", err);
        return { error: "Error al actualizar la imagen" };
    }
}

export { 
    getAll, 
    getById,
    getByUserId,
    create, 
    update, 
    removeById,
    uploadImage
};

export default { 
    getAll, 
    getById,
    getByUserId,
    create, 
    update, 
    removeById,
    uploadImage
};