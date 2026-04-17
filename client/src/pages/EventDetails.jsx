import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Users, Share2, Heart, MapPin, QrCode, Download, Award, MessageSquare, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { auth } from "../firebase.js";

const fetchEventById = async (id) => {
  const res = await axios.get(`http://localhost:5000/events/${id}`);
  return res.data;
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unregistering, setUnregistering] = useState(false);
  const [liked, setLiked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "", wouldAttendAgain: true });

  // Track Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed. User:", currentUser?.uid || "Not logged in");
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user badges when user is logged in
  useEffect(() => {
    if (user?.uid) {
      axios.get(`http://localhost:5000/badges/user/${user.uid}`)
        .then(res => setUserBadges(res.data || []))
        .catch(err => console.error("Error fetching badges:", err));
        
      // Check if user has already checked in
      axios.get(`http://localhost:5000/events/attendance/check/${id}/${user.uid}`)
        .then(res => setHasAttended(res.data?.hasAttended || false))
        .catch(err => console.error("Error checking attendance:", err));
    }
  }, [user?.uid]);

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
      await queryClient.invalidateQueries({ queryKey: ["event", id] });
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

  const downloadQR = () => {
    const element = document.getElementById("qrcode");
    const canvas = element?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event?.title}-qr.png`;
      link.click();
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      await axios.post(`http://localhost:5000/events/${id}/feedback`, {
        userId: user?.uid,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        wouldAttendAgain: feedbackData.wouldAttendAgain,
      });
      setSuccessMessage("Thank you for your feedback!");
      setShowFeedback(false);
      setFeedbackData({ rating: 5, comment: "", wouldAttendAgain: true });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Feedback submission error:", err);
      setErrorMessage("Failed to submit feedback");
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      const qrValue = `${id}-${user?.uid}`;
      
      const response = await axios.post(`http://localhost:5000/events/attendance/checkin/${id}`, {
        userId: user?.uid,
        qrCode: qrValue,
      });
      
      setSuccessMessage("✓ Attendance recorded! Welcome to the event!");
      setHasAttended(true);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMsg = err.response?.data?.message || "Failed to record attendance";
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setSuccessMessage("Link copied to clipboard!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    const errorMsg = error?.message || "Event not found";
    console.error("EventDetails Error - ID:", id, "Error:", error?.message);
    
    return (
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-block px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Return Home
          </button>
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Back to Events
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Share event"
            >
              <Share2 className="w-5 h-5 text-gray-700 hover:text-cyan-600" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full transition-colors ${liked ? "bg-red-100" : "hover:bg-gray-100"}`}
              title="Like event"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section - Large Image Banner */}
        <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
          <div className="relative h-96 lg:h-[500px] w-full overflow-hidden group">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              </div>
            )}
            
            {/* Overlay with Tags */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              {event.category && (
                <span className="px-4 py-2 bg-cyan-500 text-white rounded-full text-sm font-bold shadow-lg">
                  {event.category}
                </span>
              )}
              {event.status && (
                <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                  event.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                }`}>
                  {event.status === "approved" ? "✓ Active" : "Pending"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                {event.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-semibold text-gray-600">Date & Time</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA"}
                </p>
                {event.time && <p className="text-sm text-gray-600 mt-1">{event.time}</p>}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-600">Registrations</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{registrationCount}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-600">Spots Left</span>
                </div>
                <p className={`text-lg font-bold ${spotsLeft > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {spotsLeft}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-600">Capacity</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{totalSlots}</p>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Registration Progress</h3>
                <span className="text-sm font-semibold text-cyan-600">
                  {((registrationCount / totalSlots) * 100).toFixed(0)}% full
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(registrationCount / totalSlots) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {registrationCount} of {totalSlots} spots filled
              </p>
            </div>

            {/* Event Details Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Event Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Calendar className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date & Time</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "To be announced"}
                    </p>
                    {event.time && <p className="text-gray-600 mt-1">{event.time}</p>}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-4 pt-6 border-t border-gray-200">
                    <div className="flex-shrink-0">
                      <MapPin className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.eligibility && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Eligibility</p>
                    <p className="text-lg text-gray-900 font-medium">{event.eligibility}</p>
                  </div>
                )}
              </div>
            </div>

            {/* About This Event */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6 h-fit">
            {/* Messages */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-semibold animate-in fade-in">
                ✓ {successMessage}
              </div>
            )}

            {/* Registration Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Registration</h3>

              {!user ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
                    <p className="text-blue-900 font-semibold">🔐 Login Required</p>
                    <p className="text-blue-700 text-sm mt-1">Sign in to register for this event</p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Sign In
                  </button>
                </div>
              ) : isRegistered ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                    <p className="text-green-900 font-bold text-lg mb-1">✓ Registered!</p>
                    <p className="text-green-700 text-sm">You're all set for this event</p>
                  </div>
                  <button
                    onClick={handleUnregister}
                    disabled={unregistering}
                    className="w-full py-3 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 font-bold transition-colors disabled:opacity-50"
                  >
                    {unregistering ? "Unregistering..." : "Unregister"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {spotsLeft > 0 ? (
                    <>
                      <button
                        onClick={() => navigate("/user-dashboard", { state: { eventId: id } })}
                        disabled={!user}
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Register Now
                      </button>
                      <p className="text-center text-sm text-gray-600">
                        Only <span className="font-bold text-cyan-600">{spotsLeft}</span> spot{spotsLeft !== 1 ? "s" : ""} left!
                      </p>
                    </>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                      <p className="text-red-900 font-bold">Event Full</p>
                      <p className="text-red-700 text-sm mt-1">All spots have been taken</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* QR Code Section */}
            {isRegistered && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {hasAttended ? "✓ Checked In" : "Event Check-in"}
                  </h3>
                </div>
                
                {hasAttended ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-green-600 text-lg">You've checked in!</p>
                    <p className="text-gray-600 text-sm mt-1">Your attendance has been recorded</p>
                  </div>
                ) : showQRCode ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600 font-medium mb-3">
                      Present this QR code for check-in
                    </p>
                    <div id="qrcode" className="flex justify-center bg-white p-4 rounded-lg border border-purple-300 inline-flex w-full justify-center">
                      <QRCodeSVG 
                        value={`${id}-${user?.uid}`} 
                        size={220} 
                        level="H"
                        fgColor="#7c3aed"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={handleCheckIn}
                        disabled={isCheckingIn}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        {isCheckingIn ? "Recording attendance..." : "✓ Check In Now"}
                      </button>
                      <button
                        onClick={downloadQR}
                        className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download QR
                      </button>
                      <button
                        onClick={() => setShowQRCode(false)}
                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-colors"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="w-full px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 rounded-lg font-bold transition-colors"
                  >
                    Show QR Code for Check-in
                  </button>
                )}
              </div>
            )}

            {/* Badges Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Your Badges</h3>
              </div>
              
              {userBadges && userBadges.length > 0 ? (
                <div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {userBadges.map(badge => (
                      <div key={badge.id} className="text-center group cursor-pointer">
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 line-clamp-2">
                          {badge.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Badge Progress
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all rounded-full" 
                        style={{ width: `${Math.min((userBadges.length / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 font-bold mt-2">
                      {userBadges.length} / 5 badges earned
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No badges yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Register and attend more events to earn badges!
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            {isRegistered && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-lg font-bold text-gray-900">Event Feedback</h3>
                </div>
                
                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="w-full px-4 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 rounded-lg font-bold transition-colors"
                  >
                    Share Feedback
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Rate this event:
                      </label>
                      <div className="flex gap-2 justify-between">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                            className={`text-3xl transition-transform hover:scale-125 ${
                              feedbackData.rating >= star ? "text-yellow-400 scale-110" : "text-gray-300"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Your feedback:
                      </label>
                      <textarea
                        placeholder="Tell us about your experience..."
                        value={feedbackData.comment}
                        onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none h-24"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feedbackData.wouldAttendAgain}
                        onChange={(e) =>
                          setFeedbackData({ ...feedbackData, wouldAttendAgain: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        I would attend this event again
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={handleFeedbackSubmit}
                        className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">© 2024 CampusEvents</div>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Contact
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default EventDetails;
