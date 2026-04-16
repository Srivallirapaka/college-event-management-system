import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo } from "react";
import { Calendar, Users, ArrowRight, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase.js";

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
      {/* Top navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">CampusEvents</div>
            <select className="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Hackathon</option>
              <option>Workshop</option>
              <option>Seminar</option>
            </select>
            <select className="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option>All Formats</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search events, keywords..." className="border border-gray-200 rounded-md px-10 py-2 w-72 text-sm" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button onClick={() => navigate('/create')} className="px-4 py-2 rounded-lg btn-neon text-sm font-semibold">+ New Event</button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Latest Events (horizontal scroller) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Latest Events</h2>
            <div className="text-sm text-gray-500">Updated recently</div>
          </div>
          <div className="scroll-x pb-4">
            {(events.slice(0,8)).map(ev => (
              <div key={ev.id} className="w-56 card p-0 overflow-hidden rounded-lg flex-shrink-0 neon-glow">
                <div className="h-36 w-full bg-gray-100 overflow-hidden">
                    {ev.imageUrl ? (
                      <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#f3f4f6" />
                          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif">No image</text>
                        </svg>
                      </div>
                    )}
                </div>
                <div className="p-3 text-left">
                  <div className="font-semibold text-sm line-clamp-2">{ev.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{ev.date ? new Date(ev.date).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={()=>setFilter('today')} className={`filter-btn ${filter==='today' ? 'btn-neon text-white' : 'text-gray-600'}`}>Today</button>
          <button onClick={()=>setFilter('weekend')} className={`filter-btn ${filter==='weekend' ? 'btn-neon text-white' : 'text-gray-600'}`}>This Weekend</button>
          <button onClick={()=>setFilter('month')} className={`filter-btn ${filter==='month' ? 'btn-neon text-white' : 'text-gray-600'}`}>This Month</button>
          <button onClick={()=>{setFilter('all'); setSearch('');}} className="ml-auto text-sm text-gray-500">Clear</button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center min-h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-300"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600">
            Error loading events. Please try again.
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No events available yet.</p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card p-4 hover:shadow-md transition-shadow transform hover:-translate-y-1">
              <div className="h-40 w-full bg-gray-100 rounded-md overflow-hidden mb-3">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="100%" height="100%" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#f3f4f6" />
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#9ca3af" fontSize="14" fontFamily="Inter, sans-serif">No image</text>
                      </svg>
                    </div>
                  )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  {event.date && <><Calendar className="w-4 h-4 text-gray-400" />{new Date(event.date).toLocaleDateString()}</>}
                </div>
                <div className="flex-1 flex items-center gap-2 justify-end">
                  <button onClick={() => navigate(`/event/${event.id}`)} className="px-3 py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50">Details</button>
                  <button onClick={() => registerEvent(event.id)} disabled={registering === event.id} className="px-3 py-2 rounded-md bg-gradient-to-r from-neon-cyan to-neon-pink text-white text-sm font-semibold hover:shadow-neon-pink/30 disabled:opacity-50">
                    {registering === event.id ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={()=>navigate('/events')} className="px-6 py-3 rounded-lg btn-neon font-semibold text-lg">Explore All Events</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div>© CampusEvents</div>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;