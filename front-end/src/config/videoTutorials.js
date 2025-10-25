// videoTutorials.js - Configuration for context-aware video tutorials
// Add your YouTube video URLs or IDs here for each context

export const VIDEO_TUTORIALS = {
  // Authentication & Account Management
  loginRegister: {
    title: 'Cómo Registrarse en Uribarri Online',
    url: 'https://youtu.be/3CTXA2zLkK8',
    description: 'Tutorial sobre registro y creación de cuenta'
  },

  emailVerification: {
    title: 'Verificación de Email',
    url: '', // Add YouTube URL here
    description: 'Cómo verificar tu dirección de correo electrónico'
  },

  forgotPassword: {
    title: 'Recuperar Contraseña',
    url: '', // Add YouTube URL here
    description: 'Proceso de recuperación de contraseña'
  },

  userProfile: {
    title: 'Gestionar tu Perfil',
    url: '', // Add YouTube URL here
    description: 'Cómo editar tu información personal y foto de perfil'
  },

  // Shopping & Commerce (User perspective)
  shopWindow: {
    title: 'Cómo Buscar y Explorar Comercios',
    url: '', // Add YouTube URL here
    description: 'Navegar por el escaparate de comercios locales'
  },

  shopStore: {
    title: 'Cómo Comprar Productos',
    url: '', // Add YouTube URL here
    description: 'Añadir productos al carrito y realizar pedidos'
  },

  orderHistory: {
    title: 'Ver tus Pedidos',
    url: '', // Add YouTube URL here
    description: 'Consultar el historial y estado de tus pedidos'
  },

  // Seller Management
  shopManagement: {
    title: 'Gestionar tu Tienda',
    url: '', // Add YouTube URL here
    description: 'Panel de control para comerciantes'
  },

  createShop: {
    title: 'Crear una Nueva Tienda',
    url: 'https://youtu.be/uQP1Y0ThC6U',
    description: 'Cómo registrar tu comercio en la plataforma'
  },

  productManagement: {
    title: 'Gestionar Productos',
    url: '', // Add YouTube URL here
    description: 'Añadir, editar y eliminar productos de tu tienda'
  },

  createProduct: {
    title: 'Añadir un Nuevo Producto',
    url: '', // Add YouTube URL here
    description: 'Cómo crear y publicar un producto'
  },

  packageManagement: {
    title: 'Crear Ofertas y Paquetes',
    url: '', // Add YouTube URL here
    description: 'Gestionar paquetes de productos con descuentos'
  },

  orderManagement: {
    title: 'Gestionar Pedidos de tu Tienda',
    url: '', // Add YouTube URL here
    description: 'Cómo procesar y gestionar pedidos recibidos'
  },

  // Rider/Delivery
  riderManagement: {
    title: 'Panel de Repartidor',
    url: '', // Add YouTube URL here
    description: 'Cómo aceptar y gestionar entregas'
  },

  riderDelivery: {
    title: 'Realizar Entregas',
    url: '', // Add YouTube URL here
    description: 'Proceso de entrega y confirmación'
  },

  // Community & Organizations
  infoManagement: {
    title: 'Usar el Tablón Comunitario',
    url: '', // Add YouTube URL here
    description: 'Explorar publicaciones y eventos del barrio'
  },

  createOrganization: {
    title: 'Crear una Organización',
    url: '', // Add YouTube URL here
    description: 'Cómo crear un grupo o asociación comunitaria'
  },

  createPublication: {
    title: 'Publicar en el Tablón',
    url: '', // Add YouTube URL here
    description: 'Cómo crear y compartir publicaciones'
  },

  manageOrganization: {
    title: 'Gestionar tu Organización',
    url: '', // Add YouTube URL here
    description: 'Administrar miembros y contenido de tu organización'
  },

  createEvent: {
    title: 'Crear un Evento Cultural',
    url: '', // Add YouTube URL here
    description: 'Cómo publicar eventos y actividades'
  },

  // General/Default
  default: {
    title: 'Introducción a Uribarri Online',
    url: '', // Add YouTube URL here
    description: 'Guía general de uso de la plataforma'
  }
};

/**
 * Get video tutorial configuration by context key
 * @param {string} contextKey - The context identifier
 * @returns {Object} Video tutorial configuration object
 */
export const getVideoByContext = (contextKey) => {
  return VIDEO_TUTORIALS[contextKey] || VIDEO_TUTORIALS.default;
};

/**
 * Check if a video is available for a given context
 * @param {string} contextKey - The context identifier
 * @returns {boolean} True if video URL exists
 */
export const hasVideo = (contextKey) => {
  const video = VIDEO_TUTORIALS[contextKey];
  return video && video.url && video.url.trim() !== '';
};

/**
 * Get all available video tutorials
 * @returns {Array} Array of all video tutorial objects with their keys
 */
export const getAllVideos = () => {
  return Object.entries(VIDEO_TUTORIALS).map(([key, value]) => ({
    key,
    ...value
  }));
};
