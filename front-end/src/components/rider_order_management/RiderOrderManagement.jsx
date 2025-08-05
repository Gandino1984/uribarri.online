import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useOrder } from '../../app_context/OrderContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useSpring, animated } from '@react-spring/web';
import { Package, Clock, CheckCircle, Truck, MapPin, DollarSign, Store, AlertCircle, XCircle } from 'lucide-react';
import styles from '../../../../public/css/RiderOrdersManagement.module.css';
import RiderCard from './components/rider_card/RiderCard.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

const RiderOrdersManagement = () => {
  const { currentUser } = useAuth();
  const { setError, setSuccess, setInfo, setShowInfoCard } = useUI();
  
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [requestingOrderId, setRequestingOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'my-orders', or 'pending'

  // Animation for component entrance
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 25 }
  });

  // Fetch all orders and categorize them
  const fetchAndCategorizeOrders = async () => {
    try {
      setLoadingOrders(true);
      
      // Fetch available orders
      const availableResponse = await axiosInstance.get('/order/available-for-riders');
      
      // Fetch my orders
      let myOrdersResponse = { data: { data: [] } };
      if (currentUser?.id_user) {
        myOrdersResponse = await axiosInstance.post('/order/by-rider-id', {
          id_rider: currentUser.id_user
        });
      }
      
      const allAvailableOrders = availableResponse.data.data || [];
      const allMyOrders = myOrdersResponse.data.data || [];
      
      // Categorize orders
      const available = [];
      const pending = [];
      const myActive = [];
      
      // Process available orders
      allAvailableOrders.forEach(order => {
        if (!order.id_rider) {
          // No rider assigned - available for all
          available.push(order);
        } else if (order.id_rider === currentUser.id_user) {
          // This rider requested it
          if (order.rider_accepted === null) {
            // Pending approval
            pending.push(order);
          } else if (order.rider_accepted === false) {
            // Rejected - can request again
            available.push(order);
          }
        }
      });
      
      // Process my orders
      allMyOrders.forEach(order => {
        if (order.rider_accepted === true) {
          // Accepted orders
          myActive.push(order);
        } else if (order.rider_accepted === null) {
          // Pending orders (should already be in pending from above, but just in case)
          if (!pending.find(o => o.id_order === order.id_order)) {
            pending.push(order);
          }
        }
      });
      
      setAvailableOrders(available);
      setPendingRequests(pending);
      setMyOrders(myActive);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError({ orderError: 'Error al cargar pedidos' });
    } finally {
      setLoadingOrders(false);
    }
  };

  // Request to deliver an order
  const handleRequestOrder = async (orderId) => {
    setRequestingOrderId(orderId);
    try {
      const response = await axiosInstance.patch(`/order/assign-rider/${orderId}`, {
        id_rider: currentUser.id_user
      });
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
      } else {
        setSuccess({ orderSuccess: 'Solicitud enviada al comercio' });
        setInfo({ riderInfo: 'Tu solicitud está pendiente de aprobación del comercio' });
        setShowInfoCard(true);
        // Refresh orders
        await fetchAndCategorizeOrders();
        // Switch to pending tab
        setActiveTab('pending');
      }
    } catch (error) {
      setError({ orderError: 'Error al solicitar el pedido' });
    } finally {
      setRequestingOrderId(null);
    }
  };

  // Update order status (for accepted orders)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await axiosInstance.patch(`/order/update-status/${orderId}`, {
        order_status: newStatus
      });
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
      } else {
        setSuccess({ orderSuccess: `Estado actualizado correctamente` });
        // Refresh orders
        await fetchAndCategorizeOrders();
      }
    } catch (error) {
      setError({ orderError: 'Error al actualizar el estado' });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Load orders on mount and set up refresh interval
  useEffect(() => {
    fetchAndCategorizeOrders();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAndCategorizeOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.id_user]);

  // Show instruction when component loads
  useEffect(() => {
    setInfo({ 
      riderInstructions: "Solicita pedidos disponibles y gestiona tus entregas activas" 
    });
    setShowInfoCard(true);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className={styles.statusIconConfirmed} />;
      case 'ready':
        return <AlertCircle size={16} className={styles.statusIconReady} />;
      case 'preparing':
        return <Package size={16} className={styles.statusIconPreparing} />;
      case 'delivered':
        return <Truck size={16} className={styles.statusIconDelivered} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': 'Confirmado',
      'ready': 'Listo para recoger',
      'preparing': 'En preparación',
      'delivered': 'Entregado'
    };
    return statusMap[status] || status;
  };

  const calculateOrderTotal = (order) => {
    let total = 0;
    
    if (order.order_products && Array.isArray(order.order_products)) {
      order.order_products.forEach(item => {
        const itemTotal = parseFloat(item.total_price) || 0;
        total += itemTotal;
      });
    }
    
    if (order.order_packages && Array.isArray(order.order_packages)) {
      order.order_packages.forEach(item => {
        const itemTotal = parseFloat(item.total_price) || 0;
        total += itemTotal;
      });
    }
    
    return total;
  };

  if (loadingOrders && availableOrders.length === 0 && myOrders.length === 0 && pendingRequests.length === 0) {
    return (
      <animated.div style={animation} className={styles.container}>
        <RiderCard />
        <div className={styles.loading}>Cargando pedidos...</div>
      </animated.div>
    );
  }

  return (
    <animated.div style={animation} className={styles.container}>
      <RiderCard />
      
      <div className={styles.ordersSection}>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Disponibles
            {availableOrders.length > 0 && (
              <span className={styles.badge}>{availableOrders.length}</span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pendientes
            {pendingRequests.length > 0 && (
              <span className={styles.badge}>{pendingRequests.length}</span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'my-orders' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('my-orders')}
          >
            Mis Entregas
            {myOrders.length > 0 && (
              <span className={styles.badge}>{myOrders.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'available' && (
          <div className={styles.ordersGrid}>
            {availableOrders.length === 0 ? (
              <div className={styles.noOrders}>
                No hay pedidos disponibles en este momento
              </div>
            ) : (
              availableOrders.map(order => (
                <div 
                  key={order.id_order} 
                  className={`${styles.orderCard} ${selectedOrder?.id_order === order.id_order ? styles.selectedOrder : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>Pedido #{order.id_order}</span>
                      <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                    </div>
                    <div className={styles.orderStatus}>
                      {getStatusIcon(order.order_status)}
                      <span className={styles.statusText}>
                        {getStatusText(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.shopInfo}>
                    <Store size={16} />
                    <strong>{order.shop?.name_shop || 'Comercio'}</strong>
                  </div>

                  <div className={styles.locationInfo}>
                    <MapPin size={16} />
                    <span>{order.shop?.location_shop || 'Ubicación no disponible'}</span>
                  </div>

                  <div className={styles.deliveryInfo}>
                    <strong>Tipo:</strong> {order.delivery_type === 'delivery' ? 'A domicilio' : 'Recogida'}
                    {order.delivery_type === 'delivery' && order.delivery_address && (
                      <div className={styles.deliveryAddress}>
                        <MapPin size={14} />
                        {order.delivery_address}
                      </div>
                    )}
                  </div>

                  <div className={styles.orderTotal}>
                    <DollarSign size={16} />
                    <strong>Total:</strong> €{calculateOrderTotal(order).toFixed(2)}
                  </div>

                  {order.id_rider === currentUser.id_user && order.rider_accepted === false && (
                    <div className={styles.declinedBadge}>
                      Solicitud rechazada - Puedes volver a solicitar
                    </div>
                  )}

                  <button
                    className={styles.requestButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestOrder(order.id_order);
                    }}
                    disabled={requestingOrderId === order.id_order}
                  >
                    {requestingOrderId === order.id_order ? 'Solicitando...' : 'Solicitar Entrega'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className={styles.ordersGrid}>
            {pendingRequests.length === 0 ? (
              <div className={styles.noOrders}>
                No tienes solicitudes pendientes
              </div>
            ) : (
              pendingRequests.map(order => (
                <div 
                  key={order.id_order} 
                  className={`${styles.orderCard} ${styles.pendingOrderCard}`}
                >
                  <div className={styles.pendingBadge}>
                    <Clock size={16} />
                    Esperando respuesta del comercio
                  </div>
                  
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>Pedido #{order.id_order}</span>
                      <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                    </div>
                    <div className={styles.orderStatus}>
                      {getStatusIcon(order.order_status)}
                      <span className={styles.statusText}>
                        {getStatusText(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.shopInfo}>
                    <Store size={16} />
                    <strong>{order.shop?.name_shop || 'Comercio'}</strong>
                  </div>

                  <div className={styles.customerInfo}>
                    <strong>Cliente:</strong> {order.user?.name_user || 'Usuario'}
                  </div>

                  <div className={styles.deliveryInfo}>
                    <strong>Tipo:</strong> {order.delivery_type === 'delivery' ? 'A domicilio' : 'Recogida'}
                    {order.delivery_type === 'delivery' && order.delivery_address && (
                      <div className={styles.deliveryAddress}>
                        <MapPin size={14} />
                        {order.delivery_address}
                      </div>
                    )}
                  </div>

                  <div className={styles.orderTotal}>
                    <DollarSign size={16} />
                    <strong>Total:</strong> €{calculateOrderTotal(order).toFixed(2)}
                  </div>

                  <div className={styles.pendingMessage}>
                    Tu solicitud ha sido enviada. El comercio revisará y responderá pronto.
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my-orders' && (
          <div className={styles.ordersGrid}>
            {myOrders.length === 0 ? (
              <div className={styles.noOrders}>
                No tienes entregas activas
              </div>
            ) : (
              myOrders.map(order => (
                <div 
                  key={order.id_order} 
                  className={`${styles.orderCard} ${styles.myOrderCard}`}
                >
                  <div className={styles.acceptedBadge}>
                    <CheckCircle size={16} />
                    Asignado para entrega
                  </div>
                  
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>Pedido #{order.id_order}</span>
                      <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                    </div>
                    <div className={styles.orderStatus}>
                      {getStatusIcon(order.order_status)}
                      <span className={styles.statusText}>
                        {getStatusText(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.shopInfo}>
                    <Store size={16} />
                    <strong>{order.shop?.name_shop || 'Comercio'}</strong>
                  </div>

                  <div className={styles.customerInfo}>
                    <strong>Cliente:</strong> {order.user?.name_user || 'Usuario'}
                  </div>

                  <div className={styles.deliveryDetails}>
                    {order.delivery_type === 'delivery' ? (
                      <>
                        <strong>Entregar en:</strong>
                        <div className={styles.deliveryAddress}>
                          <MapPin size={14} />
                          {order.delivery_address}
                        </div>
                      </>
                    ) : (
                      <div className={styles.pickupInfo}>
                        <Package size={16} />
                        <span>Recogida en tienda</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.orderTotal}>
                    <DollarSign size={16} />
                    <strong>Total:</strong> €{calculateOrderTotal(order).toFixed(2)}
                  </div>

                  {order.order_notes && (
                    <div className={styles.orderNotes}>
                      <strong>Notas:</strong> {order.order_notes}
                    </div>
                  )}

                  <div className={styles.actionButtons}>
                    {order.order_status === 'ready' && (
                      <button
                        className={styles.deliverButton}
                        onClick={() => handleUpdateOrderStatus(order.id_order, 'delivered')}
                        disabled={updatingOrderId === order.id_order}
                      >
                        {updatingOrderId === order.id_order ? 'Actualizando...' : 'Marcar como Entregado'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default RiderOrdersManagement;