// src/components/DesktopSidebar.jsx
import { NavLink } from "react-router-dom";

const NAV = [
  { path: "/",          label: "Dashboard",  icon: "📊" },
  { path: "/add-trade", label: "Add Trade",  icon: "➕" },
  { path: "/trades",    label: "Trades",     icon: "📋" },
  { path: "/profile",   label: "Profile",    icon: "👤" },
  { path: "/analytics", label: "Analytics",  icon: "📈" },
  { path: "/settings",  label: "Settings",   icon: "⚙️" },
];

export default function DesktopSidebar() {
  return (
    <aside className="w-64 p-6 border-r border-gray-700/50 h-screen">
      <nav className="space-y-2">
        {NAV.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"} // exact-match root
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-600/20 text-purple-300 border-r-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`
            }
          >
            <span>{icon}</span>
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
