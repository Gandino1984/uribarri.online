// back-end/models/organization_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const organization_model = sequelize.define(
    "organization",
    {
        id_organization: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        name_org: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        scope_org: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        image_org: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        org_approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "organization",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default organization_model;