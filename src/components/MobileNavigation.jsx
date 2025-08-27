import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  const items = [
    { path: '/', label: 'Dashboard', icon: '🏠', description: 'Overview & stats' },
    { path: '/add-trade', label: 'Add Trade', icon: '➕', description: 'Record trade', isSpecial: true },
    { path: '/trades', label: 'All Trades', icon: '📋', description: 'Trade history' },
    { path: '/analytics', label: 'Analytics', icon: '📊', description: 'Performance' },
    { path: '/player-search', label: 'Player Search', icon: '🔍', description: 'Find players' },
    { path: '/watchlist', label: 'Watchlist', icon: '👁️', description: 'Tracked players' },
    { path: '/settings', label: 'Settings', icon: '⚙️', description: 'Preferences' },
    { path: '/profile', label: 'Profile', icon: '👤', description: 'Your account' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed top-4 left-4 z-50 p-2.5 rounded-full shadow-lg ${
          isOpen
            ? 'bg-white dark:bg-gray-800 text-gray-900'
            : 'bg-gray-900 text-white'
        }`}
      >
        <div className="relative w-4 h-4">
          <span className={`absolute h-0.5 w-4 bg-current transition ${isOpen ? 'rotate-45 top-1.5' : 'top-0'}`} />
          <span className={`absolute h-0.5 w-4 bg-current transition top-1.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`absolute h-0.5 w-4 bg-current transition ${isOpen ? '-rotate-45 top-1.5' : 'top-3'}`} />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 pt-12">
          <h2 className="text-white font-bold">Trading App</h2>
          <p className="text-white/80 text-xs">EA FC Trading Dashboard</p>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {items.map(({ path, label, icon, description, isSpecial }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl ${
                isSpecial
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : isActive(path)
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{label}</p>
                <p className="text-xs truncate">{description}</p>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default MobileNavigation;