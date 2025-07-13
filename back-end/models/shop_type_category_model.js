import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const shop_type_category_model = sequelize.define('shop_type_category', {
    id_shop_type_category: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
    tableName: 'shop_type_category',
    timestamps: false
});

export default shop_type_category_model;