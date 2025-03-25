// src/components/landing_page/LandingPage.jsx
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Store, Calendar, BookOpen } from 'lucide-react';
import styles from './LandingPage.module.css'; // Reusing existing styles

const LandingPage = ({ onProceedToLogin }) => {
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

  return (
    <animated.div style={containerAnimation} className={styles.container}>
      <div className={styles.welcomeHeader}>
        <h1>¡Bienvenid@ a tu barrio online!</h1>
        <p>Descubre y conecta con negocios locales, eventos culturales y la actualidad de tu comunidad.</p>
      </div>
      
      <div className={styles.sectionsContainer}>
        {/* Commercial Showcase Section */}
        <animated.div 
          style={section1Animation} 
          className={`${styles.section} ${styles.commercialSection}`}
          onClick={onProceedToLogin}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <Store size={40} />
            </div>
            <h2>Escaparate Comercial</h2>
            <p>Descubre productos locales, ofertas y promociones especiales de comercios cercanos.</p>
            <button className={styles.sectionButton}>
              Comenzar
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>

        {/* Cultural Agenda Section */}
        <animated.div 
          style={section2Animation} 
          className={`${styles.section} ${styles.culturalSection}`}
          onClick={onProceedToLogin}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <Calendar size={40} />
            </div>
            <h2>Agenda Cultural</h2>
            <p>Eventos, actividades y experiencias culturales para todos los gustos en tu localidad.</p>
            <button className={styles.sectionButton}>
              Comenzar
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>

        {/* Magazine Section */}
        <animated.div 
          style={section3Animation} 
          className={`${styles.section} ${styles.magazineSection}`}
          onClick={onProceedToLogin}
        >
          <div className={styles.sectionContent}>
            <div className={styles.iconWrapper}>
              <BookOpen size={40} />
            </div>
            <h2>Revista Ache</h2>
            <p>Artículos, entrevistas y noticias sobre la vida local, cultura y gastronomía.</p>
            <button className={styles.sectionButton}>
              Comenzar
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
        </animated.div>
      </div>
    </animated.div>
  );
};

export default LandingPage;