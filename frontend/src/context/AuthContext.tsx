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
  login: (user: User, token: string) => Promise<void>;
  logout: () => void;
}>({
  state: initialState,
  login: async () => {},
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
        dispatch({ type: 'SET_LOADING', payload: true });
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
            
            // Initialize socket and join user room
            await initSocket();
            await joinUserRoom(user);
          } catch (error) {
            console.error('Error parsing user data:', error);
            dispatch({ type: 'AUTH_ERROR' });
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        dispatch({ type: 'AUTH_ERROR' });
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (user: User, token: string) => {
    try {
      // Save to localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Update state
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });

      // Initialize socket and join user room
      await initSocket();
      await joinUserRoom(user);
    } catch (error) {
      console.error('Error during login:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      dispatch({ type: 'AUTH_ERROR' });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);