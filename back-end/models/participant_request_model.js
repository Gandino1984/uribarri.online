// back-end/models/participant_request_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const participant_request_model = sequelize.define(
    "participant_request",
    {
        id_request: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        id_org: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        request_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        },
        request_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        response_message: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "participant_request",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default participant_request_model;