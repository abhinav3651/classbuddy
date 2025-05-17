import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Lock } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';
import { API_URL } from '../utils/constants'; 

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
  };
}

export const loginUser = async (
  email: string,
  password: string,
  role: 'student' | 'teacher'
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', { email, role }); // Log login attempt
      console.log('Request payload:', { email, password, role }); // Add this line
      const result = await loginUser(email, password, role);
      
      // Successful login
      login(
        {
          id: result.user.id,
          name: result.user.name,
          role: result.user.role,
        },
        result.token
      );

      // Redirect based on role
      if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Slot Selector</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to manage your time slots
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="flex mt-2 space-x-4">
                  <div className="flex items-center">
                    <input
                      id="student"
                      name="role"
                      type="radio"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                    />
                    <label htmlFor="student" className="block ml-2 text-sm text-gray-700">
                      Student
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="teacher"
                      name="role"
                      type="radio"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={role === 'teacher'}
                      onChange={() => setRole('teacher')}
                    />
                    <label htmlFor="teacher" className="block ml-2 text-sm text-gray-700">
                      Teacher
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">Demo Credentials</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-2 text-xs text-gray-700 rounded bg-gray-50">
                  <p><strong>Student:</strong></p>
                  <p>Email: student@example.com</p>
                  <p>Password: password123</p>
                </div>
                <div className="p-2 text-xs text-gray-700 rounded bg-gray-50">
                  <p><strong>Teacher:</strong></p>
                  <p>Email: teacher@example.com</p>
                  <p>Password: password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <NotificationToast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;