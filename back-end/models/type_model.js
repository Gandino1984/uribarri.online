import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const type_model = sequelize.define("type", {
    id_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    order_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    active_type: {
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
    freezeTableName: true
});

export default type_model;