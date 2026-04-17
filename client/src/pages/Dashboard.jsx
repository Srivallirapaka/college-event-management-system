import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo } from "react";
import { Calendar, LogOut, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";

const fetchEvents = async () => {
  const res = await axios.get("http://localhost:5000/events");
  return res.data;
};

function Dashboard() {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(null);
  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    let out = events || [];
    if (filter === "today") {
      const today = new Date().toDateString();
      out = out.filter(e => new Date(e.date).toDateString() === today);
    } else if (filter === "weekend") {
      const now = new Date();
      const end = new Date(); end.setDate(now.getDate() + (6 - now.getDay()));
      out = out.filter(e => new Date(e.date) >= now && new Date(e.date) <= end);
    } else if (filter === "month") {
      const now = new Date();
      out = out.filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(e => (e.title || "").toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q));
    }
    return out;
  }, [events, filter, search]);

  const registerEvent = async (id) => {
    try {
      setRegistering(id);
      await axios.post(`http://localhost:5000/events/register/${id}`);
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Left: Project Name + Dropdowns */}
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold tracking-tight text-gray-900">CampusEvents</div>
            <div className="h-6 w-px bg-gray-200"></div>
            
            {/* Event Type Dropdown */}
            <select className="nav-select text-sm font-medium text-gray-700">
              <option>All Types</option>
              <option>Hackathon</option>
              <option>Workshop</option>
              <option>Seminar</option>
              <option>Conference</option>
              <option>Concert</option>
            </select>
            
            {/* Event Format Dropdown */}
            <select className="nav-select text-sm font-medium text-gray-700">
              <option>All Formats</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </select>
          </div>

          {/* Right: Search Bar + Buttons */}
          <div className="ml-auto flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-80">
              <input 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)} 
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Latest Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Latest Events</h2>
              <p className="text-sm text-gray-500 mt-1">Most recently added to our platform</p>
            </div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="scroll-x pb-4">
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
              onClick={()=>setFilter('today')} 
              className={`filter-btn transition-all duration-200 ${filter==='today' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              Today
            </button>
            <button 
              onClick={()=>setFilter('weekend')} 
              className={`filter-btn transition-all duration-200 ${filter==='weekend' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              This Weekend
            </button>
            <button 
              onClick={()=>setFilter('month')} 
              className={`filter-btn transition-all duration-200 ${filter==='month' ? 'btn-neon text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'}`}
            >
              This Month
            </button>
            <button 
              onClick={()=>{setFilter('all'); setSearch('');}} 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredEvents.map((event) => (
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
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => navigate(`/event/${event.id}`)} 
                      className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => registerEvent(event.id)} 
                      disabled={registering === event.id}
                      className="flex-1 px-3 py-2.5 rounded-lg btn-neon text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-600/30"
                    >
                      {registering === event.id ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Filtered State */}
        {!isLoading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-24">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No events match your filters</p>
            <button 
              onClick={()=>{setFilter('all'); setSearch('');}}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-semibold mt-3 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Explore All Events Button */}
        <div className="flex justify-center mb-16">
          <button 
            onClick={()=>navigate('/events')} 
            className="btn-neon px-8 py-3.5 rounded-lg text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/40 transform hover:scale-105"
          >
            Explore All Events
          </button>
        </div>
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

export default Dashboard;