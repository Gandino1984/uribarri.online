import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const order_package_model = sequelize.define("order_package", {
    id_order_package: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_package: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    package_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default order_package_model;