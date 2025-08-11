import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const user_model = sequelize.define("user", {
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_user: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    pass_user: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    location_user: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    type_user: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    image_user: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    calification_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
    },
    contributor_user: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    //update: Added age_user field with default value of 18
    age_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default user_model;