import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

// table for the use of provider type clients
const produce_model = sequelize.define("produce", {
    id_produce: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_provider: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default produce_model;