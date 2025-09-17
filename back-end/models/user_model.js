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
    email_user: {
        type: DataTypes.STRING(255),
        allowNull: false,
        //update: Removed unique constraint to allow same email for different user types
        // unique: true - REMOVED
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
    age_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
    //update: Added composite unique constraint for email_user + type_user
    indexes: [
        {
            unique: true,
            fields: ['email_user', 'type_user'],
            name: 'unique_email_type'
        }
    ]
});

export default user_model;