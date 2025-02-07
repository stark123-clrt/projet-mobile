import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} min-h-screen shadow-lg relative`}>
        <main className={`p-4 pb-24 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Outlet />
        </main>
        <Navigation />
      </div>
    </div>
  );
};

export default Layout;