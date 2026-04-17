import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase.js";
import { QrCode, Home, LogOut, BarChart3, Calendar, Users, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalUsers: 0,
    totalAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    setAdmin(u);

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const eventsRes = await axios.get(`http://localhost:5000/events`);
        const events = eventsRes.data || [];
        
        // Calculate stats
        const totalRegistrations = events.reduce((sum, e) => {
          const registrations = e.registrations?.length || 0;
          return sum + registrations;
        }, 0);

        // Get unique users
        const uniqueUsers = new Set();
        events.forEach(e => {
          if (e.registrations) {
            e.registrations.forEach(r => uniqueUsers.add(r));
          }
        });

        setStats({
          totalEvents: events.length,
          totalRegistrations: totalRegistrations,
          totalUsers: uniqueUsers.size,
          totalAttendance: Math.floor(totalRegistrations * 0.75), // Estimated attendance
        });
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleHome = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-28">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Profile Avatar & Info */}
          <div className="flex items-end gap-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-purple-600 shadow-lg ring-4 ring-white/30 flex-shrink-0">
              {admin?.displayName?.charAt(0)?.toUpperCase() || admin?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{admin?.displayName || 'Admin User'}</h1>
                <div className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">ADMIN</span>
                </div>
              </div>
              <p className="text-purple-100 text-sm mt-1">{admin?.email || localStorage.getItem('userEmail')}</p>
              <p className="text-purple-200 text-xs mt-2">Platform Administrator</p>
            </div>
            
            {/* QR Code Card */}
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-white/30 flex-shrink-0">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <QrCode className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-xs text-purple-100 mt-4 font-medium">Admin ID</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalEvents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Registrations</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalRegistrations}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-pink-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Attendance</p>
                <p className="text-3xl font-bold text-pink-600 mt-1">{stats.totalAttendance}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Information Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Admin Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{admin?.displayName || 'Administrator'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Email Address</p>
              <p className="text-lg font-semibold text-gray-900">{admin?.email}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Role</p>
              <p className="text-lg font-semibold text-purple-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Administrator
              </p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Permissions</p>
              <p className="text-lg font-semibold text-gray-900">Full Access</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleHome}
              className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all hover:scale-105"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">View Dashboard</span>
            </button>

            <button
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Manage Events</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg transition-all hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center pb-8">
          <button
            onClick={handleHome}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 text-gray-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
