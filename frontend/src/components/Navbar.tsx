import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Menu, X, Search, BookOpen } from 'lucide-react';

const Navbar: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Determine routes based on user role
  const baseRoute = user?.role === 'student' ? '/student' : '/teacher';
  const dashboardRoute = `${baseRoute}/dashboard`;
  const freeClassroomsRoute = `${baseRoute}/free-classrooms`;
  const seminarHallRoute = `${baseRoute}/seminar-hall`;

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">Slot Selector</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardRoute}
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={freeClassroomsRoute}
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Find Free Classrooms
                  </Link>
                  <Link
                    to={seminarHallRoute}
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Seminar Hall
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardRoute}
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to={freeClassroomsRoute}
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={toggleMenu}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Find Free Classrooms
                </Link>
                <Link
                  to={seminarHallRoute}
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={toggleMenu}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Seminar Hall
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;