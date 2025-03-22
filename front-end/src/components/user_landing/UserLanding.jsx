import React, { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Store, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import styles from './UserLanding.module.css';

const UserLanding = () => {
  // UPDATE: Using specialized context hooks instead of AppContext
  const { currentUser } = useAuth();
  const { setSelectedShopType } = useShop();

  // Main container animation
  const containerAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 },
  });

  // Section animations with delay for staggered effect
  const section1Animation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 100,
    config: { tension: 280, friction: 60 },
  });

  const section2Animation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 280, friction: 60 },
  });

  const section3Animation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300,
    config: { tension: 280, friction: 60 },
  });

  // Handle section selection
  const handleSelectSection = (sectionType) => {
    setSelectedShopType(sectionType);
    // Additional navigation logic could go here
    console.log(`Selected section: ${sectionType}`);
  };

  return (
    <animated.div style={containerAnimation} className={styles.container}>
      <div className={styles.sectionsContainer}>
        {/* Commercial Showcase Section */}
        <animated.div 
          style={section1Animation} 
          className={`${styles.section} ${styles.commercialSection}`}
          onClick={() => handleSelectSection('commercial')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <Store size={40} />
            </div>
            <h2>Escaparate Comercial</h2>
            <p>Descubre productos locales, ofertas y promociones especiales de comercios cercanos.</p>
            <button className={styles.sectionButton}>
              Explorar Comercios
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>

        {/* Cultural Agenda Section */}
        <animated.div 
          style={section2Animation} 
          className={`${styles.section} ${styles.culturalSection}`}
          onClick={() => handleSelectSection('cultural')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <Calendar size={40} />
            </div>
            <h2>Agenda Cultural</h2>
            <p>Eventos, actividades y experiencias culturales para todos los gustos en tu localidad.</p>
            <button className={styles.sectionButton}>
              Ver Eventos
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>

        {/* Magazine Section */}
        <animated.div 
          style={section3Animation} 
          className={`${styles.section} ${styles.magazineSection}`}
          onClick={() => handleSelectSection('magazine')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <BookOpen size={40} />
            </div>
            <h2>Revista Berimbolo</h2>
            <p>Artículos, entrevistas y noticias sobre la vida local, cultura y gastronomía.</p>
            <button className={styles.sectionButton}>
              Leer Revista
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>
      </div>
    </animated.div>
  );
};

export default UserLanding;