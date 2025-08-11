import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const product_category_model = sequelize.define('product_category', {
    id_category: {
        //update: Changed from INTEGER to INTEGER.UNSIGNED to match database schema
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    name_category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    createdby_category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    verified_category: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'product_category',
    timestamps: false
});

export default product_category_model;