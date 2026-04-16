import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Calendar, Trash2, Edit, LogOut, Users, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase.js";

const fetchOrganizerEvents = async (organizerId) => {
  const res = await axios.get(`http://localhost:5000/events/organizer/${organizerId}`);
  return res.data;
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const user = auth.currentUser;

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["organizerEvents", user?.uid],
    queryFn: () => fetchOrganizerEvents(user?.uid),
    enabled: !!user?.uid,
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-amber-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plus className="w-6 h-6 text-rust" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Organizer Dashboard
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-sm text-gray-sec">Organizer:</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black border border-amber-500/30 rounded-lg p-6 hover:border-amber-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Total Events Created</p>
                <p className="text-3xl font-bold text-rust mt-2">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-rust opacity-50" />
            </div>
          </div>

          <div className="bg-black border border-orange-500/30 rounded-lg p-6 hover:border-orange-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Total Registrations</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </div>

          <div className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-sec text-sm">Total Slots Available</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">
                  {events.reduce((acc, e) => acc + (e.slots || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Events Management */}
        <div className="bg-black border border-amber-500/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-rust">Your Events</h3>
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Event
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-sec text-lg mb-4">No events created yet</p>
              <button
                onClick={() => navigate("/create")}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-500/30">
                    <th className="text-left py-3 px-4 text-rust font-semibold">Event Title</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-rust font-semibold">Registrations</th>
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
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-rust text-xs font-semibold">
                          {event.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold">
                          {event.registrations?.length || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.approved
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {event.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(event.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
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

export default OrganizerDashboard;
