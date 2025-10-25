// FloatingVideoButton.jsx - Floating help button for pages without TopBar
import { PlayCircle } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import { getVideoByContext } from '../../config/videoTutorials.js';
import styles from '../../../css/FloatingVideoButton.module.css';

const FloatingVideoButton = ({ context = 'default', position = 'bottom-right' }) => {
  const { openVideoTutorial } = useUI();

  const handleClick = () => {
    const video = getVideoByContext(context);
    if (video) {
      openVideoTutorial(video.url, video.title);
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-right':
        return styles.bottomRight;
      case 'bottom-left':
        return styles.bottomLeft;
      case 'top-right':
        return styles.topRight;
      case 'top-left':
        return styles.topLeft;
      default:
        return styles.bottomRight;
    }
  };

  return (
    <button
      className={`${styles.floatingButton} ${getPositionClass()}`}
      onClick={handleClick}
      aria-label="Ver tutorial en video"
      title="¿Necesitas ayuda? Ver tutorial"
    >
      <PlayCircle size={28} />
      <span className={styles.label}>Ayuda</span>
    </button>
  );
};

export default FloatingVideoButton;
