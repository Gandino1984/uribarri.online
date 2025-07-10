import { DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

const product_category_model = db.define('product_category', {
    id_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name_category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    verified_category: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdby_category: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'product_category',
    timestamps: false
});

export default product_category_model;