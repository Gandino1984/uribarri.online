import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";


const shop_model = sequelize.define("shop", {
    id_shop: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_shop: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    location_shop: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    type_shop: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    subtype_shop: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    calification_shop: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    image_shop: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    id_user: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});


export default shop_model;