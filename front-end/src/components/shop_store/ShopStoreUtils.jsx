import axiosInstance from '../../utils/app/axiosConfig';

// Fetch products for a shop
export const fetchProducts = async (shopId, setProducts, setLoadingProducts, setError) => {
  try {
    setLoadingProducts(true);
    const response = await axiosInstance.get(`/product/active-by-shop-id/${shopId}`);
    
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

// Fetch packages for a shop
export const fetchPackages = async (shopId, setPackages, setLoadingPackages, setError) => {
  try {
    setLoadingPackages(true);
    const response = await axiosInstance.get(`/package/active-by-shop-id/${shopId}`);
    
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

// Fetch user orders for a specific shop
export const fetchShopUserOrders = async (fetchUserOrders, setLoadingOrders, setError) => {
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

// Filter orders for current shop
export const filterShopOrders = (userOrders, shopId) => {
  if (!userOrders || !shopId) return [];
  return userOrders.filter(order => order.id_shop === shopId);
};

// Calculate cart item count
export const getCartItemCount = (cartItems) => {
  return cartItems.products.length + cartItems.packages.length;
};

// Get item quantity in cart
export const getItemQuantityInCart = (cartItems, id, isPackage = false) => {
  if (isPackage) {
    const item = cartItems.packages.find(item => item.id_package === id);
    return item ? item.quantity : 0;
  } else {
    const item = cartItems.products.find(item => item.id_product === id);
    return item ? item.quantity : 0;
  }
};

// Format time
export const formatTime = (time) => {
  if (!time) return '--:--';
  return time.slice(0, 5);
};

// Get schedule text for today
export const getScheduleText = (shop) => {
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

// Get order status display
export const getOrderStatusDisplay = (status) => {
  switch (status) {
    case 'pending':
      return { icon: 'Clock', text: 'Pendiente', color: '#FFA500' };
    case 'confirmed':
      return { icon: 'CheckCircle', text: 'Confirmado', color: '#4CAF50' };
    case 'preparing':
      return { icon: 'AlertCircle', text: 'Preparando', color: '#2196F3' };
    case 'ready':
      return { icon: 'ShoppingBag', text: 'Listo', color: '#00BCD4' };
    case 'delivered':
      return { icon: 'Truck', text: 'Entregado', color: '#4CAF50' };
    case 'cancelled':
      return { icon: 'XCircle', text: 'Cancelado', color: '#F44336' };
    default:
      return { icon: 'Clock', text: status, color: '#757575' };
  }
};

// Format order date
export const formatOrderDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Handle add to cart
export const handleAddToCart = (item, isPackage, addProductToCart, addPackageToCart, setSuccess) => {
  if (isPackage) {
    addPackageToCart(item, 1);
  } else {
    addProductToCart(item, 1);
  }
  setSuccess({ cartSuccess: 'Añadido al carrito' });
};

// Handle quantity change
export const handleQuantityChange = (id, quantity, isPackage, updateProductQuantity, updatePackageQuantity) => {
  if (isPackage) {
    updatePackageQuantity(id, quantity);
  } else {
    updateProductQuantity(id, quantity);
  }
};

// Handle remove from cart
export const handleRemoveFromCart = (id, isPackage, removeProductFromCart, removePackageFromCart) => {
  if (isPackage) {
    removePackageFromCart(id);
  } else {
    removeProductFromCart(id);
  }
};

// Handle create order
export const handleCreateOrder = async (
  currentUser,
  cartItems,
  deliveryType,
  deliveryAddress,
  shopId,
  setError,
  setProcessingOrder,
  createOrder,
  setShowCart,
  fetchShopUserOrders
) => {
  if (!currentUser) {
    setError({ orderError: 'Debes iniciar sesión para hacer un pedido' });
    return null;
  }
  
  if (cartItems.products.length === 0 && cartItems.packages.length === 0) {
    setError({ orderError: 'El carrito está vacío' });
    return null;
  }
  
  if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
    setError({ orderError: 'Por favor ingresa una dirección de entrega' });
    return null;
  }
  
  setProcessingOrder(true);
  const order = await createOrder(shopId);
  
  if (order) {
    setShowCart(false);
    //update: Refresh orders after creating new one
    if (currentUser.type_user === 'user') {
      await fetchShopUserOrders();
    }
  }
  
  setProcessingOrder(false);
  return order;
};

//update: Get package price for display (handle both total_price and price_package)
export const getPackagePrice = (pkg) => {
  // First check for discounted_price
  if (pkg.discounted_price !== undefined && pkg.discounted_price !== null) {
    return pkg.discounted_price;
  }
  // Then check for total_price (calculated from products)
  if (pkg.total_price !== undefined && pkg.total_price !== null) {
    return pkg.total_price;
  }
  // Fallback to price_package if it exists
  if (pkg.price_package !== undefined && pkg.price_package !== null) {
    return pkg.price_package;
  }
  // Default to 0 if no price is found
  return 0;
};

//update: Get package original price (before discount)
export const getPackageOriginalPrice = (pkg) => {
  // Check for total_price (calculated from products)
  if (pkg.total_price !== undefined && pkg.total_price !== null) {
    return pkg.total_price;
  }
  // Fallback to price_package if it exists
  if (pkg.price_package !== undefined && pkg.price_package !== null) {
    return pkg.price_package;
  }
  // Default to 0 if no price is found
  return 0;
};