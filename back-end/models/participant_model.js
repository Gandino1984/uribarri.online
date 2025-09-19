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
        joined_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "participant",
        timestamps: false
    }
);

export default participant_model;