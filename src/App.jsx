import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { SettingsProvider } from "./context/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddTrade = lazy(() => import("./pages/AddTrade"));
const Trades = lazy(() => import("./pages/Trades"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const ProfitGraph = lazy(() => import("./pages/ProfitGraph"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="bg-black min-h-screen text-white">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <SettingsProvider>
                      <DashboardProvider>
                        <Layout />
                      </DashboardProvider>
                    </SettingsProvider>
                  </PrivateRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="add-trade" element={<AddTrade />} />
                  <Route path="trades" element={<Trades />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="analytics" element={<ProfitGraph />} />
                </Route>
                
                {/* 404 route */}
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
