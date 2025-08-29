// src/App.jsx
import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { SettingsProvider } from "./context/SettingsContext";

import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import PrivateRoute from "./components/PrivateRoute";

// Direct import
import PlayerSearch from "./pages/PlayerSearch";

// Lazy-loaded pages
const ThemedDashboard = lazy(() => import("./pages/ThemedDashboard")); // ✅ new default
const AddTrade        = lazy(() => import("./pages/AddTrade"));
const Trades          = lazy(() => import("./pages/Trades"));
const Profile         = lazy(() => import("./pages/Profile"));
const Settings        = lazy(() => import("./pages/Settings"));
const ProfitGraph     = lazy(() => import("./pages/ProfitGraph"));
const PriceCheck      = lazy(() => import("./pages/PriceCheck"));
const Login           = lazy(() => import("./pages/Login"));
const AccessDenied    = lazy(() => import("./pages/AccessDenied"));
const NotFound        = lazy(() => import("./pages/NotFound"));
const Watchlist       = lazy(() => import("./pages/Watchlist"));
const SquadBuilder    = lazy(() => import("./pages/SquadBuilder"));

// A tiny shell to hold providers and expose an <Outlet /> for nested routes
const AppShell = () => <Outlet />;

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="bg-black min-h-screen text-white">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* Protected: NO Layout/Sidebar — everything renders full-bleed */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <SettingsProvider>
                        <DashboardProvider>
                          <AppShell />
                        </DashboardProvider>
                      </SettingsProvider>
                    </PrivateRoute>
                  }
                >
                  {/* Default page: your new themed dashboard */}
                  <Route index element={<ThemedDashboard />} />

                  {/* Other pages (also without sidebar) */}
                  <Route path="add-trade" element={<AddTrade />} />
                  <Route path="trades" element={<Trades />} />
                  <Route path="player-search" element={<PlayerSearch />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<ProfitGraph />} />
                  <Route path="pricecheck" element={<PriceCheck />} />
                  <Route path="watchlist" element={<Watchlist />} />
                  <Route path="squad" element={<SquadBuilder />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
