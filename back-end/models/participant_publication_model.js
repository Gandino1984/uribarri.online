// back-end/models/participant_publication_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const participant_publication_model = sequelize.define(
    "participant_publication",
    {
        id_participant_publication: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        id_participant: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        id_publication: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    },
    {
        tableName: "participant_publication",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default participant_publication_model;