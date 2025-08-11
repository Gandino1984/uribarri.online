import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const calification_product_model = sequelize.define('calification_product', {
    id_calification: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    calification_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment_calification: {
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    tableName: 'calification_product',
    timestamps: false
});

export default calification_product_model;