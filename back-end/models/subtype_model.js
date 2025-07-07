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
    verified_subtype: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdby_subtype: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

export default subtype_model;