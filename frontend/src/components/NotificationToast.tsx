import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for animation before removing
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: <Check className="h-5 w-5 text-green-500" />,
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-5 right-5 w-72 shadow-lg rounded-lg border ${
        styles.border
      } ${styles.bg} transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="p-3 flex items-start">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className={`ml-3 flex-1 ${styles.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 ml-2 bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;