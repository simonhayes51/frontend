// src/components/DesktopSidebar.jsx
export default function DesktopSidebar() {
  const items = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "💸", label: "Transfers", active: false },
    { icon: "📈", label: "Analytics", active: false },
    { icon: "⚙️", label: "Settings", active: false },
    { icon: "📋", label: "Records", active: false },
    { icon: "📜", label: "History", active: false },
    { icon: "📞", label: "Contact us", active: false }
  ];

  return (
    <aside className="w-64 p-6 border-r border-gray-700/50">
      <nav className="space-y-2">
        {items.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              item.active
                ? "bg-purple-600/20 text-purple-300 border-r-2 border-purple-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
