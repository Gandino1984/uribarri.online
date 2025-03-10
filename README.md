# mibarrio.online 🏪

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)



## Descripción del Proyecto

mibarrio.online es una plataforma de gestión de comercios online, agenda cultural y revista comunitaria diseñada específicamente para gestón local del distrito02 de Bilbao. Esta solución permite a los establecimientos y agentes culturales de la zona ofrecer sus servicios y actividades culturales en formato digital de forma eficiente y accesible.

## Stack Tecnológico

### Backend
- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor (versión 22.9.0)
- **Express.js**: Framework web rápido y minimalista para Node.js
- **Sequelize**: ORM (Object-Relational Mapping) para facilitar las operaciones con la base de datos

### Base de Datos
- **MySQL 8.0**: Sistema de gestión de bases de datos relacionales
- **mysql2**: Cliente MySQL para Node.js

### Seguridad
- **bcrypt**: Librería para el cifrado de contraseñas
- **cors**: Middleware para habilitar el Cross-Origin Resource Sharing

### Gestión de Archivos e Imágenes
- **multer**: Middleware para la gestión de subida de archivos
- **sharp**: Procesamiento y optimización de imágenes
- **validate-image-type**: Validación de tipos de imágenes

### Configuración y Variables de Entorno
- **dotenv**: Gestión de variables de entorno

### Contenerización
- **Docker**: Plataforma para crear, implementar y ejecutar aplicaciones en contenedores
- **Docker Compose**: Herramienta para definir y ejecutar aplicaciones Docker multi-contenedor

### Herramientas de Desarrollo
- **ESLint**: Herramienta de análisis de código estático
- **Nodemon**: Utilidad que monitoriza cambios en el código y reinicia automáticamente el servidor
- **Jest**: Framework de pruebas

## Estructura del Proyecto

El proyecto sigue una arquitectura modular, con separación clara entre:
- Backend (API RESTful)
- Sistema de gestión de imágenes (uploads para usuarios, tiendas)
- Configuración de contenedores Docker
- Base de datos MySQL

## Propósito

El sistema está diseñado para:
- Facilitar la gestión de pedidos online para comercios locales
- Permitir a los clientes realizar reservas en establecimientos
- Digitalizar servicios de los comercios del barrio de Uribarri
- Mejorar la visibilidad y accesibilidad de los negocios locales

## Autor

Desarrollado por German Andino

---

*Para más información y contribuciones, visite el [repositorio GitHub](https://github.com/Gandino1984/uribarri.online)*
