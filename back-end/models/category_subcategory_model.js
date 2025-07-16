import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const category_subcategory_model = sequelize.define('category_subcategory', {
    id_category_subcategory: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    id_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_subcategory: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'category_subcategory',
    timestamps: false
});

export default category_subcategory_model;