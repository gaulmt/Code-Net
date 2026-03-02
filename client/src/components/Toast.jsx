import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './Toast.css';

function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    info: <FiInfo />,
    warning: <FiAlertCircle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {icons[type]}
      </div>
      <div className="toast-message">
        {message}
      </div>
      <button className="toast-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
}

export default Toast;
