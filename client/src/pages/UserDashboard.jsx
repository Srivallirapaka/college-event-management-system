import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Calendar, Users, ArrowRight, LogOut, Ticket, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase.js";

const fetchEvents = async () => {
  const res = await axios.get("http://localhost:5000/events");
  return res.data;
};

const fetchMyEvents = async (userId) => {
  const res = await axios.get(`http://localhost:5000/events/user/${userId}`);
  return res.data;
};

function UserDashboard() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const user = auth.currentUser;

  const categories = [
    { value: "all", label: "All Events" },
    { value: "hackathon", label: "Hackathons" },
    { value: "seminar", label: "Seminars" },
    { value: "workshop", label: "Workshops" },
    { value: "guest-lecture", label: "Guest Lectures" },
    { value: "cultural", label: "Cultural" },
  ];

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const { data: myEvents = [], isLoading: myEventsLoading } = useQuery({
    queryKey: ["myEvents", user?.uid],
    queryFn: () => fetchMyEvents(user?.uid),
    enabled: !!user?.uid,
  });

  // Filter events
  const filteredEvents = events
    .filter((event) => event.status === "approved") // Only show approved events to users
    .filter((event) => {
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  const registerEvent = async (id) => {
    try {
      setRegistering(id);
      await axios.post(`http://localhost:5000/events/register/${id}`, {
        userId: user?.uid,
        email: user?.email,
      });
      alert("Registration successful!");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    } finally {
      setRegistering(null);
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-rust/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            EventHub
          </h1>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rust/10 border border-rust/30">
              <span className="text-sm text-gray-sec">Welcome,</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-rust/20">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "browse"
                ? "border-rust text-rust"
                : "border-transparent text-gray-sec hover:text-rust"
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Browse Events
            </span>
          </button>
          <button
            onClick={() => setActiveTab("myEvents")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "myEvents"
                ? "border-rust text-rust"
                : "border-transparent text-gray-sec hover:text-rust"
            }`}
          >
            <span className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              My Events
            </span>
          </button>
        </div>

        {/* Browse Events Tab */}
        {activeTab === "browse" && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-rust">Available Events</h2>

            {/* Search Bar */}
            <div className="mb-8 relative">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-sec/80" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/50 border border-rust/30 focus:border-rust focus:outline-none text-white placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-3.5 text-gray-sec/80 hover:text-rust"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full transition-all font-semibold ${
                    selectedCategory === cat.value
                      ? "bg-gradient-to-r from-rust to-rust text-black"
                      : "bg-black/50 border border-rust/30 text-gray-sec hover:border-rust hover:text-rust"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rust"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                Error loading events. Please try again.
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-sec text-lg">No events available yet.</p>
              </div>
            )}

            {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-sec text-lg">No events match your search.</p>
              </div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isRegistered = myEvents.some(e => e.id === event.id);
                
                return (
                  <div
                    key={event.id}
                    className="group bg-black backdrop-blur border border-rust/30 rounded-xl overflow-hidden hover:border-rust/50 transition-all duration-300 hover:shadow-lg hover:shadow-rust-glow cursor-pointer"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden bg-black/80">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-sec/80">
                          No Image
                        </div>
                      )}
                      {event.category && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-rust/80 text-black text-xs font-bold uppercase">
                          {event.category}
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      {/* Event Header */}
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-rust group-hover:text-rust transition-colors line-clamp-2">
                          {event.title}
                        </h2>
                        {isRegistered && (
                          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-semibold">
                            ✓ Registered
                          </span>
                        )}
                      </div>

                      {/* Event Description */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Event Meta */}
                      <div className="space-y-2 mb-6">
                        {event.date && (
                          <div className="flex items-center gap-2 text-gray-sec text-sm">
                            <Calendar className="w-4 h-4 text-rust" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        )}
                        {event.slots !== undefined && (
                          <div className="flex items-center gap-2 text-gray-sec text-sm">
                            <Users className="w-4 h-4 text-rust" />
                            {event.slots} slots available
                          </div>
                        )}
                      </div>

                      {/* Register Button */}
                      {!isRegistered ? (
                        <button
                          onClick={() => registerEvent(event.id)}
                          disabled={registering === event.id}
                          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-rust to-rust text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {registering === event.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                              Registering...
                            </>
                          ) : (
                            <>
                              Register
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 px-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-semibold cursor-default"
                        >
                          Already Registered
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === "myEvents" && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-rust">My Registered Events</h2>

            {myEventsLoading && (
              <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rust"></div>
              </div>
            )}

            {!myEventsLoading && myEvents.length === 0 && (
              <div className="text-center py-20">
                <Ticket className="w-16 h-16 text-gray-sec/80 mx-auto mb-4 opacity-50" />
                <p className="text-gray-sec text-lg">You haven't registered for any events yet.</p>
                <p className="text-gray-sec/80 text-sm mt-2">Browse events to get started!</p>
              </div>
            )}

            {/* My Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-black backdrop-blur border border-green-500/30 rounded-xl overflow-hidden hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden bg-black/80">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-sec/80">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500/80 text-black text-xs font-bold">
                      ✓ Registered
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Event Header */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-green-400 line-clamp-2">
                        {event.title}
                      </h2>
                    </div>

                    {/* Event Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Meta */}
                    <div className="space-y-2 mb-6">
                      {event.date && (
                        <div className="flex items-center gap-2 text-gray-sec text-sm">
                          <Calendar className="w-4 h-4 text-rust" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Info Button */}
                    <button className="w-full py-2 px-4 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 transition-colors font-semibold">
                      Event Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
