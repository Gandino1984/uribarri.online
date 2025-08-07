import { DataTypes } from 'sequelize';
import db from '../config/sequelize.js';

const product_subcategory_model = db.define('product_subcategory', {
    id_subcategory: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name_subcategory: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    verified_subcategory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdby_subcategory: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'product_subcategory',
    timestamps: false,
});

export default product_subcategory_model;