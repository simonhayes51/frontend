import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const MobileNavigation = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  // Primary navigation items (always visible)
  const primaryNavItems = [
    { 
      path: "/", 
      label: "Home", 
      icon: "🏠",
      activeIcon: "🏡"
    },
    { 
      path: "/add-trade", 
      label: "Add", 
      icon: "➕",
      activeIcon: "✅",
      isSpecial: true
    },
    { 
      path: "/trades", 
      label: "Trades", 
      icon: "📋",
      activeIcon: "📊"
    },
    { 
      path: "/analytics", 
      label: "Stats", 
      icon: "📈",
      activeIcon: "📊"
    },
  ];

  // Secondary navigation items (in overflow menu)
  const secondaryNavItems = [
    { path: "/player-search", label: "Search Players", icon: "🔍" },
    { path: "/watchlist", label: "Watchlist", icon: "👁️" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;
  const hasActiveSecondary = secondaryNavItems.some((item) => isActive(item.path));

  return (
    <>
      {/* Overlay for more menu */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Secondary menu */}
      {showMore && (
        <div className="fixed bottom-20 right-4 left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 md:hidden overflow-hidden">
          <div className="p-2">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">More Options</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              {secondaryNavItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setShowMore(false)}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                    isActive(path)
                      ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive(path) 
                      ? 'bg-purple-100 dark:bg-purple-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{label}</span>
                  </div>
                  {isActive(path) && (
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50">
        {/* Navigation Pills Background */}
        <div className="absolute inset-x-4 top-2 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl"></div>
        
        <div className="relative grid grid-cols-5 h-16 px-4 py-2">
          {/* Primary navigation items */}
          {primaryNavItems.map(({ path, label, icon, activeIcon, isSpecial }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center relative transition-all duration-300 rounded-xl ${
                  isSpecial
                    ? active
                      ? 'bg-green-500 text-white shadow-lg scale-110'
                      : 'bg-green-500 text-white shadow-md hover:shadow-lg hover:scale-105'
                    : active
                      ? 'text-purple-600 dark:text-purple-400 transform scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {/* Active indicator */}
                {active && !isSpecial && (
                  <div className="absolute -top-1 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                )}
                
                <div className={`transition-all duration-200 ${active && !isSpecial ? 'transform -translate-y-0.5' : ''}`}>
                  <span className={`text-2xl block transition-all duration-200 ${active ? 'transform scale-110' : ''}`}>
                    {active ? (activeIcon || icon) : icon}
                  </span>
                  <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                    active ? 'opacity-100' : 'opacity-75'
                  }`}>
                    {label}
                  </span>
                </div>

                {/* Haptic feedback simulation */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-150 ${
                  active && !isSpecial ? 'bg-purple-100 dark:bg-purple-900/30' : ''
                }`}></div>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center relative transition-all duration-300 rounded-xl ${
              showMore || hasActiveSecondary
                ? "text-purple-600 dark:text-purple-400 transform scale-105"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {/* Active indicator */}
            {(showMore || hasActiveSecondary) && (
              <div className="absolute -top-1 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
            )}
            
            <div className={`transition-all duration-200 ${showMore || hasActiveSecondary ? 'transform -translate-y-0.5' : ''}`}>
              <span className={`text-2xl block transition-all duration-200 ${
                showMore ? 'transform rotate-180 scale-110' : hasActiveSecondary ? 'transform scale-110' : ''
              }`}>
                {showMore ? "✕" : "⋯"}
              </span>
              <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                showMore || hasActiveSecondary ? 'opacity-100' : 'opacity-75'
              }`}>
                More
              </span>
            </div>

            {/* Haptic feedback simulation */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-150 ${
              showMore || hasActiveSecondary ? 'bg-purple-100 dark:bg-purple-900/30' : ''
            }`}></div>
          </button>
        </div>

        {/* Home indicator (iOS style) */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;
