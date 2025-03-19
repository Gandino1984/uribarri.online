import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../../../../../public/css/ShopCard.module.css';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ShopMap = ({ shop, isSmallScreen, onBack }) => {
  // Default position is Uribarri neighborhood in Bilbao
  const defaultPosition = [43.26690065903094, -2.921624779164401];
  const [position, setPosition] = useState(defaultPosition);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView(defaultPosition, 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
      
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

  // UPDATE: Force map resize when component mounts and when layout changes
  useEffect(() => {
    // Initial resize
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      
      // Additional resize after a short delay to ensure container has rendered
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
      
      // For mobile devices, add an additional resize after a longer delay
      // to handle fullscreen transitions
      if (isSmallScreen) {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            // Recenter the map if position is available
            if (markerRef.current) {
              const latLng = markerRef.current.getLatLng();
              mapInstanceRef.current.setView(latLng, 15);
            }
          }
        }, 500);
      }
    }
  }, [isSmallScreen]);

  // UPDATE: Enhanced mobile view with fullscreen map
  return (
    <div className={styles.mapContainer}>
      {isSmallScreen && (
        <button 
          className={styles.backButton} 
          onClick={onBack}
          title="Volver a la información de la tienda"
          aria-label="Volver a la información de la tienda"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div ref={mapRef} className={styles.mapCanvas} />
    </div>
  );
};

export default ShopMap;