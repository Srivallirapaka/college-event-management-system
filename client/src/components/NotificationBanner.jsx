import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import axios from "axios";
import { auth } from "../firebase.js";

function NotificationBanner() {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch upcoming events (within 1 day)
    const checkUpcomingEvents = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/events/upcoming/${user.uid}`);
        const upcomingEvents = res.data || [];
        
        // Filter for events happening within 24 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const reminderEvents = upcomingEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate > now && eventDate < tomorrow;
        });

        setNotifications(reminderEvents);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      }
    };

    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user?.uid]);

  const dismissNotification = (eventId) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(eventId);
    setDismissedIds(newDismissed);
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      {visibleNotifications.map(event => (
        <div
          key={event.id}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-blue-400/30 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-cyan-100">
                Event happening in {Math.round((new Date(event.date) - new Date()) / (60 * 60 * 1000))} hours
              </p>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(event.id)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationBanner;