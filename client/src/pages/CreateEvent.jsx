import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Menu, X, LayoutDashboard, Calendar, ClipboardList, BarChart3, Settings, LogOut } from "lucide-react";
import { z } from "zod";
import { auth } from "../firebase.js";

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine(val => val !== "", "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  slots: z.string().transform(Number).refine(val => val > 0, "Slots must be greater than 0"),
  imageUrl: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  format: z.string().min(1, "Event format is required"),
  createdBy: z.string().min(1, "User ID is required"),
});

function CreateEvent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    slots: "",
    imageUrl: "",
    category: "",
    format: "",
    createdBy: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setForm(prev => ({
          ...prev,
          createdBy: currentUser.uid
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form and use transformed values
      const parsed = eventSchema.parse(form);

      setIsSubmitting(true);
      await axios.post("http://localhost:5000/events", parsed);
      navigate("/organizer-dashboard");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = {};
        err.errors.forEach(error => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ submit: err.response?.data?.message || "Failed to create event. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-y-auto fixed h-screen z-40 md:relative`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
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
                  onClick={() => navigate(item.id === "events" ? "/organizer-dashboard?tab=events" : `/organizer-dashboard?tab=${item.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    false
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 shadow-sm"
                      : "hover:bg-slate-50"
                  }`}
                  title={item.description}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 text-slate-400 hover:${item.color.replace("text-", "text-")}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium text-slate-600">
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
        <div className="p-4 border-t border-slate-200">
          <div className={`flex items-center gap-3 p-3 rounded-lg bg-slate-50 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{user?.displayName?.[0] || user?.email?.[0] || "O"}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.displayName || "Organizer"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                await auth.signOut();
                navigate("/");
              } catch (err) {
                console.error("Logout error:", err);
              }
            }}
            className={`w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium ${!sidebarOpen && "aspect-square"}`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Create New Event
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                Add a new event to your organizer portfolio
              </p>
            </div>
            <div className="text-right text-xs sm:text-sm text-slate-500 whitespace-nowrap">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-4 lg:p-8 max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-lg sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Event Details
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600">Fill in the details below to create your event</p>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {errors.submit}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Tech Conference 2024"
                value={form.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                } text-slate-900 placeholder-slate-400`}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe your event..."
                value={form.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 resize-none ${
                  errors.description
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                } text-slate-900 placeholder-slate-400`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.description}</p>
              )}
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                    errors.date
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                  } text-slate-900`}
                />
                {errors.date && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.date}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Event Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                    errors.time
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                  } text-slate-900`}
                />
                {errors.time && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Event Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Convention Center, Hall A"
                value={form.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                  errors.location
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                } text-slate-900 placeholder-slate-400`}
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.location}</p>
              )}
            </div>

            {/* Slots & Category & Format Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slots */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Available Slots
                </label>
                <input
                  type="number"
                  name="slots"
                  placeholder="e.g., 100"
                  value={form.slots}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                    errors.slots
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                  } text-slate-900 placeholder-slate-400`}
                />
                {errors.slots && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.slots}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                    errors.category
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                  } text-slate-900`}
                >
                  <option value="">Select Category</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="guest-lecture">Guest Lecture</option>
                  <option value="cultural">Cultural Event</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.category}</p>
                )}
              </div>

              {/* Event Format */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Event Format
                </label>
                <select
                  name="format"
                  value={form.format}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                    errors.format
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                  } text-slate-900`}
                >
                  <option value="">Select Format</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.format && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.format}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Event Poster URL
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-white border transition-colors focus:outline-none focus:ring-2 ${
                  errors.imageUrl
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-200 focus:ring-blue-500 focus:border-blue-300"
                } text-slate-900 placeholder-slate-400`}
              />
              {errors.imageUrl && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.imageUrl}</p>
              )}
            </div>



            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/organizer-dashboard")}
                className="flex-1 py-3 px-6 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateEvent;