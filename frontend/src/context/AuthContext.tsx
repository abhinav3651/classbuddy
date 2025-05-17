import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
import { initSocket, joinUserRoom } from '../utils/socket';

// Define actions
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

// Create context
const AuthContext = createContext<{
  state: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;
}>({
  state: initialState,
  login: () => {},
  logout: () => {},
});

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check localStorage for token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          const user = JSON.parse(userStr) as User;
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
          
          // Initialize socket and join user room
          initSocket();
          joinUserRoom(user);
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = (user: User, token: string) => {
    // Save to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Update state
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

    // Initialize socket and join user room
    initSocket();
    joinUserRoom(user);
  };

  // Logout function
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Update state
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);