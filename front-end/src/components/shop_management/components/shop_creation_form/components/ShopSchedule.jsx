import React from 'react';
import { Clock } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopCreationForm.module.css';
import CustomToggleSwitch from '../../../../navigation_components/CustomToggleSwitch';
import ShopDaysSelection from './ShopDaysSelection';
import ShopDeliveryToggle from './ShopDeliveryToggle';

const ShopSchedule = ({ newShop, setNewShop, hasContinuousSchedule, setHasContinuousSchedule }) => {
  // Function to handle schedule type change with proper boolean handling
  const handleScheduleTypeChange = (isChecked) => {
    console.log("Toggle switch changed to:", isChecked);
    // Update the continuous schedule state with the boolean value
    setHasContinuousSchedule(isChecked);
    
    if (isChecked) {
      // If changed to continuous schedule, clear morning closing and afternoon opening fields
      setNewShop(prev => ({
        ...prev,
        morning_close: '',
        afternoon_open: ''
      }));
    }
  };

  // Helper to format time for display
  const formatTimeDisplay = (time) => {
    if (!time) return '';
    return time;
  };

  return (
    <section className={styles.scheduleContainer}>
      <h2 className={styles.sectionTitle}>Horario y disponibilidad</h2>
      <p className={styles.sectionDescription}>
        Configura los horarios, días de apertura y servicios de tu comercio
      </p>
      
      <div className={styles.scheduleTypeToggleContainer}>
        <CustomToggleSwitch 
          checked={hasContinuousSchedule}
          onChange={handleScheduleTypeChange}
          leftLabel="Con descanso"
          rightLabel="Horario continuo"
        />
      </div>
    
      <div className={styles.scheduleContainer}>
        {hasContinuousSchedule ? (
          // Continuous schedule: only show opening and closing
          <div className={styles.scheduleSimple}>
            <div className={styles.scheduleFields}>
              <div className={styles.timeFieldContainer}>
                <label className={styles.timeFieldLabel}>
                  <Clock size={16} className={styles.timeIcon} />
                  Abre:
                </label>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={`${styles.timeInput} ${newShop.morning_open ? styles.hasValue : ''}`}
                  required
                />
              </div>
              
              <div className={styles.timeFieldContainer}>
                <label className={styles.timeFieldLabel}>
                  <Clock size={16} className={styles.timeIcon} />
                  Cierra:
                </label>
                <input
                  type="time"
                  value={newShop.afternoon_close || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                  className={`${styles.timeInput} ${newShop.afternoon_close ? styles.hasValue : ''}`}
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          // Schedule with rest period: show all 4 fields
          <>
            <div>
              <h4 className={styles.scheduleTitle}>
                <Clock size={16} className={styles.timeIcon} />
                Horario de la mañana
              </h4>
              <div className={styles.scheduleFields}>
                <div className={styles.timeFieldGroup}>
                  <label className={styles.timeFieldLabel}>Abre:</label>
                  <input
                    type="time"
                    value={newShop.morning_open || ''}
                    onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                    className={`${styles.timeInput} ${newShop.morning_open ? styles.hasValue : ''}`}
                    required
                  />
                  {/* {newShop.morning_open && (
                    <span className={styles.timeDisplay}>
                      {formatTimeDisplay(newShop.morning_open)}
                    </span>
                  )} */}
                </div>
                
                <span className={styles.timeSeparator}>a</span>
                
                <div className={styles.timeFieldGroup}>
                  <label className={styles.timeFieldLabel}>Cierra:</label>
                  <input
                    type="time"
                    value={newShop.morning_close || ''}
                    onChange={(e) => setNewShop({...newShop, morning_close: e.target.value})}
                    className={`${styles.timeInput} ${newShop.morning_close ? styles.hasValue : ''}`}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className={styles.scheduleTitle}>
                <Clock size={16} className={styles.timeIcon} />
                Horario de la tarde
              </h4>
              <div className={styles.scheduleFields}>
                <div className={styles.timeFieldGroup}>
                  <label className={styles.timeFieldLabel}>Abre:</label>
                  <input
                    type="time"
                    value={newShop.afternoon_open || ''}
                    onChange={(e) => setNewShop({...newShop, afternoon_open: e.target.value})}
                    className={`${styles.timeInput} ${newShop.afternoon_open ? styles.hasValue : ''}`}
                    required
                  />
                  {/* {newShop.afternoon_open && (
                    <span className={styles.timeDisplay}>
                      {formatTimeDisplay(newShop.afternoon_open)}
                    </span>
                  )} */}
                </div>
                
                <span className={styles.timeSeparator}>a</span>
                
                <div className={styles.timeFieldGroup}>
                  <label className={styles.timeFieldLabel}>Cierra:</label>
                  <input
                    type="time"
                    value={newShop.afternoon_close || ''}
                    onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                    className={`${styles.timeInput} ${newShop.afternoon_close ? styles.hasValue : ''}`}
                    required
                  />
                  {/* {newShop.afternoon_close && (
                    <span className={styles.timeDisplay}>
                      {formatTimeDisplay(newShop.afternoon_close)}
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* UPDATE: Added days of week selection */}
      <ShopDaysSelection newShop={newShop} setNewShop={setNewShop} />
      
      {/* UPDATE: Added delivery service toggle */}
      <ShopDeliveryToggle newShop={newShop} setNewShop={setNewShop} />
    </section>
  );
};

export default ShopSchedule;