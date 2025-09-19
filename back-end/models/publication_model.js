// back-end/models/publication_model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const publication_model = sequelize.define(
    "publication",
    {
        id_publication: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title_pub: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        content_pub: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date_pub: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        time_pub: {
            type: DataTypes.TIME,
            allowNull: false
        },
        id_user_pub: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        image_pub: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "publication",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default publication_model;
