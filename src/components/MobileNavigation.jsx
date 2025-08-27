// MobileNavigation.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const MobileNavigation = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  // Primary navigation items (always visible)
  const primaryNavItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/add-trade", label: "Add Trade", icon: "➕" },
    { path: "/trades", label: "Trades", icon: "📋" },
    { path: "/analytics", label: "Analytics", icon: "📈" },
  ];

  // Secondary navigation items (in overflow menu)
  const secondaryNavItems = [
    { path: "/player-search", label: "Players", icon: "🔍" },
    { path: "/watchlist", label: "Watchlist", icon: "👁️" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;
  const hasActiveSecondary = secondaryNavItems.some((item) => isActive(item.path));

  return (
    <>
      {/* Overlay for more menu */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Secondary menu */}
      {showMore && (
        <div className="fixed bottom-16 right-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 md:hidden">
          <div className="p-2">
            {secondaryNavItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setShowMore(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  isActive(path)
                    ? "text-purple-400 bg-gray-700"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
        <div className="grid grid-cols-5 h-16">
          {/* Primary navigation items */}
          {primaryNavItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive(path)
                  ? "text-purple-400 bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs font-medium truncate w-full text-center px-1">
                {label}
              </span>
            </Link>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              showMore || hasActiveSecondary
                ? "text-purple-400 bg-gray-800"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="text-xl">⋯</span>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;