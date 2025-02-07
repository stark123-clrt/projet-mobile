import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Smartphone, BarChart2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <Link 
            to="/" 
            className={`flex flex-col items-center ${
              isActive('/') 
                ? 'text-blue-600' 
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Accueil</span>
          </Link>
          <Link 
            to="/inventory" 
            className={`flex flex-col items-center ${
              isActive('/inventory') 
                ? 'text-blue-600' 
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={20} />
            <span className="text-xs mt-1">Inventaire</span>
          </Link>
          <Link 
            to="/sale" 
            className={`flex flex-col items-center ${
              isActive('/sale') 
                ? 'text-blue-600' 
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Vente</span>
          </Link>
          <Link 
            to="/devices" 
            className={`flex flex-col items-center ${
              isActive('/devices') 
                ? 'text-blue-600' 
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone size={20} />
            <span className="text-xs mt-1">Appareils</span>
          </Link>
          <Link 
            to="/reports" 
            className={`flex flex-col items-center ${
              isActive('/reports') 
                ? 'text-blue-600' 
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 size={20} />
            <span className="text-xs mt-1">Rapports</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            className={`flex flex-col items-center ${
              darkMode ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-xs mt-1">Thème</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;