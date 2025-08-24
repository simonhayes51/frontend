// src/components/Layout.jsx - Replace your existing Layout
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';

const Layout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {!isMobile && <DesktopSidebar />}
      <main className={isMobile ? 'pb-20' : 'ml-64'}>
        <Outlet />
      </main>
      {isMobile && <MobileNavigation />}
    </div>
  );
};
