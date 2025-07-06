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
    //update: renamed from active_type to verified_type
    verified_type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    //update: renamed from created_by to createdby_type and changed type to VARCHAR(20)
    createdby_type: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default type_model;