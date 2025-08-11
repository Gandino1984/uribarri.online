import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const type_category_model = sequelize.define('type_category', {
    id_type_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    id_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'type_category',
    timestamps: false
});

export default type_category_model;