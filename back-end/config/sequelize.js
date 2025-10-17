import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

//update: Added timezone configuration to fix token expiration issues
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER, 
    process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        port: 3306,  
        dialect: "mysql",
        //update: Set timezone to UTC for consistency
        timezone: '+00:00',
        //update: Additional MySQL dialect options for timezone handling
        dialectOptions: {
            timezone: '+00:00',
            dateStrings: true,
            typeCast: true
        },
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
        
        //update: Log timezone information for debugging
        const [results] = await sequelize.query(
            "SELECT NOW() as server_time, @@global.time_zone as global_tz, @@session.time_zone as session_tz"
        );
        console.log('🕒 MySQL Timezone Info:');
        console.log('  - Server Time:', results[0].server_time);
        console.log('  - Global TZ:', results[0].global_tz);
        console.log('  - Session TZ:', results[0].session_tz);
        console.log('🕒 App Time:', new Date().toISOString());
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