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
        // validate: {
        //     isIn: {
        //         args: [['general', 'fruteria', 'panaderia', 'pescaderia', 'carniceria', 'peluqueria', 'bar', 'restaurante', 'ferreteria', 'drogueria', 'farmacia', 'parafarmacia', 'inmobiliaria', 'especial' ]], 
        //         msg: 'Tipo de tienda inválido'
        //     }
        // }
    },
    subtype_shop: {
        type: DataTypes.STRING(45),
        allowNull: false,
        // validate: {
        //     isIn: {
        //         args: [['general', 'turco', 'italiano', 'chino', 'peruano', 'nepali', 'griego', 'especializado']], 
        //         msg: 'subcategoría de tienda inválida'
        //     }
        // }
    },
    description_shop: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    id_user: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    calification_shop: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});


export default shop_model;