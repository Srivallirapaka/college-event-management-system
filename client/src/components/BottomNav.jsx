import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, BarChart3, LogOut } from "lucide-react";
import { User } from "lucide-react";
import { auth } from "../Firebase.js";
import { useState } from "react";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const userRole = localStorage.getItem("userRole");

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname === "/") return null; // Don't show on login page

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-full shadow-md px-6 py-3 flex justify-between items-center">
        {/* User Nav */}
        {userRole === "user" && (
          <>
            <button
              onClick={() => navigate("/user-dashboard")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-md transition-all ${
                isActive("/user-dashboard")
                  ? "text-neon-cyan"
                  : "text-gray-500 hover:text-neon-cyan"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-semibold">Home</span>
            </button>
            <button
              onClick={() => handleLogout()}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-md text-gray-500 hover:text-neon-pink transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </>
        )}

        {/* Organizer Nav */}
        {userRole === "organizer" && (
          <>
            <button
              onClick={() => navigate("/organizer-dashboard")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-md transition-all ${
                isActive("/organizer-dashboard")
                  ? "text-neon-cyan"
                  : "text-gray-500 hover:text-neon-cyan"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/create")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-md transition-all ${
                isActive("/create")
                  ? "text-neon-cyan"
                  : "text-gray-500 hover:text-neon-cyan"
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-semibold">Create</span>
            </button>
            <button
              onClick={() => handleLogout()}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-md text-gray-500 hover:text-neon-pink transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </>
        )}

        {/* Admin Nav */}
        {userRole === "admin" && (
          <>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-md transition-all ${
                isActive("/admin-dashboard")
                  ? "text-neon-cyan"
                  : "text-gray-500 hover:text-neon-cyan"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => handleLogout()}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-md text-gray-500 hover:text-neon-pink transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </>
        )}
        {/* Profile (common) */}
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 py-2 px-4 rounded-md text-gray-500 hover:text-neon-cyan">
          <User className="w-5 h-5" />
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
