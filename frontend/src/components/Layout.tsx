import React from 'react';
import Navbar from './Navbar';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { state, logout } = useAuth();
  const { user } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Slot Selector. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;