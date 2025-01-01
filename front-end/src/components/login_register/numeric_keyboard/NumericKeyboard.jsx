import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import { useNumericKeyboardFunctions } from './hooks/useNumericKeyboardFunctions.jsx';
import { Delete, RotateCcw } from 'lucide-react';
import styles from './NumericKeyboard.module.css';
import { Banana, Apple, Bean, Beef, Carrot, Beer, Croissant, Drill, Dog, Fish, Drumstick, Gift, Gem, Ham, Palette, Printer, Wrench, Car, Scissors, HeartPulse, BookMarked, Mouse, Cpu, Laptop, Smile, ChefHat, Laugh, Lollipop, Cake, Pizza, ShoppingBasket, Speaker, Amphora, ConciergeBell, Flower, Baby, Shirt, Watch, Sandwich } from 'lucide-react';

const NumericKeyboard = ({ 
  value, 
  onChange, 
  showMaskedPassword = true, 
  onPasswordComplete, 
  error = false 
}) => {

  const {
    MAX_PASSWORD_LENGTH,
    displayedPassword,
    setDisplayedPassword,
    isLoggingIn,
    password,
    passwordRepeat,
    showPasswordRepeat,
    setUsernameError,
    setPasswordError
  } = useContext(AppContext);

  const icons = [Banana, Apple, Bean, Beef, Carrot, Beer, Croissant, Drill, Dog, Fish, Drumstick, Gift, Gem, Ham, Palette, Printer, Wrench, Car, Scissors, HeartPulse, BookMarked, Mouse, Cpu, Laptop, Smile, ChefHat, Laugh, Lollipop, Cake, Pizza, ShoppingBasket, Speaker, Amphora, ConciergeBell, Flower, Baby, Shirt, Watch, Sandwich];

  const [passwordIcons, setPasswordIcons] = useState([]);

  useEffect(() => {
    if (showMaskedPassword) {
      if (passwordIcons.length < value.length) {
        const newIcons = Array(value.length - passwordIcons.length).fill().map(() => icons[Math.floor(Math.random() * icons.length)]);
        setPasswordIcons([...passwordIcons, ...newIcons]);
      } else if (passwordIcons.length > value.length) {
        setPasswordIcons(passwordIcons.slice(0, value.length));
      }
    } else {
      setPasswordIcons([]);
    }
  }, [value, showMaskedPassword]);

  useEffect(() => {
    if (showMaskedPassword) {
      setDisplayedPassword(passwordIcons.map((Icon, index) => <Icon key={index} size={16} />));
    } else {
      setDisplayedPassword(value);
    }
  }, [passwordIcons, showMaskedPassword]);

  const {
    handleKeyClick,
    handleBackspace,
    handleClearPassword,
    handleClear
  } = useNumericKeyboardFunctions(value, onChange, onPasswordComplete);

  const handleBackspaceClick = (event) => {
    handleBackspace(event);
    if (error) {
      setUsernameError('');
      setPasswordError('');
    }
  };

  return (
      <div className={styles.container}>
            <div className={`${styles.passwordDisplay} ${error ? 'text-red-500' : ''}`}>
                {displayedPassword}
            </div>

            <div className={styles.keyboard}>
                  <div className={styles.row}>
                      {[1, 2, 3].map(num => (
                          <button 
                            key={num} 
                            className={styles.key} 
                            onClick={(e) => handleKeyClick(num.toString(), e)}
                          >
                              {num}
                          </button>
                      ))}
                  </div>
                  <div className={styles.row}>
                      {[4, 5, 6].map(num => (
                          <button 
                            key={num} 
                            className={styles.key} 
                            onClick={(e) => handleKeyClick(num.toString(), e)}
                          >
                              {num}
                          </button>
                      ))}
                  </div>
                  <div className={styles.row}>
                      {[7, 8, 9].map(num => (
                          <button 
                            key={num} 
                            className={styles.key} 
                            onClick={(e) => handleKeyClick(num.toString(), e)}
                          >
                              {num}
                          </button>
                      ))}
                  </div>
                  <div className={styles.row}>
                      <button 
                        className={`${styles.key} ${styles.zero}`} 
                        onClick={(e) => handleKeyClick('0', e)}
                      >
                          0
                      </button>
                      <button 
                        className={`${styles.key} ${styles.clear}`} 
                        onClick={(e) => handleBackspaceClick(e)}
                      >
                            <Delete size={24} />
                      </button>
                  </div>
            </div>
    </div>
  );
};

export default NumericKeyboard;