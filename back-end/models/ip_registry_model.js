import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const IpRegistry = sequelize.define('ip_registry', {
    ip_address: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
            isIP: true
        }
    },
    registration_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_attempt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ip_registry',
    timestamps: false
});

export default IpRegistry;