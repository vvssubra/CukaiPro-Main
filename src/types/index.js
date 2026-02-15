/**
 * TypeScript type definitions for CukaiPro
 * These types can be imported in JavaScript files via JSDoc comments
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email address
 * @property {string} role - User role
 * @property {string} [avatar] - User avatar URL
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User | null} user - Current user
 * @property {boolean} loading - Loading state
 * @property {string | null} error - Error message
 * @property {(email: string, password: string) => Promise<{success: boolean, error?: string}>} login - Login function
 * @property {() => void} logout - Logout function
 * @property {(userData: Partial<User>) => void} updateUser - Update user function
 * @property {boolean} isAuthenticated - Authentication status
 */

/**
 * @typedef {Object} AppContextValue
 * @property {'light' | 'dark'} theme - Current theme
 * @property {() => void} toggleTheme - Toggle theme function
 * @property {boolean} sidebarOpen - Sidebar state
 * @property {() => void} toggleSidebar - Toggle sidebar function
 * @property {Notification[]} notifications - List of notifications
 * @property {(notification: NotificationInput) => void} addNotification - Add notification
 * @property {(id: number) => void} removeNotification - Remove notification
 */

/**
 * @typedef {Object} Notification
 * @property {number} id - Notification ID
 * @property {string} message - Notification message
 * @property {'success' | 'error' | 'warning' | 'info'} type - Notification type
 */

/**
 * @typedef {Object} NotificationInput
 * @property {string} message - Notification message
 * @property {'success' | 'error' | 'warning' | 'info'} type - Notification type
 */

export {};
