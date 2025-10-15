import React from 'react';
import styles from '../../../../../../css/ShopCreationForm.module.css';
import { Calendar } from 'lucide-react';

// Component for selecting which days of the week the shop is open
const ShopDaysSelection = ({ newShop, setNewShop }) => {
  // UPDATE: Added days of week selection component
  const days = [
    { key: 'open_monday', label: 'Lunes' },
    { key: 'open_tuesday', label: 'Martes' },
    { key: 'open_wednesday', label: 'Miércoles' },
    { key: 'open_thursday', label: 'Jueves' },
    { key: 'open_friday', label: 'Viernes' },
    { key: 'open_saturday', label: 'Sábado' },
    { key: 'open_sunday', label: 'Domingo' }
  ];

  const handleDayToggle = (day) => {
    setNewShop({
      ...newShop,
      [day]: !newShop[day]
    });
  };

  return (
    <div className={styles.daysSelectionContainer}>
      <h4 className={styles.sectionTitle}>
        <Calendar size={16} className={styles.timeIcon} />
        Días de apertura
      </h4>
      <div className={styles.daysGrid}>
        {days.map(day => (
          <div key={day.key} className={styles.dayToggle}>
            <input
              type="checkbox"
              id={day.key}
              checked={newShop[day.key] !== undefined ? newShop[day.key] : day.key !== 'open_sunday'}
              onChange={() => handleDayToggle(day.key)}
              className={styles.dayCheckbox}
            />
            <label htmlFor={day.key} className={styles.dayLabel}>
              {day.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopDaysSelection;