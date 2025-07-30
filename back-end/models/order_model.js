import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const order_model = sequelize.define("order", {
    id_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_order_products: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    id_order_packages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    order_status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    delivery_type: {
        type: DataTypes.ENUM('pickup', 'delivery'),
        allowNull: false,
        defaultValue: 'pickup'
    },
    delivery_address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    order_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
});

export default order_model;