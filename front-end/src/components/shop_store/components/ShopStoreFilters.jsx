import { useState, useEffect } from 'react';
import { Search, Filter, X, Percent, Star, Package, Clock, ChevronDown } from 'lucide-react';
import styles from '../../../../css/ShopStoreFilters.module.css';

const ShopStoreFilters = ({ 
  products, 
  packages, 
  orders,
  onProductsFilter,
  onPackagesFilter,
  onOrdersFilter,
  activeTab
}) => {
  //update: State for filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  //update: Separate search states for each tab
  const [productSearch, setProductSearch] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  
  //update: Product filters
  const [productFilters, setProductFilters] = useState({
    priceRange: { min: '', max: '' },
    hasDiscount: false,
    minRating: 0,
    category: '',
    sortBy: 'name' // name, price_asc, price_desc, rating
  });
  
  //update: Package filters
  const [packageFilters, setPackageFilters] = useState({
    priceRange: { min: '', max: '' },
    hasDiscount: false,
    productCount: 'all', // all, 2, 3, 4, 5
    sortBy: 'name' // name, price_asc, price_desc, discount
  });
  
  //update: Order filters
  const [orderFilters, setOrderFilters] = useState({
    status: 'all', // all, pending, confirmed, preparing, ready, delivered, cancelled
    dateRange: 'all', // all, today, week, month
    sortBy: 'recent' // recent, oldest, total_asc, total_desc
  });
  
  //update: Extract unique categories from products
  const productCategories = [...new Set(products?.map(p => p.type_product).filter(Boolean))];
  
  //update: Apply filters to products
  useEffect(() => {
    if (!products) return;
    
    let filtered = [...products];
    
    // Search filter
    if (productSearch.trim()) {
      const searchLower = productSearch.toLowerCase();
      filtered = filtered.filter(product => 
        product.name_product?.toLowerCase().includes(searchLower) ||
        product.info_product?.toLowerCase().includes(searchLower) ||
        product.type_product?.toLowerCase().includes(searchLower)
      );
    }
    
    // Price range filter
    if (productFilters.priceRange.min) {
      filtered = filtered.filter(p => p.price_product >= parseFloat(productFilters.priceRange.min));
    }
    if (productFilters.priceRange.max) {
      filtered = filtered.filter(p => p.price_product <= parseFloat(productFilters.priceRange.max));
    }
    
    // Discount filter
    if (productFilters.hasDiscount) {
      filtered = filtered.filter(p => p.discount_product > 0);
    }
    
    // Rating filter
    if (productFilters.minRating > 0) {
      filtered = filtered.filter(p => (p.calification_product || 0) >= productFilters.minRating);
    }
    
    // Category filter
    if (productFilters.category) {
      filtered = filtered.filter(p => p.type_product === productFilters.category);
    }
    
    // Sorting
    switch (productFilters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price_product - b.price_product);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price_product - a.price_product);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.calification_product || 0) - (a.calification_product || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name_product?.localeCompare(b.name_product));
        break;
    }
    
    onProductsFilter(filtered);
  }, [products, productSearch, productFilters, onProductsFilter]);
  
  //update: Apply filters to packages
  useEffect(() => {
    if (!packages) return;
    
    let filtered = [...packages];
    
    // Search filter
    if (packageSearch.trim()) {
      const searchLower = packageSearch.toLowerCase();
      filtered = filtered.filter(pkg => {
        const nameMatch = pkg.name_package?.toLowerCase().includes(searchLower);
        const productMatch = [pkg.product1, pkg.product2, pkg.product3, pkg.product4, pkg.product5]
          .filter(Boolean)
          .some(product => product.name_product?.toLowerCase().includes(searchLower));
        return nameMatch || productMatch;
      });
    }
    
    // Price range filter
    if (packageFilters.priceRange.min) {
      filtered = filtered.filter(p => {
        const price = p.discounted_price || p.total_price || p.price_package || 0;
        return price >= parseFloat(packageFilters.priceRange.min);
      });
    }
    if (packageFilters.priceRange.max) {
      filtered = filtered.filter(p => {
        const price = p.discounted_price || p.total_price || p.price_package || 0;
        return price <= parseFloat(packageFilters.priceRange.max);
      });
    }
    
    // Discount filter
    if (packageFilters.hasDiscount) {
      filtered = filtered.filter(p => p.discount_package > 0);
    }
    
    // Product count filter
    if (packageFilters.productCount !== 'all') {
      const count = parseInt(packageFilters.productCount);
      filtered = filtered.filter(p => {
        const productCount = [p.id_product1, p.id_product2, p.id_product3, p.id_product4, p.id_product5]
          .filter(id => id !== null).length;
        return productCount === count;
      });
    }
    
    // Sorting
    switch (packageFilters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const priceA = a.discounted_price || a.total_price || a.price_package || 0;
          const priceB = b.discounted_price || b.total_price || b.price_package || 0;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const priceA = a.discounted_price || a.total_price || a.price_package || 0;
          const priceB = b.discounted_price || b.total_price || b.price_package || 0;
          return priceB - priceA;
        });
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount_package || 0) - (a.discount_package || 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => (a.name_package || '').localeCompare(b.name_package || ''));
        break;
    }
    
    onPackagesFilter(filtered);
  }, [packages, packageSearch, packageFilters, onPackagesFilter]);
  
  //update: Apply filters to orders
  useEffect(() => {
    if (!orders) return;
    
    let filtered = [...orders];
    
    // Search filter
    if (orderSearch.trim()) {
      const searchLower = orderSearch.toLowerCase();
      filtered = filtered.filter(order => {
        const idMatch = order.id_order?.toString().includes(searchLower);
        const productMatch = order.order_products?.some(item => 
          item.product?.name_product?.toLowerCase().includes(searchLower)
        );
        const packageMatch = order.order_packages?.some(item => 
          item.package?.name_package?.toLowerCase().includes(searchLower)
        );
        return idMatch || productMatch || packageMatch;
      });
    }
    
    // Status filter
    if (orderFilters.status !== 'all') {
      filtered = filtered.filter(o => o.order_status === orderFilters.status);
    }
    
    // Date range filter
    if (orderFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        switch (orderFilters.dateRange) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    // Sorting
    switch (orderFilters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'total_asc':
        filtered.sort((a, b) => (parseFloat(a.total_price) || 0) - (parseFloat(b.total_price) || 0));
        break;
      case 'total_desc':
        filtered.sort((a, b) => (parseFloat(b.total_price) || 0) - (parseFloat(a.total_price) || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    onOrdersFilter(filtered);
  }, [orders, orderSearch, orderFilters, onOrdersFilter]);
  
  //update: Reset filters for current tab
  const handleResetFilters = () => {
    switch (activeTab) {
      case 'products':
        setProductSearch('');
        setProductFilters({
          priceRange: { min: '', max: '' },
          hasDiscount: false,
          minRating: 0,
          category: '',
          sortBy: 'name'
        });
        break;
      case 'packages':
        setPackageSearch('');
        setPackageFilters({
          priceRange: { min: '', max: '' },
          hasDiscount: false,
          productCount: 'all',
          sortBy: 'name'
        });
        break;
      case 'orders':
        setOrderSearch('');
        setOrderFilters({
          status: 'all',
          dateRange: 'all',
          sortBy: 'recent'
        });
        break;
    }
  };
  
  //update: Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    
    switch (activeTab) {
      case 'products':
        if (productSearch) count++;
        if (productFilters.priceRange.min || productFilters.priceRange.max) count++;
        if (productFilters.hasDiscount) count++;
        if (productFilters.minRating > 0) count++;
        if (productFilters.category) count++;
        if (productFilters.sortBy !== 'name') count++;
        break;
      case 'packages':
        if (packageSearch) count++;
        if (packageFilters.priceRange.min || packageFilters.priceRange.max) count++;
        if (packageFilters.hasDiscount) count++;
        if (packageFilters.productCount !== 'all') count++;
        if (packageFilters.sortBy !== 'name') count++;
        break;
      case 'orders':
        if (orderSearch) count++;
        if (orderFilters.status !== 'all') count++;
        if (orderFilters.dateRange !== 'all') count++;
        if (orderFilters.sortBy !== 'recent') count++;
        break;
    }
    
    return count;
  };
  
  return (
    <div className={styles.filtersContainer}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder={
            activeTab === 'products' ? 'Buscar productos...' :
            activeTab === 'packages' ? 'Buscar paquetes...' :
            'Buscar pedidos...'
          }
          value={
            activeTab === 'products' ? productSearch :
            activeTab === 'packages' ? packageSearch :
            orderSearch
          }
          onChange={(e) => {
            if (activeTab === 'products') setProductSearch(e.target.value);
            else if (activeTab === 'packages') setPackageSearch(e.target.value);
            else setOrderSearch(e.target.value);
          }}
          className={styles.searchInput}
        />
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
        >
          <Filter size={20} />
          {getActiveFilterCount() > 0 && (
            <span className={styles.filterBadge}>{getActiveFilterCount()}</span>
          )}
        </button>
      </div>
      
      {/* Collapsible Filters */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h3>Filtros</h3>
            <button onClick={() => setShowFilters(false)} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.filterContent}>
            {/* Product Filters */}
            {activeTab === 'products' && (
              <>
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Rango de Precio</label>
                  <div className={styles.priceRange}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={productFilters.priceRange.min}
                      onChange={(e) => setProductFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: e.target.value }
                      }))}
                      className={styles.priceInput}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={productFilters.priceRange.max}
                      onChange={(e) => setProductFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: e.target.value }
                      }))}
                      className={styles.priceInput}
                    />
                  </div>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={productFilters.hasDiscount}
                      onChange={(e) => setProductFilters(prev => ({
                        ...prev,
                        hasDiscount: e.target.checked
                      }))}
                    />
                    <Percent size={16} />
                    Solo con descuento
                  </label>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Categoría</label>
                  <select
                    value={productFilters.category}
                    onChange={(e) => setProductFilters(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="">Todas las categorías</option>
                    {productCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Calificación mínima</label>
                  <div className={styles.ratingFilter}>
                    {[0, 1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setProductFilters(prev => ({
                          ...prev,
                          minRating: rating
                        }))}
                        className={`${styles.ratingButton} ${productFilters.minRating === rating ? styles.active : ''}`}
                      >
                        {rating === 0 ? 'Todas' : `${rating}★`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Ordenar por</label>
                  <select
                    value={productFilters.sortBy}
                    onChange={(e) => setProductFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="name">Nombre</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor Calificación</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Package Filters */}
            {activeTab === 'packages' && (
              <>
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Rango de Precio</label>
                  <div className={styles.priceRange}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={packageFilters.priceRange.min}
                      onChange={(e) => setPackageFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: e.target.value }
                      }))}
                      className={styles.priceInput}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={packageFilters.priceRange.max}
                      onChange={(e) => setPackageFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: e.target.value }
                      }))}
                      className={styles.priceInput}
                    />
                  </div>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={packageFilters.hasDiscount}
                      onChange={(e) => setPackageFilters(prev => ({
                        ...prev,
                        hasDiscount: e.target.checked
                      }))}
                    />
                    <Percent size={16} />
                    Solo con descuento
                  </label>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Número de productos</label>
                  <select
                    value={packageFilters.productCount}
                    onChange={(e) => setPackageFilters(prev => ({
                      ...prev,
                      productCount: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos</option>
                    <option value="2">2 productos</option>
                    <option value="3">3 productos</option>
                    <option value="4">4 productos</option>
                    <option value="5">5 productos</option>
                  </select>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Ordenar por</label>
                  <select
                    value={packageFilters.sortBy}
                    onChange={(e) => setPackageFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="name">Nombre</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                    <option value="discount">Mayor Descuento</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Order Filters */}
            {activeTab === 'orders' && (
              <>
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Estado del pedido</label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) => setOrderFilters(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="preparing">Preparando</option>
                    <option value="ready">Listo</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Período</label>
                  <select
                    value={orderFilters.dateRange}
                    onChange={(e) => setOrderFilters(prev => ({
                      ...prev,
                      dateRange: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoy</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                  </select>
                </div>
                
                <div className={styles.filterSection}>
                  <label className={styles.filterLabel}>Ordenar por</label>
                  <select
                    value={orderFilters.sortBy}
                    onChange={(e) => setOrderFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className={styles.filterSelect}
                  >
                    <option value="recent">Más reciente</option>
                    <option value="oldest">Más antiguo</option>
                    <option value="total_asc">Total: Menor a Mayor</option>
                    <option value="total_desc">Total: Mayor a Menor</option>
                  </select>
                </div>
              </>
            )}
            
            <button
              onClick={handleResetFilters}
              className={styles.resetButton}
            >
              Limpiar Filtros
              {getActiveFilterCount() > 0 && (
                <span className={styles.filterCount}>({getActiveFilterCount()})</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopStoreFilters;