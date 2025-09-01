import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import axiosInstance from '../utils/app/axiosConfig';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { setError, setSuccess } = useUI();
  
  // Order state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderProducts, setOrderProducts] = useState([]);
  const [orderPackages, setOrderPackages] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState({
    products: [],
    packages: []
  });
  
  // Delivery state
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Add product to cart
  const addProductToCart = (product, quantity = 1, notes = '') => {
    setCartItems(prev => {
      const existingIndex = prev.products.findIndex(item => item.id_product === product.id_product);
      
      if (existingIndex >= 0) {
        const updatedProducts = [...prev.products];
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity: updatedProducts[existingIndex].quantity + quantity,
          product_notes: notes || updatedProducts[existingIndex].product_notes
        };
        return { ...prev, products: updatedProducts };
      }
      
      return {
        ...prev,
        products: [...prev.products, {
          id_product: product.id_product,
          product: product,
          quantity: quantity,
          product_notes: notes
        }]
      };
    });
  };
  
  // Add package to cart
  const addPackageToCart = (packageItem, quantity = 1, notes = '') => {
    setCartItems(prev => {
      const existingIndex = prev.packages.findIndex(item => item.id_package === packageItem.id_package);
      
      if (existingIndex >= 0) {
        const updatedPackages = [...prev.packages];
        updatedPackages[existingIndex] = {
          ...updatedPackages[existingIndex],
          quantity: updatedPackages[existingIndex].quantity + quantity,
          package_notes: notes || updatedPackages[existingIndex].package_notes
        };
        return { ...prev, packages: updatedPackages };
      }
      
      return {
        ...prev,
        packages: [...prev.packages, {
          id_package: packageItem.id_package,
          package: packageItem,
          quantity: quantity,
          package_notes: notes
        }]
      };
    });
  };
  
  // Update product quantity in cart
  const updateProductQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromCart(productId);
      return;
    }
    
    setCartItems(prev => ({
      ...prev,
      products: prev.products.map(item => 
        item.id_product === productId 
          ? { ...item, quantity } 
          : item
      )
    }));
  };
  
  // Update package quantity in cart
  const updatePackageQuantity = (packageId, quantity) => {
    if (quantity <= 0) {
      removePackageFromCart(packageId);
      return;
    }
    
    setCartItems(prev => ({
      ...prev,
      packages: prev.packages.map(item => 
        item.id_package === packageId 
          ? { ...item, quantity } 
          : item
      )
    }));
  };
  
  // Remove product from cart
  const removeProductFromCart = (productId) => {
    setCartItems(prev => ({
      ...prev,
      products: prev.products.filter(item => item.id_product !== productId)
    }));
  };
  
  // Remove package from cart
  const removePackageFromCart = (packageId) => {
    setCartItems(prev => ({
      ...prev,
      packages: prev.packages.filter(item => item.id_package !== packageId)
    }));
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems({
      products: [],
      packages: []
    });
    setDeliveryType('pickup');
    setDeliveryAddress('');
    setOrderNotes('');
  };
  
  //update: Fixed calculate total to handle package prices correctly
  const calculateTotal = () => {
    let total = 0;
    
    // Add products total
    cartItems.products.forEach(item => {
      const price = parseFloat(item.product.price_product) || 0;
      total += price * item.quantity;
    });
    
    // Add packages total - handle different price properties
    cartItems.packages.forEach(item => {
      let packagePrice = 0;
      
      // Check for discounted_price first (this is the final price after discount)
      if (item.package.discounted_price !== undefined && item.package.discounted_price !== null) {
        packagePrice = parseFloat(item.package.discounted_price) || 0;
      }
      // Then check for total_price (calculated from products)
      else if (item.package.total_price !== undefined && item.package.total_price !== null) {
        packagePrice = parseFloat(item.package.total_price) || 0;
      }
      // Fallback to price_package if it exists
      else if (item.package.price_package !== undefined && item.package.price_package !== null) {
        packagePrice = parseFloat(item.package.price_package) || 0;
      }
      
      total += packagePrice * item.quantity;
    });
    
    return total;
  };
  
  // Create order
  const createOrder = async (shopId) => {
    if (!currentUser || !currentUser.id_user) {
      setError({ orderError: 'Debes iniciar sesión para hacer un pedido' });
      return null;
    }
    
    if (cartItems.products.length === 0 && cartItems.packages.length === 0) {
      setError({ orderError: 'El carrito está vacío' });
      return null;
    }
    
    try {
      setLoadingOrders(true);
      
      const orderData = {
        id_user: currentUser.id_user,
        id_shop: shopId,
        products: cartItems.products.map(item => ({
          id_product: item.id_product,
          quantity: item.quantity,
          product_notes: item.product_notes
        })),
        packages: cartItems.packages.map(item => ({
          id_package: item.id_package,
          quantity: item.quantity,
          package_notes: item.package_notes
        })),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
        order_notes: orderNotes
      };
      
      const response = await axiosInstance.post('/order/create', orderData);
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
        return null;
      }
      
      setSuccess({ orderSuccess: '¡Pedido creado exitosamente!' });
      setCurrentOrder(response.data.data);
      clearCart();
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      setError({ orderError: 'Error al crear el pedido' });
      return null;
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Fetch user orders
  const fetchUserOrders = async () => {
    if (!currentUser || !currentUser.id_user) return;
    
    try {
      setLoadingOrders(true);
      const response = await axiosInstance.post('/order/by-user-id', {
        id_user: currentUser.id_user
      });
      
      if (response.data.error) {
        console.error('Error fetching user orders:', response.data.error);
        setUserOrders([]);
      } else {
        setUserOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Fetch shop orders
  const fetchShopOrders = async (shopId) => {
    try {
      setLoadingOrders(true);
      const response = await axiosInstance.post('/order/by-shop-id', {
        id_shop: shopId
      });
      
      if (response.data.error) {
        console.error('Error fetching shop orders:', response.data.error);
        setShopOrders([]);
      } else {
        setShopOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      setShopOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/order/update-status/${orderId}`, {
        order_status: newStatus
      });
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
        return false;
      }
      
      setSuccess({ orderSuccess: 'Estado del pedido actualizado' });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      setError({ orderError: 'Error al actualizar el estado del pedido' });
      return false;
    }
  };
  
  // Cancel order
  const cancelOrder = async (orderId, reason = '') => {
    try {
      const response = await axiosInstance.patch(`/order/cancel/${orderId}`, {
        cancellation_reason: reason
      });
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
        return false;
      }
      
      setSuccess({ orderSuccess: 'Pedido cancelado' });
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError({ orderError: 'Error al cancelar el pedido' });
      return false;
    }
  };
  
  const value = {
    // Order state
    currentOrder, setCurrentOrder,
    orderProducts, setOrderProducts,
    orderPackages, setOrderPackages,
    userOrders, setUserOrders,
    shopOrders, setShopOrders,
    loadingOrders,
    
    // Cart state
    cartItems, setCartItems,
    
    // Delivery state
    deliveryType, setDeliveryType,
    deliveryAddress, setDeliveryAddress,
    orderNotes, setOrderNotes,
    
    // Cart functions
    addProductToCart,
    addPackageToCart,
    updateProductQuantity,
    updatePackageQuantity,
    removeProductFromCart,
    removePackageFromCart,
    clearCart,
    calculateTotal,
    
    // Order functions
    createOrder,
    fetchUserOrders,
    fetchShopOrders,
    updateOrderStatus,
    cancelOrder
  };
  
  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;