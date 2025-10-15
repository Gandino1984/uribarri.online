import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        port: 3306,  
        dialect: "mysql",
        define: {
            timestamps: false,
            freezeTableName: true
        }
    }
);

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log('*********************************************************************');
        console.log('** SEQUELIZE: La conexion con la base de datos ha sido establecida **');
        console.log('*********************************************************************');
        await sequelize.sync({ alter: false }); 
    } catch (error) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('SEQUELIZE: Error en la conexion con la base de datos', error);
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        throw error;
    }
} 

initialize();

export default sequelize;