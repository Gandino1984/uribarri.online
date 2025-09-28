// back-end/models/social_event_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const social_event_model_ = sequelize.define(
    "social_event",
    {
        id_social_event: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title_soc_ev: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        creation_date_soc_ev: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        initial_date_soc_ev: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        final_date_soc_ev: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        start_time_soc_ev: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time_soc_ev: {
            type: DataTypes.TIME,
            allowNull: false
        },
        image_soc_ev: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        id_user_creator: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        location_soc_ev: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description_soc_ev: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "social_event",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default social_event_model_;