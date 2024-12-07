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
            freezeTableName: true,
        },
        // Add these new configuration options
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log('******* SEQUELIZE: Connection has been established successfully ********');
        
        // Optional: Sync character set for the connection
        await sequelize.query('SET NAMES utf8mb4');
        
    } catch (error) {
        console.error('!!!! SEQUELIZE: Unable to connect to the database !!!!!', error);
        throw error;
    }
} 

initialize();

export default sequelize;