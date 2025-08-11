import { DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

const product_model = db.define('product', {
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name_product: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price_product: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    discount_product: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    season_product: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    calification_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    id_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    id_subcategory: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    sold_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    info_product: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    image_product: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    second_hand: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    expiration_product: {
        type: DataTypes.DATE,
        allowNull: true
    },
    surplus_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    country_product: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    locality_product: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    active_product: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    creation_product: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'product',
    timestamps: false
});

export default product_model;