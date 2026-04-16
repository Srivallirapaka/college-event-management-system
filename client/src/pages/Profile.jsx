import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../Firebase.js";
import { QrCode } from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    setUser(u);

    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('userEmail');
        if (!email) return setEvents([]);
        const res = await axios.get(`http://localhost:5000/events/user/${email}`);
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold">{user?.displayName?.charAt(0) || 'U'}</div>
          <div>
            <h2 className="text-2xl font-bold">{user?.displayName || 'Guest User'}</h2>
            <p className="text-sm text-gray-500">{user?.email || localStorage.getItem('userEmail')}</p>
          </div>
          <div className="ml-auto">
            <div className="w-28 h-28 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Present this QR for check-in</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">My Registrations</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500">You have not registered for any events.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center justify-between border-b py-3">
                  <div>
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-sm text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-500">Seats: {ev.slots}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
