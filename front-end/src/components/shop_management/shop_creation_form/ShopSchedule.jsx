import React from 'react';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { Clock } from 'lucide-react';
import CustomToggleSwitch from '../navigation_components/CustomToggleSwitch'; // UPDATE: Import custom toggle switch component

const ShopSchedule = ({ newShop, setNewShop, hasContinuousSchedule, setHasContinuousSchedule }) => {
  // Function to handle schedule type change
  const handleScheduleTypeChange = (e) => {
    const isContinuous = e.target.checked;
    setHasContinuousSchedule(isContinuous);
    
    if (isContinuous) {
      // If changed to continuous schedule, clear morning closing and afternoon opening fields
      setNewShop(prev => ({
        ...prev,
        morning_close: '',
        afternoon_open: ''
      }));
    }
  };

  return (
    <section className={styles.scheduleContainer}>
      <h2 className={styles.sectionTitle}>Horario de atención</h2>
      <p className={styles.sectionDescription}>
        Configura los horarios de apertura y cierre de tu comercio
      </p>
      
      {/* UPDATE: Replace standard checkbox with custom toggle switch */}
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
                <label className={styles.timeFieldLabel}>Abre:</label>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
              
              <div className={styles.timeFieldContainer}>
                <label className={styles.timeFieldLabel}>Cierra:</label>
                <input
                  type="time"
                  value={newShop.afternoon_close || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          // Schedule with rest period: show all 4 fields
          <>
            <div>
              <h4 className={styles.scheduleTitle}>Horario de la mañana</h4>
              <div className={styles.scheduleFields}>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
                <span>a</span>
                <input
                  type="time"
                  value={newShop.morning_close || ''}
                  onChange={(e) => setNewShop({...newShop, morning_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>

            <div>
              <h4 className={styles.scheduleTitle}>Horario de la tarde</h4>
              <div className={styles.scheduleFields}>
                <input
                  type="time"
                  value={newShop.afternoon_open || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
                <span>a</span>
                <input
                  type="time"
                  value={newShop.afternoon_close || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopSchedule;