// src/App.jsx
import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { SettingsProvider } from "./context/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import PrivateRoute from "./components/PrivateRoute";

// Legacy pages (lazy)
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const AddTrade     = lazy(() => import("./pages/AddTrade"));
const Trades       = lazy(() => import("./pages/Trades"));
const Profile      = lazy(() => import("./pages/Profile"));
const Settings     = lazy(() => import("./pages/Settings"));
const ProfitGraph  = lazy(() => import("./pages/ProfitGraph"));
const PriceCheck   = lazy(() => import("./pages/PriceCheck"));
const Login        = lazy(() => import("./pages/Login"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const NotFound     = lazy(() => import("./pages/NotFound"));
const PlayerSearch = lazy(() => import("./pages/PlayerSearch"));

// New themed page (no sidebar, public)
const ThemedDashboard = lazy(() => import("./pages/ThemedDashboard"));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="bg-black min-h-screen text-white">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* ---------- PUBLIC: Themed dashboard is the default ---------- */}
                <Route
                  path="/"
                  element={
                    <SettingsProvider>
                      <DashboardProvider>
                        <ThemedDashboard />
                      </DashboardProvider>
                    </SettingsProvider>
                  }
                />
                {/* Keep /new working too */}
                <Route
                  path="/new"
                  element={
                    <SettingsProvider>
                      <DashboardProvider>
                        <ThemedDashboard />
                      </DashboardProvider>
                    </SettingsProvider>
                  }
                />

                {/* ---------- PUBLIC auth pages (legacy app) ---------- */}
                <Route path="/login" element={<Login />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                {/* ---------- LEGACY APP (with sidebar) under /app/* ---------- */}
                <Route
                  path="/app"
                  element={
                    <PrivateRoute>
                      <SettingsProvider>
                        <DashboardProvider>
                          <Layout />
                        </DashboardProvider>
                      </SettingsProvider>
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="add-trade" element={<AddTrade />} />
                  <Route path="trades" element={<Trades />} />
                  <Route path="player-search" element={<PlayerSearch />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<ProfitGraph />} />
                  <Route path="pricecheck" element={<PriceCheck />} />
                  {/* optional alias */}
                  <Route path="squad" element={<Navigate to="/app/player-search" replace />} />
                </Route>

                {/* ---------- 404 ---------- */}
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
