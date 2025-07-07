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
    verified_type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdby_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default type_model;