import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { Calendar, LogOut, Search, Sparkles, ChevronLeft, ChevronRight, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase.js";

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
  const location = useLocation();
  const queryClient = useQueryClient();
  const [registering, setRegistering] = useState(null);
  const [filter, setFilter] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [eventFormat, setEventFormat] = useState("all");
  const [search, setSearch] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const user = auth.currentUser;

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ["myEvents", user?.uid],
    queryFn: () => fetchMyEvents(user?.uid),
    enabled: !!user?.uid,
  });

  const registerEvent = async (id) => {
    if (!user?.uid) {
      setErrorMessage("Please login to register for events");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    try {
      setRegistering(id);
      setErrorMessage("");
      setSuccessMessage("");
      
      const response = await axios.post(`http://localhost:5000/events/register/${id}`, {
        userId: user?.uid,
        email: user?.email,
      });
      
      setSuccessMessage(response.data.message || "✓ Successfully registered!");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["myEvents", user?.uid] });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Registration error:", err);
      const message = err.response?.data?.message || "Registration failed! Please try again.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setRegistering(null);
    }
  };

  // Handle auto-registration when coming from EventDetails
  useEffect(() => {
    if (location.state?.eventId && user?.uid) {
      const eventId = location.state.eventId;
      // Delay slightly to ensure events are loaded
      const timer = setTimeout(() => {
        registerEvent(eventId);
      }, 500);
      
      // Clean up the navigation state
      navigate(location.pathname, { replace: true });
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.eventId, user?.uid, navigate, location.pathname]);

  const filteredEvents = useMemo(() => {
    let out = events || [];
    const now = new Date();
    
    // Filter out past events
    out = out.filter(e => new Date(e.date) >= now);
    
    // Filter by event type (category)
    if (eventType !== "all") {
      out = out.filter(e => (e.category || "").toLowerCase() === eventType.toLowerCase());
    }
    
    // Filter by event format
    if (eventFormat !== "all") {
      out = out.filter(e => (e.format || "").toLowerCase() === eventFormat.toLowerCase());
    }
    
    // Filter by time period
    if (filter === "today") {
      const today = new Date().toDateString();
      out = out.filter(e => new Date(e.date).toDateString() === today);
    } else if (filter === "weekend") {
      const weekendEnd = new Date(); weekendEnd.setDate(now.getDate() + (6 - now.getDay()));
      out = out.filter(e => new Date(e.date) >= now && new Date(e.date) <= weekendEnd);
    } else if (filter === "month") {
      out = out.filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear());
    }
    
    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(e => (e.title || "").toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q));
    }
    return out;
  }, [events, filter, eventType, eventFormat, search]);

  const unregisterEvent = async (id) => {
    if (!window.confirm("Are you sure you want to unregister from this event?")) {
      return;
    }
    
    try {
      setRegistering(id);
      setErrorMessage("");
      setSuccessMessage("");
      
      const response = await axios.post(`http://localhost:5000/events/unregister/${id}`, {
        userId: user?.uid,
        email: user?.email,
      });
      
      setSuccessMessage(response.data.message || "✓ Successfully unregistered!");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["myEvents", user?.uid] });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Unregistration error:", err);
      const message = err.response?.data?.message || "Unregistration failed! Please try again.";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Left: Project Name + Dropdowns */}
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">CampusEvents</div>
            <div className="h-6 w-px bg-gray-200"></div>
            
            {/* Event Type Dropdown */}
            <select value={eventType} onChange={(e) => {setEventType(e.target.value); setCurrentPage(1);}} className="nav-select text-sm font-medium text-gray-700 cursor-pointer hover:border-cyan-400">
              <option value="all">All Types</option>
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="concert">Concert</option>
            </select>
            
            {/* Event Format Dropdown */}
            <select value={eventFormat} onChange={(e) => {setEventFormat(e.target.value); setCurrentPage(1);}} className="nav-select text-sm font-medium text-gray-700 cursor-pointer hover:border-cyan-400">
              <option value="all">All Formats</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Right: Search Bar + Buttons */}
          <div className="ml-auto flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <input 
                value={search} 
                onChange={(e)=>{setSearch(e.target.value); setCurrentPage(1);}} 
                placeholder="Search events..." 
                className="search-input w-full px-4 py-2.5 pl-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-cyan-400 transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="nav-btn px-3.5 py-2.5 rounded-lg border border-blue-300 bg-blue-50 text-sm text-blue-700 hover:bg-blue-100 transition-all duration-200 flex items-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-blue-800" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Success & Error Messages */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg z-40">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 shadow-lg z-40">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Hero Carousel - Top 3 Events */}
        {!isLoading && events.length > 0 && (
          <section className="mb-16">
            <div className="relative rounded-2xl overflow-hidden h-96 lg:h-[500px] group">
              {/* Carousel Container */}
              <div className="relative w-full h-full">
                {events.slice(0, 3).map((event, idx) => (
                  <div
                    key={event.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      idx === carouselIndex % 3 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12 text-white">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-cyan-500 text-black rounded-full text-xs font-bold">
                            Featured
                          </span>
                          {event.category && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                              {event.category}
                            </span>
                          )}
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
                          {event.title}
                        </h2>
                        <p className="text-gray-200 mb-6 line-clamp-2 text-lg">
                          {event.description}
                        </p>
                        
                        {/* Event Meta */}
                        <div className="flex flex-wrap gap-6 mb-8">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span className="font-semibold">
                              {event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">
                              {event.registrations?.length || 0} registered
                            </span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-600/50 transform hover:scale-105 transition-all duration-300"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCarouselIndex((carouselIndex - 1 + 3) % 3)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCarouselIndex((carouselIndex + 1) % 3)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {events.slice(0, 3).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === carouselIndex % 3
                        ? "w-8 bg-cyan-400"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Latest Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Latest Events</h2>
              <p className="text-sm text-gray-500 mt-1">Most recently added to our platform</p>
            </div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="scroll-x pb-4 overflow-x-auto scrollbar-hide">
            {(events.slice(0, 8)).map(ev => (
              <div 
                key={ev.id} 
                className="event-card-poster flex-shrink-0 w-56 rounded-lg overflow-hidden bg-white border border-gray-200 group cursor-pointer transition-all duration-300 hover:shadow-xl"
                onClick={() => navigate(`/event/${ev.id}`)}
              >
                {/* Poster Image */}
                <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  {ev.imageUrl ? (
                    <img 
                      src={ev.imageUrl} 
                      alt={ev.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Sparkles className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBA'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Buttons Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={()=>{setFilter('today'); setCurrentPage(1);}} 
              className={`filter-btn transition-all duration-200 ${filter==='today' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              Today
            </button>
            <button 
              onClick={()=>{setFilter('weekend'); setCurrentPage(1);}} 
              className={`filter-btn transition-all duration-200 ${filter==='weekend' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              This Weekend
            </button>
            <button 
              onClick={()=>{setFilter('month'); setCurrentPage(1);}} 
              className={`filter-btn transition-all duration-200 ${filter==='month' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              This Month
            </button>
            <button 
              onClick={()=>{setFilter('all'); setEventType('all'); setEventFormat('all'); setSearch(''); setCurrentPage(1);}} 
              className="ml-auto text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-cyan-500"></div>
              <p className="text-gray-500 text-sm">Loading events...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">
            <p className="font-semibold">Unable to load events</p>
            <p className="text-sm mt-1">Please try refreshing or contact support</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && events.length === 0 && (
          <div className="text-center py-24">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No events available yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for exciting events!</p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((event) => {
                const isRegistered = myEvents.some(e => e.id === event.id);
                return (
                  <div 
                    key={event.id} 
                    className="event-card group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Event Poster Image */}
                    <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-10">
                        {event.description}
                      </p>

                      {/* Date and Actions */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                        </div>
                        {isRegistered && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">✓ Registered</span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => navigate(`/event/${event.id}`)} 
                          className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                          Details
                        </button>
                        {!isRegistered ? (
                          <button 
                            onClick={() => registerEvent(event.id)} 
                            disabled={registering === event.id}
                            className="flex-1 px-3 py-2.5 rounded-lg btn-neon text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-600/30"
                          >
                            {registering === event.id ? 'Registering...' : 'Register'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => unregisterEvent(event.id)}
                            disabled={registering === event.id}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-orange-50 border border-orange-300 text-orange-700 text-sm font-semibold transition-all duration-200 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {registering === event.id ? 'Unregistering...' : 'Unregister'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {Math.ceil(filteredEvents.length / itemsPerPage) > 1 && (
              <div className="flex justify-center items-center gap-2 mb-16">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.ceil(filteredEvents.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentPage === page
                        ? 'btn-neon text-white shadow-lg shadow-blue-600/30'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredEvents.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredEvents.length / itemsPerPage)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty Filtered State */}
        {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-24">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No events match your filters</p>
            <button 
              onClick={()=>{setFilter('all'); setEventType('all'); setEventFormat('all'); setSearch(''); setCurrentPage(1);}}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold mt-3 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">© 2024 CampusEvents</div>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default UserDashboard;