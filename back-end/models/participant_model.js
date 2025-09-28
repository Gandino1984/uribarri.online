// back-end/models/participant_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const participant_model = sequelize.define(
    "participant",
    {
        id_participant: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_org: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        id_user: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        org_managed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Indicates if the user is a manager of this organization'
        }
    },
    {
        tableName: "participant",
        timestamps: false
    }
);

export default participant_model;