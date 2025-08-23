import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import Trades from "./pages/Trades";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProfitGraph from "./pages/ProfitGraph";

function App() {
  return (
    <DashboardProvider>
      <Router>
        <div className="bg-black min-h-screen text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/addtrade" element={<AddTrade />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profitgraph" element={<ProfitGraph />} />
          </Routes>
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;