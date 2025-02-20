import provider_model from "../../models/provider_model.js";

async function getAll() {
    try {
        const providers = await provider_model.findAll();
        console.log("Retrieved providers:", providers);
        return { data: providers };
    } catch (error) {
        console.error("Error in getAll:", error);
        return { error: error.message };
    }
}

async function getById(id) {
    try {
        const provider = await provider_model.findByPk(id);
        console.log("Retrieved provider:", provider);
        
        if (!provider) {
            console.log("provider not found with id:", id);
            return { error: "provider not found" };
        }
        
        return { data: provider };
    } catch (error) {
        console.error("Error in getById:", error);
        return { error: error.message };
    }
}

async function create(providerData) {
    try {
        const provider = await provider_model.create(providerData);
        console.log("Created provider:", provider);
        return { data: provider };
    } catch (error) {
        console.error("Error in create:", error);
        return { error: error.message };
    }
}   

async function update(id, providerData) {
    try {
        const { name_provider, location_provider, pass_provider } = providerData;
        
        const provider = await provider_model.findByPk(id);
        if (!provider) {
            console.log("provider not found with id:", id);
            return { error: "provider not found" };
        }

        // Only update fields that were provided
        if (name_provider) provider.name_provider = name_provider;
        if (location_provider) provider.location_provider = location_provider;
        if (pass_provider) provider.pass_provider = pass_provider;
    
        await provider.save();
        console.log("Updated provider:", provider);
        return { data: provider };
    } catch (error) {
        console.error("Error in update:", error);
        return { error: error.message };
    }
}

async function removeById(id) {
    try {
        const provider = await provider_model.findByPk(id);
        if (!provider) {
            console.log("provider not found with id:", id);
            return { error: "provider not found" };
        }

        await provider_model.destroy({
            where: { id_provider: id }
        });
        
        console.log("Deleted provider with id:", id);
        return { data: { message: "provider successfully deleted", id } };
    } catch (error) {
        console.error("Error in removeById:", error);
        return { error: error.message };
    }
}

export { getAll, getById, create, update, removeById }

export default { getAll, getById, create, update, removeById }