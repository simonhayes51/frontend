import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNavigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/add-trade', label: 'Add Trade', icon: '➕' },
    { path: '/trades', label: 'Trades', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center space-y-1 ${
              location.pathname === path
                ? 'text-purple-400 bg-gray-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const MobileNavigation = () => { /* ... */ };
export default MobileNavigation;
