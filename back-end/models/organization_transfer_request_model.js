// back-end/models/organization_transfer_request_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const organization_transfer_request_model = sequelize.define(
    "organization_transfer_request",
    {
        id_transfer_request: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_org: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'Organization being transferred'
        },
        id_from_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'Current manager sending the transfer'
        },
        id_to_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: 'User receiving the transfer request'
        },
        transfer_message: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Optional message explaining the transfer'
        },
        request_status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },
        response_message: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Response from the receiving user'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "organization_transfer_request",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default organization_transfer_request_model;