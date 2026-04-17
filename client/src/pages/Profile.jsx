import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase.js";
import { Home, LogOut, User, Calendar, Award, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [badges, setBadges] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations');

  useEffect(() => {
    const u = auth.currentUser;
    setUser(u);

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Use uid (userId) instead of email for fetching registered events
        if (!u?.uid) return;
        
        const [eventsRes, badgesRes, feedbackRes] = await Promise.all([
          axios.get(`http://localhost:5000/events/user/${u.uid}`),
          axios.get(`http://localhost:5000/badges/user/${u.email}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/feedback/user/${u.email}`).catch(() => ({ data: [] }))
        ]);
        
        setEvents(eventsRes.data || []);
        setBadges(badgesRes.data || []);
        setFeedback(feedbackRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleHome = () => {
    navigate("/user-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-28">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-slate-900 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Profile Avatar & Info */}
          <div className="flex items-end gap-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg ring-4 ring-white/30 flex-shrink-0">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold tracking-tight">{user?.displayName || 'Guest User'}</h1>
              <p className="text-blue-700 text-sm mt-1">{user?.email || localStorage.getItem('userEmail')}</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm bg-blue-200/60 px-3 py-1 rounded-full text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span>{events.length} Events Registered</span>
                </div>
                <div className="flex items-center gap-1 text-sm bg-blue-200/60 px-3 py-1 rounded-full text-blue-800">
                  <Award className="w-4 h-4" />
                  <span>{badges.length} Badges Earned</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          {[
            { id: 'registrations', label: 'My Events', icon: Calendar },
            { id: 'badges', label: 'Badges', icon: Award },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            {/* My Registrations Tab */}
            {activeTab === 'registrations' && (
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium text-lg">No events registered yet</p>
                    <p className="text-slate-500 text-sm mt-1">Explore and register for exciting events</p>
                    <button
                      onClick={handleHome}
                      className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Browse Events
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        {/* Event Poster */}
                        <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓ Registered</span>
                            <span className="text-xs text-slate-500">{event.registrations?.length || 0} attended</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div>
                {badges.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium text-lg">No badges earned yet</p>
                    <p className="text-slate-500 text-sm mt-1">Attend events to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-900 mt-4 text-sm">{badge.title || 'Event Badge'}</h4>
                        <p className="text-xs text-slate-500 mt-2">{badge.description || 'Achievement unlocked!'}</p>
                        <p className="text-xs text-slate-400 mt-3">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {feedback.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium text-lg">No feedback submitted yet</p>
                    <p className="text-slate-500 text-sm mt-1">Share your experience after attending events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedback.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-slate-900">{item.eventTitle || 'Event'}</h4>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < (item.rating || 0) ? 'text-yellow-400' : 'text-slate-300'}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm">{item.comment}</p>
                        <p className="text-xs text-slate-400 mt-3">{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Recently'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleHome}
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 hover:text-blue-600"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'registrations'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Events</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <Award className="w-6 h-6" />
            <span className="text-xs font-medium">Badges</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors text-slate-600 hover:text-red-600"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Profile;
