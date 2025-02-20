import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";



const provider_model = sequelize.define("provider", {
    id_provider: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_provider: { 
        type: DataTypes.STRING(100),
        allowNull: false
    },
    location_provider: { 
        type: DataTypes.STRING(100),
        allowNull: false
    },
    pass_provider: { 
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, {
    timestamps: false,
    freezeTableName: true
});

export default provider_model