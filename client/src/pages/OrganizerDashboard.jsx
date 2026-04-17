import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Trash2, LogOut, Users, TrendingUp, Plus, BarChart3, Settings, LayoutDashboard, ClipboardList, Menu, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";

const fetchOrganizerEvents = async (organizerId) => {
  const res = await axios.get(`http://localhost:5000/events/organizer/${organizerId}`);
  console.log("Raw organizer events data:", res.data);
  
  // Transform registeredUsers to registrations array
  return res.data.map((event) => {
    let registrations = [];
    
    if (event.registeredUsers) {
      try {
        if (typeof event.registeredUsers === 'string') {
          registrations = JSON.parse(event.registeredUsers);
        } else if (Array.isArray(event.registeredUsers)) {
          registrations = event.registeredUsers;
        }
      } catch (e) {
        console.error("Error parsing registrations:", e);
        registrations = [];
      }
    }
    
    return {
      ...event,
      registrations: registrations,
    };
  });
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = auth.currentUser;

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["organizerEvents", user?.uid],
    queryFn: () => fetchOrganizerEvents(user?.uid),
    enabled: !!user?.uid,
    staleTime: 30000, // 30 seconds
  });

  // Refetch data when tab changes
  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "analytics") {
      refetch();
    }
  }, [activeTab, refetch]);

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

  const updateEvent = async () => {
    try {
      setIsSaving(true);
      await axios.put(`http://localhost:5000/events/${editingEvent.id}`, editFormData);
      refetch();
      setEditingEvent(null);
      setEditFormData({});
      alert("Event updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update event: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Force rebuild

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const validateAndUploadImage = (eventId, file) => {
    if (!file) {
      alert("Please select an image");
      return;
    }
    
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("eventId", eventId);

    axios.post("http://localhost:5000/events/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        alert("Image uploaded successfully!");
        refetch();
      })
      .catch(err => {
        console.error(err);
        alert("Failed to upload image");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm fixed md:relative h-screen z-40 md:z-auto`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Organizer</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { 
              id: "dashboard", 
              icon: LayoutDashboard, 
              label: "Dashboard", 
              color: "text-blue-600",
              description: "View your event overview and stats"
            },
            { 
              id: "events", 
              icon: Calendar, 
              label: "My Events", 
              color: "text-green-500",
              description: "Manage your created events"
            },
            { 
              id: "registrations", 
              icon: ClipboardList, 
              label: "Registrations", 
              color: "text-purple-600",
              description: "View all event registrations"
            },
            { 
              id: "analytics", 
              icon: BarChart3, 
              label: "Analytics", 
              color: "text-pink-600",
              description: "Detailed event analytics"
            },
            { 
              id: "settings", 
              icon: Settings, 
              label: "Settings", 
              color: "text-slate-600",
              description: "Configure your preferences"
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="group relative">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 shadow-sm"
                      : "hover:bg-slate-50"
                  }`}
                  title={item.description}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? item.color : "text-slate-400"}`} />
                  {sidebarOpen && (
                    <span className={`text-sm font-medium ${activeTab === item.id ? item.color : "text-slate-600"}`}>
                      {item.label}
                    </span>
                  )}
                </button>
                {/* Tooltip for collapsed sidebar */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 top-0 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full md:w-auto">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "events" && "My Events"}
                {activeTab === "registrations" && "Registrations"}
                {activeTab === "analytics" && "Analytics"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                {activeTab === "dashboard" && "Overview of your events and registrations"}
                {activeTab === "events" && "Manage all your created events"}
                {activeTab === "registrations" && "View all registrations for your events"}
                {activeTab === "analytics" && "Detailed insights and performance metrics"}
                {activeTab === "settings" && "Configure your organizer preferences"}
              </p>
            </div>
            <div className="text-right text-xs sm:text-sm text-slate-500 whitespace-nowrap">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-4 lg:p-8 space-y-6 sm:space-y-8">
          {/* Stats Overview - Dashboard Tab */}
          {activeTab === "dashboard" && (
            <section>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                {
                  title: "Total Events",
                  value: events.length,
                  icon: Calendar,
                  gradient: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                },
                {
                  title: "Total Registrations",
                  value: events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0),
                  icon: Users,
                  gradient: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                },
                {
                  title: "Registration Rate",
                  value: `${events.length > 0 ? Math.round((events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0) / events.reduce((acc, e) => acc + (e.slots || 0), 1)) * 100) : 0}%`,
                  icon: TrendingUp,
                  gradient: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                },
                {
                  title: "Available Slots",
                  value: events.reduce((acc, e) => acc + (e.slots || 0), 0),
                  icon: Users,
                  gradient: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                },
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`${stat.bgColor} rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-slate-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">{stat.title}</p>
                        <p className={`text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent truncate`}>{stat.value}</p>
                      </div>
                      <div className={`bg-gradient-to-br ${stat.gradient} p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl flex-shrink-0`}>
                        <StatIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </section>
          )}

          {/* Charts Section - Dashboard Tab */}
          {activeTab === "dashboard" && (
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => navigate("/create")}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 lg:p-4 bg-white/20 rounded-lg">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg">Create Event</h3>
                    <p className="text-xs sm:text-sm text-green-100">Launch a new event for registrations</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 lg:p-4 bg-white/20 rounded-lg">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg">Manage Events</h3>
                    <p className="text-xs sm:text-sm text-orange-100">View and manage all your events</p>
                  </div>
                </div>
              </button>
            </div>
          </section>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <section className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Manage Events</h2>
                <button
                  onClick={() => navigate("/create")}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12 sm:py-20">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-slate-200 border-t-blue-500"></div>
                </div>
              ) : events.length === 0 ? (
                <div className="bg-slate-50 rounded-lg sm:rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-600 text-base sm:text-lg font-medium mb-2">No events found</p>
                  <p className="text-slate-500 text-xs sm:text-sm mb-4">Create your first event to get started</p>
                  <button
                    onClick={() => navigate("/create")}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <>
                  {/* Events Table */}
                  <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Event Title</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Date & Time</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Format</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-900">Slots</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-900">Registrations</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Status</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event, idx) => {
                            const eventDate = new Date(event.date);
                            const now = new Date();
                            let status = "upcoming";
                            if (eventDate < now) status = "completed";
                            else if (eventDate - now < 24 * 60 * 60 * 1000) status = "ongoing";

                            const statusColors = {
                              upcoming: { bg: "bg-blue-100", text: "text-blue-700" },
                              ongoing: { bg: "bg-amber-100", text: "text-amber-700" },
                              completed: { bg: "bg-green-100", text: "text-green-700" }
                            };

                            const registrationCount = event.registrations?.length || 0;
                            const occupancy = event.slots ? Math.round((registrationCount / event.slots) * 100) : 0;

                            return (
                              <tr key={event.id} className={`border-b border-slate-100 hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{event.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{event.category || "General"}</p>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                  <div>{event.date ? new Date(event.date).toLocaleDateString() : "N/A"}</div>
                                  <div className="text-xs text-slate-500">{event.time || "N/A"}</div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold capitalize">
                                    {event.format || "In-person"}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                  <span className="text-xs sm:text-sm font-semibold text-slate-900">{event.slots || 0}</span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="px-2 sm:px-3 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-semibold">
                                      {registrationCount}
                                    </span>
                                    <span className="text-xs text-slate-500">{occupancy}% full</span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status].bg} ${statusColors[status].text}`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                  <div className="flex gap-1 sm:gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingEvent(event);
                                        setEditFormData({
                                          title: event.title,
                                          description: event.description,
                                          date: event.date,
                                          time: event.time,
                                          location: event.location,
                                          slots: event.slots,
                                          category: event.category,
                                          format: event.format
                                        });
                                      }}
                                      className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-blue-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-all"
                                      title="Edit event"
                                    >
                                      ✎ Edit
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(event.id)}
                                      className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-all"
                                      title="Delete event"
                                    >
                                      🗑 Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Events Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Event Occupancy */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Event Occupancy</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {events.slice(0, 5).map((event) => {
                          const registrationCount = event.registrations?.length || 0;
                          const slots = event.slots || 1;
                          const occupancy = Math.round((registrationCount / slots) * 100);
                          return (
                            <div key={event.id}>
                              <div className="flex justify-between items-center mb-1 sm:mb-2">
                                <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{event.title}</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-900">{registrationCount}/{slots}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all duration-300"
                                  style={{width: `${Math.min(occupancy, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Event Statistics */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Overall Statistics</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          {
                            label: "Total Events",
                            value: events.length,
                            icon: Calendar,
                            color: "blue"
                          },
                          {
                            label: "Total Registrations",
                            value: events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0),
                            icon: Users,
                            color: "pink"
                          },
                          {
                            label: "Total Slots",
                            value: events.reduce((acc, e) => acc + (e.slots || 0), 0),
                            icon: TrendingUp,
                            color: "green"
                          },
                          {
                            label: "Avg Occupancy",
                            value: events.length > 0 ? Math.round(events.reduce((acc, e) => acc + ((e.registrations?.length || 0) / (e.slots || 1) * 100), 0) / events.length) : 0,
                            icon: BarChart3,
                            color: "purple",
                            suffix: "%"
                          }
                        ].map((stat, idx) => {
                          const Icon = stat.icon;
                          const colors = {
                            blue: { bg: "bg-blue-100", text: "text-blue-600" },
                            pink: { bg: "bg-pink-100", text: "text-pink-600" },
                            green: { bg: "bg-green-100", text: "text-green-600" },
                            purple: { bg: "bg-purple-100", text: "text-purple-600" }
                          };
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className={`p-1.5 sm:p-2 rounded-lg ${colors[stat.color].bg}`}>
                                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors[stat.color].text}`} />
                                </div>
                                <span className="text-slate-700 text-xs sm:text-sm font-medium truncate">{stat.label}</span>
                              </div>
                              <span className="text-lg sm:text-2xl font-bold text-slate-900 flex-shrink-0">{stat.value}{stat.suffix || ""}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <section className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Event Registrations</h2>
                {events.length === 0 ? null : (
                  <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    Total Registrations: <span className="font-bold text-slate-900">{events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0)}</span>
                  </div>
                )}
              </div>

              {events.length === 0 ? (
                <div className="bg-slate-50 rounded-lg sm:rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-600 text-base sm:text-lg font-medium mb-2">No registrations yet</p>
                  <p className="text-slate-500 text-xs sm:text-sm">Create an event to start receiving registrations</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Event Title</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Date</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Category</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-900">Registrations</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-900">Slots</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Occupancy</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event, idx) => {
                          const registrationCount = event.registrations?.length || 0;
                          const occupancy = event.slots ? Math.round((registrationCount / event.slots) * 100) : 0;
                          return (
                            <tr key={event.id} className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-900 truncate">{event.title}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">{event.date ? new Date(event.date).toLocaleDateString() : "N/A"}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4"><span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{event.category || "General"}</span></td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center"><span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-semibold">{registrationCount}</span></td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center"><span className="text-xs sm:text-sm font-semibold text-slate-900">{event.slots || 0}</span></td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 sm:w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" style={{width: `${Math.min(occupancy, 100)}%`}}></div>
                                  </div>
                                  <span className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">{occupancy}%</span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                                  new Date(event.date) < new Date() 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {new Date(event.date) < new Date() ? "✓ Completed" : "📅 Upcoming"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <section className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Analytics & Insights</h2>

              {events.length === 0 ? (
                <div className="bg-slate-50 rounded-lg sm:rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
                  <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-600 text-base sm:text-lg font-medium mb-2">No analytics data</p>
                  <p className="text-slate-500 text-xs sm:text-sm">Create events and receive registrations to see analytics</p>
                </div>
              ) : (
                <>
                  {/* Registrations vs Slots Chart */}
                  <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Registrations vs Available Slots</h3>
                    <div className="h-64 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={events.map(e => ({
                          name: e.title.substring(0, 12),
                          registrations: e.registrations?.length || 0,
                          slots: e.slots || 0,
                          occupancy: e.slots ? Math.round((((e.registrations?.length || 0) / e.slots) * 100)) : 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 12}} />
                          <YAxis tick={{fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px"}}
                            formatter={(value) => `${value}`}
                          />
                          <Legend />
                          <Bar dataKey="registrations" fill="#3b82f6" name="Registrations" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="slots" fill="#8b5cf6" name="Available Slots" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Event Occupancy */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Occupancy Rate by Event</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {events.map((event) => {
                          const registrationCount = event.registrations?.length || 0;
                          const slots = event.slots || 1;
                          const occupancy = Math.round((registrationCount / slots) * 100);
                          return (
                            <div key={event.id}>
                              <div className="flex justify-between items-center mb-1 sm:mb-2">
                                <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{event.title}</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-900">{registrationCount}/{slots} ({occupancy}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    occupancy >= 80 ? "bg-gradient-to-r from-red-500 to-red-400" :
                                    occupancy >= 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" :
                                    "bg-gradient-to-r from-green-500 to-green-400"
                                  }`}
                                  style={{width: `${Math.min(occupancy, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Summary Statistics</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          {
                            label: "Total Events",
                            value: events.length,
                            icon: Calendar,
                            color: "blue",
                            description: "Events created"
                          },
                          {
                            label: "Total Registrations",
                            value: events.reduce((acc, e) => acc + (e.registrations?.length || 0), 0),
                            icon: Users,
                            color: "pink",
                            description: "Total signups"
                          },
                          {
                            label: "Total Slots Available",
                            value: events.reduce((acc, e) => acc + (e.slots || 0), 0),
                            icon: TrendingUp,
                            color: "green",
                            description: "Capacity"
                          },
                          {
                            label: "Average Occupancy",
                            value: events.length > 0 ? Math.round(events.reduce((acc, e) => acc + ((e.registrations?.length || 0) / (e.slots || 1) * 100), 0) / events.length) : 0,
                            icon: BarChart3,
                            color: "purple",
                            suffix: "%",
                            description: "Average fill rate"
                          }
                        ].map((stat, idx) => {
                          const Icon = stat.icon;
                          const colors = {
                            blue: { bg: "bg-blue-100", text: "text-blue-600" },
                            pink: { bg: "bg-pink-100", text: "text-pink-600" },
                            green: { bg: "bg-green-100", text: "text-green-600" },
                            purple: { bg: "bg-purple-100", text: "text-purple-600" }
                          };
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className={`p-1.5 sm:p-2 rounded-lg ${colors[stat.color].bg} flex-shrink-0`}>
                                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors[stat.color].text}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-slate-700 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                                  <p className="text-slate-500 text-xs truncate">{stat.description}</p>
                                </div>
                              </div>
                              <span className="text-lg sm:text-2xl font-bold text-slate-900 flex-shrink-0 ml-2">{stat.value}{stat.suffix || ""}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Event Metrics */}
                  <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-6">Detailed Event Metrics</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-900">Event</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-900">Regs</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-900">Slots</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-900">Occupancy</th>
                            <th className="px-3 py-2 text-center font-semibold text-slate-900">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event, idx) => {
                            const regCount = event.registrations?.length || 0;
                            const occupancy = event.slots ? Math.round((regCount / event.slots) * 100) : 0;
                            const statusColor = occupancy >= 80 ? "red" : occupancy >= 50 ? "yellow" : "green";
                            return (
                              <tr key={event.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                                <td className="px-3 py-3 font-medium text-slate-900 truncate">{event.title.substring(0, 20)}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">{regCount}</span>
                                </td>
                                <td className="px-3 py-3 text-center font-semibold text-slate-900">{event.slots || 0}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                                    statusColor === "red" ? "bg-red-100 text-red-700" :
                                    statusColor === "yellow" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                                  }`}>{occupancy}%</span>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {new Date(event.date) < new Date() ? (
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Completed</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Active</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <section className="space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Settings</h2>
              <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">Profile Information</h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Name:</span>
                        <span className="font-semibold text-slate-900 truncate ml-2 text-right">{user?.displayName || "Not set"}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Email:</span>
                        <span className="font-semibold text-slate-900 truncate ml-2 text-right text-xs">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Role:</span>
                        <span className="font-semibold text-blue-600">Event Organizer</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-slate-200">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">Danger Zone</h3>
                    <button
                      onClick={handleLogout}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-xs sm:text-sm font-semibold hover:bg-red-100 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">© 2024 CampusEvents</div>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Terms</a>
            </div>
          </div>
        </footer>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg sm:rounded-2xl p-6 sm:p-8 max-w-sm shadow-2xl border border-slate-200 animate-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Delete Event?</h3>
              </div>
              <p className="text-slate-600 text-sm sm:text-base mb-6">This action cannot be undone. All event data and registrations will be permanently deleted.</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  ⚠️ Deleting this event will remove all associated registrations and attendance records.
                </p>
              </div>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 sm:py-3 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteEvent(deleteConfirm)}
                  className="flex-1 py-2 sm:py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all font-semibold text-sm"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg sm:rounded-2xl p-6 sm:p-8 max-w-2xl shadow-2xl border border-slate-200 animate-in my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Edit Event</h3>
                <button onClick={() => setEditingEvent(null)} className="text-slate-500 hover:text-slate-700 text-2xl font-bold">Close</button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Event Title</label>
                  <input type="text" value={editFormData.title || ""} onChange={(e) => handleEditChange("title", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Date</label>
                    <input type="date" value={editFormData.date ? new Date(editFormData.date).toISOString().split('T')[0] : ""} onChange={(e) => handleEditChange("date", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Time</label>
                    <input type="time" value={editFormData.time || ""} onChange={(e) => handleEditChange("time", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
                  <input type="text" value={editFormData.location || ""} onChange={(e) => handleEditChange("location", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Format</label>
                    <select value={editFormData.format || "online"} onChange={(e) => handleEditChange("format", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Slots</label>
                    <input type="number" value={editFormData.slots || 0} onChange={(e) => handleEditChange("slots", parseInt(e.target.value))} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                    <select value={editFormData.category || ""} onChange={(e) => handleEditChange("category", e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Category</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="competition">Competition</option>
                      <option value="cultural">Cultural</option>
                      <option value="tech-expo">Tech Expo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                  <textarea value={editFormData.description || ""} onChange={(e) => handleEditChange("description", e.target.value)} rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Registrations (Read-only)</label>
                  <input type="text" value={String(editingEvent.registrations?.length || 0) + " registered"} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600" disabled />
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button onClick={() => setEditingEvent(null)} className="flex-1 py-2 sm:py-3 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all font-semibold text-sm">Cancel</button>
                <button onClick={updateEvent} disabled={isSaving} className="flex-1 py-2 sm:py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm">{isSaving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrganizerDashboard;
