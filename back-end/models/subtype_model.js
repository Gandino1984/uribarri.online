import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const subtype_model = sequelize.define("subtype", {
    id_subtype: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_subtype: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    id_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    order_subtype: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    active_subtype: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    creation_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

export default subtype_model;