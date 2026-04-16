import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Users, Share2, Heart, MapPin } from "lucide-react";
import { auth } from "../Firebase.js";

const fetchEventById = async (id) => {
  const res = await axios.get(`http://localhost:5000/events/${id}`);
  return res.data;
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [liked, setLiked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Track Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed. User:", currentUser?.uid || "Not logged in");
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
    enabled: !!id,
    retry: 3,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      console.error("Query Error Details:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url
      });
    },
    onSuccess: (data) => {
      console.log("Event loaded successfully:", {
        id: data?.id,
        title: data?.title,
        slots: data?.slots
      });
    }
  });

  const handleRegister = async () => {
    if (!user) {
      setErrorMessage("Please login to register");
      setTimeout(() => navigate("/"), 1500);
      return;
    }

    if (!user.uid) {
      setErrorMessage("User ID not found. Please log out and log in again.");
      return;
    }

    try {
      setRegistering(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      console.log("Registering user:", user.uid, "for event:", id);
      
      const response = await axios.post(`http://localhost:5000/events/register/${id}`, {
        userId: user.uid,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Registration response:", response.data);
      setSuccessMessage(response.data.message || "Successfully registered!");
      refetch();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Registration error:", err);
      let message = "Registration failed!";
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data) {
        message = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
      
      setErrorMessage(message);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) {
      setErrorMessage("Please login");
      return;
    }

    if (!user.uid) {
      setErrorMessage("User ID not found. Please log out and log in again.");
      return;
    }

    if (!window.confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    try {
      setUnregistering(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      console.log("Unregistering user:", user.uid, "from event:", id);
      
      const response = await axios.post(`http://localhost:5000/events/unregister/${id}`, {
        userId: user.uid,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Unregistration response:", response.data);
      setSuccessMessage(response.data.message || "Successfully unregistered!");
      refetch();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Unregistration error:", err);
      let message = "Unregistration failed!";
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data) {
        message = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err.message) {
        message = err.message;
      }
      
      setErrorMessage(message);
    } finally {
      setUnregistering(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-rust"></div>
      </div>
    );
  }

  if (error || !event) {
    const errorMsg = error?.message || "Event not found";
    console.error("EventDetails Error - ID:", id, "Error:", error?.message);
    
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="bg-black backdrop-blur-xl border-b border-rust/30">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-sec hover:text-rust transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-sec">{errorMsg}</p>
          <p className="text-sm text-gray-sec/80 mt-2">Event ID: {id}</p>
        </div>
      </div>
    );
  }

  let registeredUsers = [];
  try {
    // Handle both cases: already parsed array or JSON string
    if (Array.isArray(event.registeredUsers)) {
      registeredUsers = event.registeredUsers;
    } else if (typeof event.registeredUsers === 'string') {
      registeredUsers = JSON.parse(event.registeredUsers) || [];
    }
  } catch (err) {
    console.error("Error parsing registered users:", err);
    registeredUsers = [];
  }

  const userUid = user?.uid;
  const isRegistered = userUid ? registeredUsers.includes(userUid) : false;
  const registrationCount = registeredUsers.length;
  const totalSlots = event.slots + registrationCount;
  const spotsLeft = event.slots;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Navigation */}
      <nav className="bg-black backdrop-blur-xl border-b border-rust/30 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-sec hover:text-rust transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8 border border-rust/30">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-gray-sec/80">
                  No Image Available
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {event.category && (
                  <span className="px-4 py-2 rounded-full bg-rust/80 text-black text-sm font-bold uppercase">
                    {event.category}
                  </span>
                )}
                {event.status && (
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      event.status === "approved"
                        ? "bg-green-500/80 text-black"
                        : "bg-yellow-500/80 text-black"
                    }`}
                  >
                    {event.status}
                  </span>
                )}
              </div>
            </div>

            {/* Event Title & Meta */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-rust mb-4">{event.title}</h1>

              {/* Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-black border border-rust/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-rust" />
                    <span className="text-xs text-gray-sec">Date</span>
                  </div>
                  <p className="font-semibold">
                    {event.date
                      ? new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </p>
                </div>

                <div className="bg-black border border-rust/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-rust" />
                    <span className="text-xs text-gray-sec">Registrations</span>
                  </div>
                  <p className="font-semibold">{registrationCount}</p>
                </div>

                <div className="bg-black border border-rust/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-rust" />
                    <span className="text-xs text-gray-sec">Spots Left</span>
                  </div>
                  <p className={`font-semibold ${spotsLeft > 0 ? "text-green-400" : "text-red-400"}`}>
                    {spotsLeft}
                  </p>
                </div>

                <div className="bg-black border border-rust/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-rust" />
                    <span className="text-xs text-gray-sec">Capacity</span>
                  </div>
                  <p className="font-semibold">{totalSlots}</p>
                </div>
              </div>

              {/* Status Badge */}
              {isRegistered && (
                <div className="inline-block px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 font-semibold mb-6">
                  ✓ You are registered for this event
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-black border border-rust/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-rust mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Details */}
            <div className="bg-black border border-rust/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-rust mb-6">Event Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-rust mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-sec">Date & Time</p>
                    <p className="text-lg font-semibold">
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "To be announced"}
                    </p>
                    {event.time && (
                      <p className="text-gray-sec text-sm mt-1">{event.time}</p>
                    )}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-rust mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-sec">Location</p>
                      <p className="text-lg font-semibold">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Users className="w-5 h-5 text-rust mt-1 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-sm text-gray-sec">Capacity</p>
                    <p className="text-lg font-semibold">
                      {registrationCount} / {totalSlots} registered
                    </p>
                    <div className="mt-2 w-full bg-gray-sec/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rust to-rust h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(registrationCount / totalSlots) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-sec mt-2">
                      {((registrationCount / totalSlots) * 100).toFixed(0)}% full
                    </p>
                  </div>
                </div>

                {event.eligibility && (
                  <div>
                    <p className="text-sm text-gray-sec">Eligibility</p>
                    <p className="text-lg font-semibold">{event.eligibility}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Messages */}
            {errorMessage && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            {/* Registration Card */}
            <div className="bg-black border border-rust/30 rounded-lg p-6 sticky top-24 mb-6">
              <h3 className="text-lg font-bold text-rust mb-6">Registration</h3>

              {!user ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
                    <p className="text-yellow-400 font-semibold text-center">
                      ⚠️ Please Login
                    </p>
                  </div>
                  <p className="text-gray-sec text-sm text-center">
                    You need to log in to register for this event.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rust to-rust text-black font-semibold hover:scale-105 transition-transform"
                  >
                    Go to Login
                  </button>
                </div>
              ) : isRegistered ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50">
                    <p className="text-green-400 font-semibold text-center mb-2">
                      ✓ You're registered!
                    </p>
                    <p className="text-green-400/70 text-xs text-center">
                      You will receive updates about this event.
                    </p>
                  </div>
                  <button
                    onClick={handleUnregister}
                    disabled={unregistering}
                    className="w-full py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unregistering ? "Unregistering..." : "Unregister"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {spotsLeft > 0 ? (
                    <>
                      <button
                        onClick={handleRegister}
                        disabled={registering || !user}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rust to-rust text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!user ? "Login to Register" : registering ? "Registering..." : "Register Now"}
                      </button>
                      <p className="text-gray-sec text-sm text-center">
                        Only <span className="text-rust font-semibold">{spotsLeft}</span> spot{spotsLeft !== 1 ? "s" : ""} left!
                      </p>
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                      <p className="text-red-400 font-semibold text-center">
                        Event is Full
                      </p>
                      <p className="text-red-400/70 text-xs text-center mt-2">
                        All {totalSlots} spots have been taken.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Share Card */}
            <div className="bg-black border border-rust/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-rust mb-6">Share Event</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setSuccessMessage("Link copied!");
                    setTimeout(() => setSuccessMessage(""), 2000);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-black/80 hover:bg-gray-sec/20 text-gray-300 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    liked
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-black/80 text-gray-300 border border-slate-700"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
