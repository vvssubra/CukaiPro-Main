import { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('cukaipro_theme') || 'light';
    // Set the theme on the document on initial load
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    return savedTheme;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cukaipro_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = ++notificationIdRef.current;
    setNotifications((prev) => [...prev, { ...notification, id }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  const value = {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
