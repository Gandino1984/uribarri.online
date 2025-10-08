// back-end/controllers/organization/organization_api_controller.js
import organizationController from "./organization_controller.js";
import path from 'path';

async function getAll(req, res) {
    try {
        const requestingUserId = req.headers['x-user-id'] || req.query.user_id;
        const includeUnapproved = req.query.include_unapproved === 'true';
        
        const { error, data } = await organizationController.getAll(includeUnapproved, requestingUserId);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_api_controller.js - getAll() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener todas las organizaciones",
            details: err.message
        });
    }
}

async function getUnapproved(req, res) {
    try {
        const { error, data, message } = await organizationController.getUnapproved();
        res.json({ error, data, message });
    } catch (err) {
        console.error("-> organization_api_controller.js - getUnapproved() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener organizaciones no aprobadas",
            details: err.message
        });
    }
}

async function getById(req, res) {
    try {
        const { id_organization } = req.body;
        
        if (!id_organization) {
            return res.status(400).json({ 
                error: 'El ID de la organización es obligatorio' 
            });
        }
        
        const { error, data } = await organizationController.getById(id_organization);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_api_controller.js - getById() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener la organización",
            details: err.message
        });
    }
}

async function getByUserId(req, res) {
    try {
        const { id_user } = req.body;
        
        if (!id_user) {
            return res.status(400).json({ 
                error: 'El ID del usuario es obligatorio' 
            });
        }
        
        const { error, data } = await organizationController.getByUserId(id_user);
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_api_controller.js - getByUserId() - Error =", err);
        res.status(500).json({ 
            error: "Error al obtener organizaciones del usuario",
            details: err.message
        });
    }
}

async function create(req, res) {
    try {
        const { 
            id_user,
            name_org,
            scope_org,
            image_org
        } = req.body;
        
        if (!id_user || !name_org) {
            return res.status(400).json({
                error: 'Campos obligatorios son requeridos',
                missingFields: {
                    id_user: !id_user,
                    name_org: !name_org
                }
            });
        }
        
        const { error, data, success } = await organizationController.create({
            id_user,
            name_org,
            scope_org,
            image_org: image_org || null
        });
        
        res.json({ error, data, success });
    } catch (err) {
        console.error("-> organization_api_controller.js - create() - Error =", err);
        res.status(500).json({
            error: "Error al crear la organización",
            details: err.message
        });
    }
}

async function update(req, res) {
    try {
        const {
                id_organization,
                id_user,
                name_org,
                scope_org,
                image_org,
                org_approved
        } = req.body;
        
        if (!id_organization) {
            return res.status(400).json({
                error: 'El ID de la organización es obligatorio'
            });
        }
        
        const updateData = {};
        if (id_organization !== undefined) updateData.id_organization = id_organization;
        if (id_user !== undefined) updateData.id_user = id_user;
        if (name_org !== undefined) updateData.name_org = name_org;
        if (scope_org !== undefined) updateData.scope_org = scope_org;
        if (image_org !== undefined) updateData.image_org = image_org;
        if (org_approved !== undefined) updateData.org_approved = org_approved;
        
        const { error, data } = await organizationController.update(id_organization, updateData);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ error, data });
    } catch (err) {
        console.error("-> organization_api_controller.js - update() - Error =", err);
        res.status(500).json({
            error: "Error al actualizar la organización",
            details: err.message
        });
    }
}

async function approve(req, res) {
    try {
        const { 
            id_organization, 
            approved,
            admin_user_id 
        } = req.body;
        
        if (!id_organization) {
            return res.status(400).json({
                error: 'El ID de la organización es obligatorio'
            });
        }
        
        if (approved === undefined) {
            return res.status(400).json({
                error: 'El estado de aprobación es obligatorio'
            });
        }
        
        if (!admin_user_id) {
            return res.status(400).json({
                error: 'El ID del administrador es obligatorio'
            });
        }
        
        const { error, data, message } = await organizationController.setApprovalStatus(
            id_organization, 
            approved,
            admin_user_id
        );
        
        if (error) {
            return res.status(403).json({ error });
        }
        
        res.json({ error, data, message });
    } catch (err) {
        console.error("-> organization_api_controller.js - approve() - Error =", err);
        res.status(500).json({
            error: "Error al cambiar estado de aprobación",
            details: err.message
        });
    }
}

async function removeById(req, res) {
    try {
        const id_organization = req.params.id_organization;
        
        if (!id_organization) {
            return res.status(400).json({ 
                error: 'El ID de la organización es obligatorio'
            });
        }
        
        const { error, data, message } = await organizationController.removeById(id_organization);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        res.json({ data, message, error });
    } catch (err) {
        console.error("-> organization_api_controller.js - removeById() - Error =", err);
        res.status(500).json({ 
            error: "Error al eliminar la organización",
            details: err.message 
        });
    }
}

//update: Updated uploadImage function to work with the new middleware
async function uploadImage(req, res) {
    try {
        const id_organization = req.headers['x-organization-id'];
        
        if (!id_organization) {
            return res.status(400).json({
                error: 'Organization ID is required'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }
        
        // Get the organization to construct the proper path
        const organization = await organizationController.getById(id_organization);
        if (organization.error) {
            return res.status(404).json({
                error: 'Organization not found'
            });
        }
        
        const organizationName = organization.data.name_org;
        
        // Construct the relative path for storing in the database
        const relativePath = path.join(
            'images', 
            'uploads', 
            'organizations',
            organizationName,
            req.file.filename
        ).replace(/\\/g, '/');
        
        const { error, data } = await organizationController.uploadImage(id_organization, relativePath);
        
        if (error) {
            return res.status(500).json({ error });
        }
        
        res.json({ error: null, data });
    } catch (err) {
        console.error('Error uploading organization image:', err);
        res.status(500).json({
            error: 'Error uploading organization image',
            details: err.message
        });
    }
}

export {
    getAll,
    getById,
    getByUserId,
    getUnapproved,
    create,
    update,
    approve,
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
    approve,
    removeById,
    uploadImage
};