import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Trash2, Edit, LogOut, Users, TrendingUp, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase.js";

const fetchEvents = async () => {
  const res = await axios.get("http://localhost:5000/events");
  return res.data;
};

const fetchAnalytics = async () => {
  const res = await axios.get("http://localhost:5000/analytics");
  return res.data;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const user = auth.currentUser;

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: fetchEvents,
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/events/${id}`);
      refetch();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  const approveEvent = async (id) => {
    try {
      await axios.put(`http://localhost:5000/events/${id}/approve`, {
        status: "approved",
      });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to approve event");
    }
  };

  const rejectEvent = async (id) => {
    try {
      await axios.put(`http://localhost:5000/events/${id}/approve`, {
        status: "rejected",
      });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to reject event");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Prepare chart data
  const chartData = events.map(event => ({
    name: event.title.substring(0, 15),
    registrations: event.registrations?.length || 0,
    slots: event.slots || 0,
  }));

  const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-rust/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-rust" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rust/10 border border-rust/30">
              <span className="text-sm text-gray-sec">Admin:</span>
              <span className="text-sm font-semibold text-rust truncate max-w-[150px]">
                {user?.displayName || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black border border-rust/30 rounded-lg p-6 hover:border-rust/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Total Events</p>
                <p className="text-3xl font-bold text-rust mt-2">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-rust opacity-50" />
            </div>
          </div>

          <div className="bg-black border border-rust/30 rounded-lg p-6 hover:border-rust/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Total Registrations</p>
                <p className="text-3xl font-bold text-rust mt-2">
                  {events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-rust opacity-50" />
            </div>
          </div>

          <div className="bg-black border border-rust/30 rounded-lg p-6 hover:border-rust/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Avg. Registration Rate</p>
                <p className="text-3xl font-bold text-rust mt-2">
                  {events.length > 0 
                    ? Math.round((events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0) / events.reduce((acc, e) => acc + (e.slots || 0), 1)) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-rust opacity-50" />
            </div>
          </div>

          <div className="bg-black border border-green-500/30 rounded-lg p-6 hover:border-green-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Available Slots</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {events.reduce((acc, e) => acc + (e.slots || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-black border border-rust/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-rust mb-6">Event Registrations</h3>
            {events.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #0f766e' }}
                    labelStyle={{ color: '#06b6d4' }}
                  />
                  <Legend />
                  <Bar dataKey="registrations" fill="#06b6d4" />
                  <Bar dataKey="slots" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-sec text-center py-20">No events yet</p>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-black border border-rust/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-rust mb-6">Registration Distribution</h3>
            {events.length > 0 && events.some(e => (e.registrations?.length || 0) > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, registrations }) => `${name}: ${registrations}`}
                    outerRadius={80}
                    fill="#a855f7"
                    dataKey="registrations"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #a855f7' }}
                    labelStyle={{ color: '#a855f7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-sec text-center py-20">No registration data yet</p>
            )}
          </div>
        </div>

        {/* Events Management */}
        <div className="bg-black border border-rust/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-rust">Event Management</h3>
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-400 text-black font-semibold hover:scale-105 transition-transform"
            >
              + New Event
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-sec">No events created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rust/30">
                    <th className="text-left py-3 px-4 text-rust font-semibold">Event Title</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Registrations</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Slots</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-rust/20 hover:bg-black/50 transition-colors">
                      <td className="py-3 px-4 text-gray-200 font-medium">{event.title}</td>
                      <td className="py-3 px-4 text-gray-sec">
                        {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-rust/20 text-rust text-sm font-semibold">
                          {event.registrations?.length || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-200">{event.slots || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : event.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {event.status !== "approved" && (
                          <button
                            onClick={() => approveEvent(event.id)}
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                            title="Approve"
                          >
                            ✓
                          </button>
                        )}
                        {event.status !== "rejected" && (
                          <button
                            onClick={() => rejectEvent(event.id)}
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                            title="Reject"
                          >
                            ✕
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(event.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black border border-red-500/50 rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-red-400 mb-4">Delete Event?</h3>
              <p className="text-gray-sec mb-6">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-500 text-gray-sec hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteEvent(deleteConfirm)}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
