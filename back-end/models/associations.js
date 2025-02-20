// import user_model from './user_model.js';
// import product_model from './product_model.js';
// import shop_model from './shop_model.js';
// import orders_model from './orders_model.js';
// import buys_model from './buys_model.js';
// import provider_model from './provider_model.js';

// function setupAssociations() {
//     // User Model Associations
//     user_model.hasMany(shop_model, {
//         as: 'userhasmanyshops'
//     });

//     user_model.belongsToMany(product_model, { 
//         through: orders_model, 
//         as: 'productsBoughtByThisUser' 
//     });

//     // Shop Model Associations
//     shop_model.belongsTo(user_model, {
//         as: 'shopbelongstouser'
//     });

//     shop_model.hasMany(buys_model, {
//         as: 'shophasmanybuys'
//     });

//     // Product Model Associations
//     product_model.belongsToMany(user_model, { 
//         through: orders_model, 
//         as: 'usersThatBoughtThisProduct' 
//     });

//     // Buys Model Associations
//     buys_model.belongsTo(shop_model, { 
//         as: 'buysbelongstoshop' 
//     });

//     buys_model.belongsTo(provider_model, { 
//         as: 'buysbelongstoprovider' 
//       });
// }

// export default setupAssociations;