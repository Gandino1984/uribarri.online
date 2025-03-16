import React from 'react';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { Clock } from 'lucide-react';

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
      
      {/* Toggle for continuous or split schedule */}
      <div className={styles.scheduleTypeToggle} style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        gap: '8px'
      }}>
        <input 
          type="checkbox"
          id="continuous-schedule"
          checked={hasContinuousSchedule}
          onChange={handleScheduleTypeChange}
          style={{ marginRight: '8px' }}
        />
        <label htmlFor="continuous-schedule" style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.9rem',
          color: '#444'
        }}>
          <Clock size={16} />
          Horario continuo (sin periodo de descanso)
        </label>
      </div>
    
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {hasContinuousSchedule ? (
          // Continuous schedule: only show opening and closing
          <div className={styles.scheduleSimple} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* <h4 className={styles.scheduleTitle}>Horario de apertura y cierre</h4> */}
            <div className={styles.scheduleFields}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: '#555' }}>Abre:</label>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', color: '#555' }}>Cierra:</label>
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