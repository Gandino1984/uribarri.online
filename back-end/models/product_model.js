import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const product_model = sequelize.define("product", {
    id_product: { 
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name_product: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price_product: {
        type: DataTypes.DECIMAL(10,2), 
        allowNull: false,
        defaultValue: 0.0
    },
    discount_product: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    season_product: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calification_product: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    type_product: {
        type: DataTypes.STRING(45),
        allowNull: false,
        validate: {
            isIn: {
                args: [['electronico', 'electrodomestico', 'comida', 'bebida', 'fruta', 'vegetal','semilla', 'pan', 'pescado', 'marisco', 'construccion', 'herramientas', 'servicios', 'otros']], 
                msg: 'Tipo de producto inválido'
            }
        }
    },
    subtype_product: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    stock_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    info_product: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});

export default product_model;