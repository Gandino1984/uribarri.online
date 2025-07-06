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
    //update: renamed from active_subtype to verified_subtype
    verified_subtype: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    //update: renamed from created_by to createdby_subtype and changed type to VARCHAR(20)
    createdby_subtype: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

export default subtype_model;