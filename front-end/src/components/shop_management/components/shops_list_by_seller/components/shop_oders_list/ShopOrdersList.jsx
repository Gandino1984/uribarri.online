import React, { useState, useEffect } from 'react';
import { useOrder } from '../../../../../../app_context/OrderContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useSpring, animated } from '@react-spring/web';
import { Clock, CheckCircle, Package, XCircle, Truck, AlertCircle, User } from 'lucide-react';
import styles from '../../../../../../../../public/css/ShopOrdersList.module.css';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';

const ShopOrdersList = ({ onClose }) => {
  const { selectedShop } = useShop();
  const { shopOrders, fetchShopOrders, updateOrderStatus, loadingOrders } = useOrder();
  const { setError, setSuccess } = useUI();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [pendingRiderRequests, setPendingRiderRequests] = useState([]);
  const [processingRiderRequest, setProcessingRiderRequest] = useState(null);

  // Animation for component entrance
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 25 }
  });

  // Fetch orders when component mounts or selected shop changes
  useEffect(() => {
    if (selectedShop?.id_shop) {
      fetchShopOrders(selectedShop.id_shop);
    }
  }, [selectedShop?.id_shop]);
  
  // Effect to filter orders with pending rider requests
  useEffect(() => {
    if (shopOrders && shopOrders.length > 0) {
      const ordersWithPendingRequests = shopOrders.filter(order => 
        order.id_rider && order.rider_accepted === null
      );
      setPendingRiderRequests(ordersWithPendingRequests);
    } else {
      setPendingRiderRequests([]);
    }
  }, [shopOrders]);

  // Poll for new orders every 30 seconds
  useEffect(() => {
    if (!selectedShop?.id_shop) return;

    const interval = setInterval(() => {
      fetchShopOrders(selectedShop.id_shop);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedShop?.id_shop]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className={styles.statusIconPending} />;
      case 'confirmed':
        return <CheckCircle size={16} className={styles.statusIconConfirmed} />;
      case 'preparing':
        return <Package size={16} className={styles.statusIconPreparing} />;
      case 'ready':
        return <AlertCircle size={16} className={styles.statusIconReady} />;
      case 'delivered':
        return <Truck size={16} className={styles.statusIconDelivered} />;
      case 'cancelled':
        return <XCircle size={16} className={styles.statusIconCancelled} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'ready': 'Listo',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        setSuccess({ orderSuccess: `Estado actualizado a ${getStatusText(newStatus)}` });
        // Refresh orders
        await fetchShopOrders(selectedShop.id_shop);
      }
    } catch (error) {
      setError({ orderError: 'Error al actualizar el estado del pedido' });
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  // Handle rider request response (accept/decline)
  const handleRiderRequestResponse = async (orderId, riderId, accepted) => {
    setProcessingRiderRequest(`${orderId}-${accepted ? 'accept' : 'decline'}`);
    try {
      const response = await axiosInstance.patch(`/order/rider-response/${orderId}`, {
        id_rider: riderId,
        accepted: accepted
      });
      
      if (response.data.error) {
        setError({ orderError: response.data.error });
      } else {
        setSuccess({ 
          orderSuccess: accepted 
            ? 'Repartidor aceptado' 
            : 'Solicitud de repartidor rechazada' 
        });
        // Refresh orders
        await fetchShopOrders(selectedShop.id_shop);
      }
    } catch (error) {
      setError({ orderError: 'Error al procesar la solicitud del repartidor' });
    } finally {
      setProcessingRiderRequest(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (order) => {
    let total = 0;
    
    // Add products total
    if (order.order_products && Array.isArray(order.order_products)) {
      order.order_products.forEach(item => {
        const itemTotal = parseFloat(item.total_price) || 0;
        total += itemTotal;
      });
    }
    
    // Add packages total
    if (order.order_packages && Array.isArray(order.order_packages)) {
      order.order_packages.forEach(item => {
        const itemTotal = parseFloat(item.total_price) || 0;
        total += itemTotal;
      });
    }
    
    // If order has a total_price property, use it as fallback
    if (total === 0 && order.total_price) {
      total = parseFloat(order.total_price) || 0;
    }
    
    return total;
  };

  if (loadingOrders) {
    return (
      <animated.div style={animation} className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Pedidos del Comercio</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.loading}>Cargando pedidos...</div>
      </animated.div>
    );
  }

  return (
    <animated.div style={animation} className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Pedidos del Comercio
          {pendingRiderRequests.length > 0 && (
            <span className={styles.pendingRequestsBadge}>
              {pendingRiderRequests.length} solicitud{pendingRiderRequests.length > 1 ? 'es' : ''} de repartidor
            </span>
          )}
        </h2>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>

      {shopOrders.length === 0 ? (
        <div className={styles.noOrders}>
          No hay pedidos para este comercio
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {shopOrders.map(order => (
            <div 
              key={order.id_order} 
              className={`${styles.orderCard} ${selectedOrder?.id_order === order.id_order ? styles.selectedOrder : ''} ${order.id_rider && order.rider_accepted === null ? styles.orderWithRiderRequest : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderId}>Pedido #{order.id_order}</span>
                  <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                </div>
                <div className={styles.orderStatus}>
                  {getStatusIcon(order.order_status)}
                  <span className={`${styles.statusText} ${styles[`status${order.order_status}`]}`}>
                    {getStatusText(order.order_status)}
                  </span>
                </div>
              </div>

              <div className={styles.customerInfo}>
                <strong>Cliente:</strong> {order.user?.name_user || 'Usuario desconocido'}
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.deliveryInfo}>
                  <strong>Tipo de entrega:</strong> {order.delivery_type === 'delivery' ? 'A domicilio' : 'Recogida en tienda'}
                  {order.delivery_type === 'delivery' && order.delivery_address && (
                    <div className={styles.deliveryAddress}>
                      <strong>Dirección:</strong> {order.delivery_address}
                    </div>
                  )}
                </div>

                <div className={styles.orderTotal}>
                  <strong>Total:</strong> €{calculateOrderTotal(order).toFixed(2)}
                </div>
              </div>

              {order.order_notes && (
                <div className={styles.orderNotes}>
                  <strong>Notas:</strong> {order.order_notes}
                </div>
              )}
              
              {/* Show rider request section if there's a pending request */}
              {order.id_rider && order.rider_accepted === null && (
                <div className={styles.riderRequestSection}>
                  <div className={styles.riderRequestHeader}>
                    <AlertCircle size={16} className={styles.requestIcon} />
                    <strong>Solicitud de repartidor</strong>
                  </div>
                  <div className={styles.riderInfo}>
                    <User size={16} />
                    <span>Repartidor: {order.rider?.name_rider || `ID: ${order.id_rider}`}</span>
                  </div>
                  <div className={styles.riderRequestButtons}>
                    <button
                      className={styles.acceptButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRiderRequestResponse(order.id_order, order.id_rider, true);
                      }}
                      disabled={processingRiderRequest === `${order.id_order}-accept`}
                    >
                      {processingRiderRequest === `${order.id_order}-accept` ? 'Aceptando...' : 'Aceptar'}
                    </button>
                    <button
                      className={styles.declineButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRiderRequestResponse(order.id_order, order.id_rider, false);
                      }}
                      disabled={processingRiderRequest === `${order.id_order}-decline`}
                    >
                      {processingRiderRequest === `${order.id_order}-decline` ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Show accepted rider info */}
              {order.id_rider && order.rider_accepted === true && (
                <div className={styles.acceptedRiderInfo}>
                  <Truck size={16} />
                  <span>Repartidor asignado: {order.rider?.name_rider || 'Repartidor'}</span>
                </div>
              )}

              {/* Show rejected rider info */}
              {order.id_rider && order.rider_accepted === false && (
                <div className={styles.rejectedRiderInfo}>
                  <XCircle size={16} />
                  <span>Solicitud de repartidor rechazada</span>
                </div>
              )}

              {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                <div className={styles.actionButtons}>
                  {getNextStatus(order.order_status) && (
                    <button
                      className={styles.updateButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id_order, getNextStatus(order.order_status));
                      }}
                      disabled={updatingOrderId === order.id_order}
                    >
                      {updatingOrderId === order.id_order ? 'Actualizando...' : `Marcar como ${getStatusText(getNextStatus(order.order_status))}`}
                    </button>
                  )}
                  
                  <button
                    className={styles.cancelButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order.id_order, 'cancelled');
                    }}
                    disabled={updatingOrderId === order.id_order}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {selectedOrder?.id_order === order.id_order && (
                <div className={styles.expandedDetails}>
                  <h4>Productos del pedido:</h4>
                  {order.order_products?.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <span>{item.product?.name_product || 'Producto'}</span>
                      <span>x{item.quantity}</span>
                      <span>€{(parseFloat(item.total_price) || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {order.order_packages?.length > 0 && (
                    <>
                      <h4>Paquetes del pedido:</h4>
                      {order.order_packages.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          <span>{item.package?.name_package || 'Paquete'}</span>
                          <span>x{item.quantity}</span>
                          <span>€{(parseFloat(item.total_price) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </animated.div>
  );
};

export default ShopOrdersList;