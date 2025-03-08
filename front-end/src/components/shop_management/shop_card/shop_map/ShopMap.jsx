import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../../../../../public/css/ShopMap.module.css';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ShopMap = ({ shop, isSmallScreen, onBack, style }) => {
  // Default position is Uribarri neighborhood in Bilbao
  const defaultPosition = [43.26690065903094, -2.921624779164401];
  const [position, setPosition] = useState(defaultPosition);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  // Spring animation for the map component
  const mapAnimation = useSpring({
    from: { opacity: 0, transform: isSmallScreen ? 'translateY(50px)' : 'translateX(50px)' },
    to: { opacity: 1, transform: 'translateY(0px) translateX(0px)' },
    config: { tension: 280, friction: 30 }
  });

  // Combined spring animations
  const combinedStyle = {
    ...mapAnimation,
    ...style
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultPosition, 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add initial marker
      markerRef.current = L.marker(defaultPosition).addTo(mapInstanceRef.current);
      markerRef.current.bindPopup(shop?.name_shop || 'Tienda').openPopup();
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Search for location when shop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const locationToSearch = shop?.location_shop;
    if (!locationToSearch || locationToSearch === 'default') return;
    
    const searchLocation = async () => {
      try {
        // Encode the address for URL
        const encodedLocation = encodeURIComponent(locationToSearch);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}`);
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const newPosition = [parseFloat(lat), parseFloat(lon)];
          
          // Update position state
          setPosition(newPosition);
          
          // Update map view
          mapInstanceRef.current.setView(newPosition, 15);
          
          // Update marker position
          if (markerRef.current) {
            markerRef.current.setLatLng(newPosition);
            markerRef.current.bindPopup(`${shop?.name_shop || 'Tienda'}<br/>${locationToSearch}`).openPopup();
          }
        } else {
          console.log('Location not found:', locationToSearch);
        }
      } catch (error) {
        console.error('Error searching for location:', error);
      }
    };

    searchLocation();
  }, [shop]);

  // Update map size when component layout changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  });

  return (
    <animated.div style={combinedStyle} className={styles.mapContainer}>
      {/* UPDATE: Back button for small screens */}
      {isSmallScreen && (
        <button 
          className={styles.backButton} 
          onClick={onBack}
          title="Volver a la información de la tienda"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '300px' }} />
    </animated.div>
  );
};

export default ShopMap;