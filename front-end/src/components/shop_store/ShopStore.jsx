import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Package, Clock, MapPin, Phone, Star, ShoppingBag, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext';
import { useUI } from '../../app_context/UIContext';
import { useOrder } from '../../app_context/OrderContext';
import axiosInstance from '../../utils/app/axiosConfig';
// import OButton from '../Obutton/Obutton';
import styles from '../../../../public/css/ShopStore.module.css';

const ShopStore = () => {
  const { currentUser } = useAuth();
  const { 
    selectedShopForStore, 
    setShowShopStore, 
    setShowShopWindow,
    setError,
    setSuccess 
  } = useUI();
  const { 
    cartItems,
    addProductToCart,
    addPackageToCart,
    updateProductQuantity,
    updatePackageQuantity,
    removeProductFromCart,
    removePackageFromCart,
    calculateTotal,
    createOrder,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    orderNotes,
    setOrderNotes,
    clearCart,
    fetchUserOrders,
    userOrders
  } = useOrder();
  
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [processingOrder, setProcessingOrder] = useState(false);
  //update: Add state for shop-specific orders
  const [shopOrders, setShopOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  useEffect(() => {
    if (selectedShopForStore?.id_shop) {
      fetchProducts();
      fetchPackages();
      //update: Fetch orders when shop is selected and user is logged in
      if (currentUser && currentUser.type_user === 'user') {
        fetchShopUserOrders();
      }
    }
  }, [selectedShopForStore, currentUser]);
  
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axiosInstance.get(`/product/active-by-shop-id/${selectedShopForStore.id_shop}`);
      
      if (response.data && !response.data.error) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError({ productError: 'Error al cargar los productos' });
    } finally {
      setLoadingProducts(false);
    }
  };
  
  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const response = await axiosInstance.get(`/package/active-by-shop-id/${selectedShopForStore.id_shop}`);
      
      if (response.data && !response.data.error) {
        setPackages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError({ packageError: 'Error al cargar los paquetes' });
    } finally {
      setLoadingPackages(false);
    }
  };
  
  //update: Add function to fetch user orders for this specific shop
  const fetchShopUserOrders = async () => {
    try {
      setLoadingOrders(true);
      await fetchUserOrders();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setError({ orderError: 'Error al cargar los pedidos' });
    } finally {
      setLoadingOrders(false);
    }
  };
  
  //update: Filter orders for current shop
  useEffect(() => {
    if (userOrders && selectedShopForStore) {
      const filteredOrders = userOrders.filter(order => order.id_shop === selectedShopForStore.id_shop);
      setShopOrders(filteredOrders);
    }
  }, [userOrders, selectedShopForStore]);
  
  const handleBack = () => {
    setShowShopStore(false);
    setShowShopWindow(true);
    clearCart();
  };
  
  const handleAddToCart = (item, isPackage = false) => {
    if (isPackage) {
      addPackageToCart(item, 1);
    } else {
      addProductToCart(item, 1);
    }
    setSuccess({ cartSuccess: 'Añadido al carrito' });
  };
  
  const handleQuantityChange = (id, quantity, isPackage = false) => {
    if (isPackage) {
      updatePackageQuantity(id, quantity);
    } else {
      updateProductQuantity(id, quantity);
    }
  };
  
  const handleRemoveFromCart = (id, isPackage = false) => {
    if (isPackage) {
      removePackageFromCart(id);
    } else {
      removeProductFromCart(id);
    }
  };
  
  const handleCreateOrder = async () => {
    if (!currentUser) {
      setError({ orderError: 'Debes iniciar sesión para hacer un pedido' });
      return;
    }
    
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setError({ orderError: 'Por favor ingresa una dirección de entrega' });
      return;
    }
    
    setProcessingOrder(true);
    const order = await createOrder(selectedShopForStore.id_shop);
    
    if (order) {
      setShowCart(false);
      //update: Refresh orders after creating new one
      if (currentUser.type_user === 'user') {
        fetchShopUserOrders();
      }
    }
    
    setProcessingOrder(false);
  };
  
  const getCartItemCount = () => {
    return cartItems.products.length + cartItems.packages.length;
  };
  
  const getItemQuantityInCart = (id, isPackage = false) => {
    if (isPackage) {
      const item = cartItems.packages.find(item => item.id_package === id);
      return item ? item.quantity : 0;
    } else {
      const item = cartItems.products.find(item => item.id_product === id);
      return item ? item.quantity : 0;
    }
  };
  
  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };
  
  const getScheduleText = () => {
    const shop = selectedShopForStore;
    const today = new Date().getDay();
    const dayMap = {
      0: shop?.open_sunday,
      1: shop?.open_monday,
      2: shop?.open_tuesday,
      3: shop?.open_wednesday,
      4: shop?.open_thursday,
      5: shop?.open_friday,
      6: shop?.open_saturday
    };
    
    const isOpenToday = dayMap[today];
    
    if (!isOpenToday) {
      return 'Cerrado hoy';
    }
    
    return `${formatTime(shop.morning_open)} - ${formatTime(shop.morning_close)} / ${formatTime(shop.afternoon_open)} - ${formatTime(shop.afternoon_close)}`;
  };
  
  //update: Add function to get order status icon and color
  const getOrderStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock size={16} />, text: 'Pendiente', color: '#FFA500' };
      case 'confirmed':
        return { icon: <CheckCircle size={16} />, text: 'Confirmado', color: '#4CAF50' };
      case 'preparing':
        return { icon: <AlertCircle size={16} />, text: 'Preparando', color: '#2196F3' };
      case 'ready':
        return { icon: <ShoppingBag size={16} />, text: 'Listo', color: '#00BCD4' };
      case 'delivered':
        return { icon: <Truck size={16} />, text: 'Entregado', color: '#4CAF50' };
      case 'cancelled':
        return { icon: <XCircle size={16} />, text: 'Cancelado', color: '#F44336' };
      default:
        return { icon: <Clock size={16} />, text: status, color: '#757575' };
    }
  };
  
  //update: Add function to format date
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!selectedShopForStore) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        
        <div className={styles.shopInfo}>
          <h1 className={styles.shopName}>{selectedShopForStore.name_shop}</h1>
          <div className={styles.shopDetails}>
            <span className={styles.shopType}>{selectedShopForStore.type_shop}</span>
            {selectedShopForStore.verified_shop && (
              <span className={styles.verifiedBadge}>Verificado</span>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setShowCart(!showCart)} 
          className={styles.cartButton}
        >
          <ShoppingCart size={24} />
          {getCartItemCount() > 0 && (
            <span className={styles.cartBadge}>{getCartItemCount()}</span>
          )}
        </button>
      </div>
      
      <div className={styles.shopMetaInfo}>
        <div className={styles.metaItem}>
          <MapPin size={16} />
          <span>{selectedShopForStore.location_shop}</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={16} />
          <span>{getScheduleText()}</span>
        </div>
        {selectedShopForStore.calification_shop > 0 && (
          <div className={styles.metaItem}>
            <Star size={16} />
            <span>{selectedShopForStore.calification_shop}/5</span>
          </div>
        )}
        {selectedShopForStore.has_delivery && (
          <div className={styles.metaItem}>
            <span className={styles.deliveryBadge}>Entrega a domicilio</span>
          </div>
        )}
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos ({products.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'packages' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('packages')}
        >
          Paquetes ({packages.length})
        </button>
        {/*update: Add orders tab for regular users only*/}
        {currentUser && currentUser.type_user === 'user' && (
          <button 
            className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Mis Pedidos ({shopOrders.length})
          </button>
        )}
      </div>
      
      <div className={styles.content}>
        {activeTab === 'products' && (
          <div className={styles.productsList}>
            {loadingProducts ? (
              <div className={styles.loading}>Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>No hay productos disponibles</div>
            ) : (
              products.map(product => (
                <div key={product.id_product} className={styles.productCard}>
                  {product.image_product && (
                    <img 
                      src={`/${product.image_product}`} 
                      alt={product.name_product}
                      className={styles.productImage}
                    />
                  )}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name_product}</h3>
                    <p className={styles.productDescription}>{product.info_product}</p>
                    <div className={styles.productMeta}>
                      <span className={styles.price}>
                        €{product.price_product}
                        {product.price_unit && product.price_unit !== 'Euros/unidad' && (
                          <span className={styles.priceUnit}> / {product.price_unit.replace('Euros/', '')}</span>
                        )}
                      </span>
                      {product.discount_product > 0 && (
                        <span className={styles.discount}>-{product.discount_product}%</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.productActions}>
                    {getItemQuantityInCart(product.id_product) === 0 ? (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className={styles.addButton}
                      >
                        Añadir
                      </button>
                    ) : (
                      <div className={styles.quantityControls}>
                        <button 
                          onClick={() => handleQuantityChange(
                            product.id_product, 
                            getItemQuantityInCart(product.id_product) - 1
                          )}
                          className={styles.quantityButton}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {getItemQuantityInCart(product.id_product)}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(
                            product.id_product, 
                            getItemQuantityInCart(product.id_product) + 1
                          )}
                          className={styles.quantityButton}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'packages' && (
          <div className={styles.packagesList}>
            {loadingPackages ? (
              <div className={styles.loading}>Cargando paquetes...</div>
            ) : packages.length === 0 ? (
              <div className={styles.emptyState}>No hay paquetes disponibles</div>
            ) : (
              packages.map(pkg => (
                <div key={pkg.id_package} className={styles.packageCard}>
                  <div className={styles.packageHeader}>
                    <Package size={24} />
                    <h3 className={styles.packageName}>
                      {pkg.name_package || 'Paquete sin nombre'}
                    </h3>
                  </div>
                  <div className={styles.packageProducts}>
                    {/* Display products from the package */}
                    {pkg.product1 && (
                      <span className={styles.packageProduct}>
                        {pkg.product1.name_product}
                      </span>
                    )}
                    {pkg.product2 && (
                      <span className={styles.packageProduct}>
                        {pkg.product2.name_product}
                      </span>
                    )}
                    {pkg.product3 && (
                      <span className={styles.packageProduct}>
                        {pkg.product3.name_product}
                      </span>
                    )}
                    {pkg.product4 && (
                      <span className={styles.packageProduct}>
                        {pkg.product4.name_product}
                      </span>
                    )}
                    {pkg.product5 && (
                      <span className={styles.packageProduct}>
                        {pkg.product5.name_product}
                      </span>
                    )}
                  </div>
                  <div className={styles.packageFooter}>
                    <div className={styles.packagePricing}>
                      {pkg.discounted_price ? (
                        <>
                          <span className={styles.originalPrice}>€{(pkg.total_price || 0).toFixed(2)}</span>
                          <span className={styles.packagePrice}>€{(pkg.discounted_price || 0).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className={styles.packagePrice}>€{(pkg.total_price || 0).toFixed(2)}</span>
                      )}
                      {pkg.discount_package > 0 && (
                        <span className={styles.packageDiscount}>
                          Ahorra {pkg.discount_package}%
                        </span>
                      )}
                    </div>
                    {getItemQuantityInCart(pkg.id_package, true) === 0 ? (
                      <button 
                        onClick={() => handleAddToCart(pkg, true)}
                        className={styles.addButton}
                      >
                        Añadir
                      </button>
                    ) : (
                      <div className={styles.quantityControls}>
                        <button 
                          onClick={() => handleQuantityChange(
                            pkg.id_package, 
                            getItemQuantityInCart(pkg.id_package, true) - 1,
                            true
                          )}
                          className={styles.quantityButton}
                        >
                          -
                        </button>
                        <span className={styles.quantity}>
                          {getItemQuantityInCart(pkg.id_package, true)}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(
                            pkg.id_package, 
                            getItemQuantityInCart(pkg.id_package, true) + 1,
                            true
                          )}
                          className={styles.quantityButton}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/*update: Add orders tab content*/}
        {activeTab === 'orders' && currentUser && currentUser.type_user === 'user' && (
          <div className={styles.ordersList}>
            {loadingOrders ? (
              <div className={styles.loading}>Cargando pedidos...</div>
            ) : shopOrders.length === 0 ? (
              <div className={styles.emptyState}>No has realizado pedidos en este comercio</div>
            ) : (
              shopOrders.map(order => {
                const statusDisplay = getOrderStatusDisplay(order.order_status);
                return (
                  <div key={order.id_order} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <h4 className={styles.orderId}>Pedido #{order.id_order}</h4>
                        <span className={styles.orderDate}>{formatOrderDate(order.created_at)}</span>
                      </div>
                      <div className={styles.orderStatus} style={{ color: statusDisplay.color }}>
                        {statusDisplay.icon}
                        <span>{statusDisplay.text}</span>
                      </div>
                    </div>
                    
                    <div className={styles.orderContent}>
                      {order.order_products && order.order_products.length > 0 && (
                        <div className={styles.orderSection}>
                          <h5 className={styles.sectionTitle}>Productos:</h5>
                          {order.order_products.map((item, index) => (
                            <div key={index} className={styles.orderItem}>
                              <span>{item.product?.name_product || 'Producto'}</span>
                              <span className={styles.itemQuantity}>x{item.quantity}</span>
                              <span className={styles.itemPrice}>€{(parseFloat(item.total_price) || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {order.order_packages && order.order_packages.length > 0 && (
                        <div className={styles.orderSection}>
                          <h5 className={styles.sectionTitle}>Paquetes:</h5>
                          {order.order_packages.map((item, index) => (
                            <div key={index} className={styles.orderItem}>
                              <span>{item.package?.name_package || 'Paquete'}</span>
                              <span className={styles.itemQuantity}>x{item.quantity}</span>
                              <span className={styles.itemPrice}>€{(item.total_price || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.orderFooter}>
                      <div className={styles.deliveryInfo}>
                        <span className={styles.deliveryType}>
                          {order.delivery_type === 'delivery' ? (
                            <>
                              <Truck size={16} /> Entrega a domicilio
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={16} /> Recoger en tienda
                            </>
                          )}
                        </span>
                        {order.delivery_type === 'delivery' && order.delivery_address && (
                          <span className={styles.deliveryAddress}>{order.delivery_address}</span>
                        )}
                      </div>
                      <div className={styles.orderTotal}>
                        <span>Total:</span>
                        <span className={styles.totalPrice}>€{(parseFloat(order.total_price) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {order.order_notes && (
                      <div className={styles.orderNotes}>
                        <p className={styles.notesLabel}>Notas:</p>
                        <p className={styles.notesText}>{order.order_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {showCart && (
        <div className={styles.cartModal}>
          <div className={styles.cartContent}>
            <div className={styles.cartHeader}>
              <h2>Tu Carrito</h2>
              <button onClick={() => setShowCart(false)} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.cartItems}>
              {cartItems.products.map(item => (
                <div key={item.id_product} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <h4>{item.product.name_product}</h4>
                    <p>€{item.product.price_product} x {item.quantity}</p>
                  </div>
                  <div className={styles.cartItemActions}>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id_product)}
                      className={styles.removeButton}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              
              {cartItems.packages.map(item => (
                <div key={item.id_package} className={styles.cartItem}>
                  <div className={styles.cartItemInfo}>
                    <h4>{item.package.name_package}</h4>
                    <p>€{(item.package.discounted_price || item.package.total_price || 0).toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className={styles.cartItemActions}>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id_package, true)}
                      className={styles.removeButton}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedShopForStore.has_delivery && (
              <div className={styles.deliveryOptions}>
                <label>
                  <input 
                    type="radio" 
                    value="pickup"
                    checked={deliveryType === 'pickup'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  />
                  Recoger en tienda
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  />
                  Entrega a domicilio
                </label>
                
                {deliveryType === 'delivery' && (
                  <input 
                    type="text"
                    placeholder="Dirección de entrega"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className={styles.addressInput}
                  />
                )}
              </div>
            )}
            
            <textarea 
              placeholder="Notas del pedido (opcional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className={styles.notesInput}
            />
            
            <div className={styles.cartTotal}>
              <span>Total:</span>
              <span>€{calculateTotal().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCreateOrder}
              disabled={processingOrder || getCartItemCount() === 0}
              className={styles.orderButton}
            >
              {processingOrder ? 'Procesando...' : 'Hacer Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopStore;