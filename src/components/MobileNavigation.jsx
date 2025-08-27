// MobileNavigation.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// (You weren't using useAuth here, so I removed it to keep things tidy)

const MobileNavigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // reserved if you later add a drawer

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/add-trade', label: 'Add Trade', icon: '➕' },
    { path: '/trades', label: 'Trades', icon: '📋' },
    { path: '/player-search', label: 'Players', icon: '🔍' },
    { path: '/watchlist', label: 'Watchlist', icon: '👁️' }, // 👈 NEW
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
      <div className={`grid grid-cols-${navItems.length} h-12`}>
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

export default MobileNavigation;
