// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';

function Layout() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {!isMobile && (
        <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
          <DesktopSidebar />
        </div>
      )}

      <main className={isMobile ? 'pb-20' : 'ml-64'}>
        <Outlet />
      </main>

      {isMobile && <MobileNavigation />}
    </div>
  );
}

export default Layout;  // 👈 default export required by `import Layout from "./components/Layout"`
