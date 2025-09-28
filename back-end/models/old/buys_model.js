import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize.js";


const buys_model = sequelize.define("buys", {
    id_buys: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_provider: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    id_product: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    price_provider: {
        //update: Changed from INTEGER.UNSIGNED to DECIMAL(10,2) to match database schema
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    }
}, {
    timestamps: false,
    freezeTableName: true
});

export default buys_model;