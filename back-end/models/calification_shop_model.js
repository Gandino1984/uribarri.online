import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const calification_shop_model = sequelize.define('calification_shop', {
    id_calification: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_user: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    calification_shop: {
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
    tableName: 'calification_shop',
    timestamps: false
});

export default calification_shop_model;