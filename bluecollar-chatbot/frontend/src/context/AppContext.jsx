import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  sidebarOpen: true,
  notifications: [],
  unreadCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_USER':
      if (action.payload) localStorage.setItem('user', JSON.stringify(action.payload));
      else localStorage.removeItem('user');
      return { ...state, user: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };
    case 'MARK_READ':
      return { ...state, unreadCount: 0 };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  }, [state.theme]);

  const setUser = useCallback((user) => dispatch({ type: 'SET_USER', payload: user }), []);
  const logout  = useCallback(() => dispatch({ type: 'SET_USER', payload: null }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);

  const addNotification = useCallback((notif) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notif, id: Date.now(), time: new Date() } });
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      toggleTheme,
      setUser,
      logout,
      toggleSidebar,
      addNotification,
      clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
      markRead: () => dispatch({ type: 'MARK_READ' }),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
