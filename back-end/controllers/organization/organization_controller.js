// back-end/controllers/organization/organization_controller.js
import organization_model from "../../models/organization_model.js";
import participant_model from "../../models/participant_model.js";
import publication_model from "../../models/publication_model.js";
import user_model from "../../models/user_model.js";
import sequelize from "../../config/sequelize.js";
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

//update: New function to check if user is admin
async function isUserAdmin(id_user) {
    try {
        const user = await user_model.findByPk(id_user);
        return user && user.level_user === 'admin';
    } catch (err) {
        console.error("Error checking admin status:", err);
        return false;
    }
}

//update: Modified getAll to include approval filter option
async function getAll(includeUnapproved = false, requestingUserId = null) {
    try {
        //update: Check if requesting user is admin
        const isAdmin = requestingUserId ? await isUserAdmin(requestingUserId) : false;
        
        //update: Apply filter based on admin status
        const whereClause = (includeUnapproved || isAdmin) ? {} : { org_approved: true };
        
        const organizations = await organization_model.findAll({
            where: whereClause
        });

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

//update: New function to get only unapproved organizations (for admin)
async function getUnapproved() {
    try {
        const organizations = await organization_model.findAll({
            where: { org_approved: false }
        });

        if (!organizations || organizations.length === 0) {
            return { 
                data: [],
                message: "No hay organizaciones pendientes de aprobación" 
            };
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

        return { data: orgsWithManagers };
    } catch (err) {
        console.error("-> organization_controller.js - getUnapproved() - Error = ", err);
        return { error: "Error al obtener organizaciones no aprobadas" };
    }
}

async function getById(id_organization) {
    try {
        const organization = await organization_model.findByPk(id_organization);

        if (!organization) {
            return { error: "asociación no encontrada" };
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
        return { error: "Error al obtener la asociación" };
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

        //update: Get organizations where user is participant (only approved ones for non-admins)
        const isAdmin = await isUserAdmin(id_user);
        const participations = await participant_model.findAll({
            where: { id_user: id_user }
        });

        const participatingOrgIds = participations.map(p => p.id_org);
        
        //update: Filter by approval status if not admin
        const whereClause = isAdmin 
            ? { id_organization: participatingOrgIds }
            : { id_organization: participatingOrgIds, org_approved: true };
            
        const participatingOrgs = await organization_model.findAll({
            where: whereClause
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

//update: Fixed create function with proper transaction handling
async function create(orgData) {
    // Start a transaction
    const t = await sequelize.transaction();
    
    try {
        //update: Check if organization already exists by name
        const existingOrg = await organization_model.findOne({ 
            where: { name_org: orgData.name_org },
            transaction: t
        });

        if (existingOrg) {
            await t.rollback();
            console.error("Ya existe una asociación con ese nombre");
            return { 
                error: "Ya existe una asociación con ese nombre"
            };
        }

        //update: Validate manager exists
        const userValidation = await validateUser(orgData.id_user);
        if (!userValidation.isValid) {
            await t.rollback();
            return { error: userValidation.error };
        }

        //update: Set org_approved to false by default
        const organizationData = {
            ...orgData,
            org_approved: false
        };

        //update: Create the organization with transaction
        const organization = await organization_model.create(organizationData, { transaction: t });
        
        console.log(`-> organization_controller.js - Organization created with ID: ${organization.id_organization}`);
        
        //update: Automatically add the creator as a participant AND manager
        await participant_model.create({
            id_org: organization.id_organization,
            id_user: orgData.id_user,
            org_managed: true
        }, { transaction: t });
        
        console.log(`-> organization_controller.js - User ${orgData.id_user} set as manager for organization ${organization.id_organization}`);
        
        // Commit the transaction
        await t.commit();
        
        // Fetch the created organization to verify it was saved
        const savedOrg = await organization_model.findByPk(organization.id_organization);
        
        if (!savedOrg) {
            console.error("Organization was not properly saved to database");
            return { error: "Error al guardar la asociación en la base de datos" };
        }
        
        const orgWithManager = {
            ...savedOrg.toJSON(),
            manager: {
                id_user: userValidation.user.id_user,
                name_user: userValidation.user.name_user,
                email_user: userValidation.user.email_user
            }
        };
        
        console.log(`-> organization_controller.js - Successfully created and verified organization: ${savedOrg.name_org}`);
        
        return { 
            success: "¡asociación creada! Pendiente de aprobación por el administrador.",
            data: orgWithManager
        };
    } catch (err) {
        // Rollback the transaction in case of error
        await t.rollback();
        console.error("-> organization_controller.js - create() - Error al crear la asociación =", err);
        return { error: "Error al crear la asociación: " + err.message };
    }
}

async function update(id, orgData) {
    const t = await sequelize.transaction();
    
    try {
        const organization = await organization_model.findByPk(id, { transaction: t });
        
        if (!organization) {
            await t.rollback();
            console.log("asociación no encontrada con id:", id);
            return { error: "asociación no encontrada" };
        }

        //update: If changing manager, validate new manager exists
        if (orgData.id_user !== undefined && orgData.id_user !== organization.id_user) {
            const userValidation = await validateUser(orgData.id_user);
            if (!userValidation.isValid) {
                await t.rollback();
                return { error: userValidation.error };
            }
            
            //update: Remove manager status from old manager
            const oldManagerParticipant = await participant_model.findOne({
                where: {
                    id_org: id,
                    id_user: organization.id_user
                },
                transaction: t
            });
            
            if (oldManagerParticipant) {
                await oldManagerParticipant.update({ org_managed: false }, { transaction: t });
            }
            
            //update: Add new manager as participant with manager status if not already
            const existingParticipation = await participant_model.findOne({
                where: {
                    id_org: id,
                    id_user: orgData.id_user
                },
                transaction: t
            });
            
            if (!existingParticipation) {
                await participant_model.create({
                    id_org: id,
                    id_user: orgData.id_user,
                    org_managed: true
                }, { transaction: t });
            } else {
                //update: Update existing participant to be manager
                await existingParticipation.update({ org_managed: true }, { transaction: t });
            }
        }

        //update: Check if name is being changed and if it's already taken
        if (orgData.name_org && orgData.name_org !== organization.name_org) {
            const existingOrg = await organization_model.findOne({ 
                where: { name_org: orgData.name_org },
                transaction: t
            });
            
            if (existingOrg) {
                await t.rollback();
                return { error: "Ya existe otra asociación con ese nombre" };
            }
        }

        await organization.update(orgData, { transaction: t });
        
        // Commit the transaction
        await t.commit();
        
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
        await t.rollback();
        console.error("Error al actualizar la asociación =", err);
        return { error: "Error al actualizar la asociación" };
    }
}

//update: New function to approve/reject organization
async function setApprovalStatus(id_organization, approved, adminUserId) {
    try {
        //update: Verify admin permissions
        const isAdmin = await isUserAdmin(adminUserId);
        if (!isAdmin) {
            return { error: "No tienes permisos para aprobar organizaciones" };
        }

        const organization = await organization_model.findByPk(id_organization);
        
        if (!organization) {
            return { error: "asociación no encontrada" };
        }

        await organization.update({ org_approved: approved });
        
        //update: Get updated organization with manager info
        const manager = await user_model.findByPk(organization.id_user);
        
        const orgWithManager = {
            ...organization.toJSON(),
            manager: manager ? {
                id_user: manager.id_user,
                name_user: manager.name_user,
                email_user: manager.email_user
            } : null
        };
        
        return { 
            data: orgWithManager,
            message: approved 
                ? "asociación aprobada exitosamente" 
                : "asociación rechazada"
        };
    } catch (err) {
        console.error("-> organization_controller.js - setApprovalStatus() - Error = ", err);
        return { error: "Error al cambiar el estado de aprobación" };
    }
}

async function removeById(id_organization) {
    const t = await sequelize.transaction();
    
    try {
        if (!id_organization) {
            await t.rollback();
            return { error: "asociación no encontrada" };
        }

        const organization = await organization_model.findByPk(id_organization, { transaction: t });
        
        if (!organization) {
            await t.rollback();
            return { 
                error: "asociación no encontrada"
            };
        }

        //update: Check if organization has participants (besides the manager)
        const participantsCount = await participant_model.count({
            where: { id_org: id_organization },
            transaction: t
        });
        
        if (participantsCount > 1) { // More than just the manager
            await t.rollback();
            return { 
                error: `No se puede eliminar la asociación porque tiene ${participantsCount} participante(s)`
            };
        }

        //update: Delete all participant records for this organization
        await participant_model.destroy({
            where: { id_org: id_organization },
            transaction: t
        });

        //update: Delete all publications for this organization (including images)
        const publications = await publication_model.findAll({
            where: { id_org: id_organization },
            transaction: t
        });

        let deletedPublications = 0;
        if (publications && publications.length > 0) {
            // Delete publication images first
            for (const publication of publications) {
                if (publication.image_pub) {
                    const backendDir = path.resolve(__dirname, '..', '..');
                    const imagePath = path.join(backendDir, publication.image_pub);
                    try {
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                            console.log(`Imagen de publicación eliminada: ${publication.image_pub}`);
                        }
                    } catch (err) {
                        console.error('Error al eliminar imagen de publicación:', err);
                    }
                }
            }

            // Delete all publications
            deletedPublications = await publication_model.destroy({
                where: { id_org: id_organization },
                transaction: t
            });

            console.log(`${deletedPublications} publicación(es) eliminadas de la asociación ${organization.name_org}`);
        }

        //update: Delete organization folder if exists - NOW using backend assets path
        const orgPath = path.join(__dirname, '..', '..', 'assets', 'images', 'organizations', organization.name_org);

        if (fs.existsSync(orgPath)) {
            try {
                fs.rmSync(orgPath, { recursive: true, force: true });
                console.log(`Carpeta de la asociación ${organization.name_org} eliminada`);
            } catch (err) {
                console.error("Error al eliminar la carpeta de la asociación:", err);
            }
        }

        await organization.destroy({ transaction: t });

        // Commit the transaction
        await t.commit();

        return {
            data: id_organization,
            message: deletedPublications > 0
                ? `La asociación y ${deletedPublications} publicación(es) se han eliminado.`
                : "La asociación se ha eliminado.",
            deletedPublications: deletedPublications
        };
    } catch (err) {
        await t.rollback();
        console.error("-> organization_controller.js - removeById() - Error = ", err);
        return { error: "Error al eliminar la asociación" };
    }
}

async function uploadImage(id_organization, imagePath) {
    try {
        const organization = await organization_model.findByPk(id_organization);
        
        if (!organization) {
            return { error: "asociación no encontrada" };
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
        console.error("Error al actualizar imagen de la asociación =", err);
        return { error: "Error al actualizar la imagen" };
    }
}

export { 
    getAll, 
    getById,
    getByUserId,
    getUnapproved,
    create, 
    update, 
    setApprovalStatus,
    removeById,
    uploadImage
};

export default { 
    getAll, 
    getById,
    getByUserId,
    getUnapproved,
    create, 
    update, 
    setApprovalStatus,
    removeById,
    uploadImage
};