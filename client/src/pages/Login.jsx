import { auth } from "../Firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LogIn, Sparkles, Shield } from "lucide-react";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const handleLogin = async (role) => {
    try {
      setIsLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      console.log("User Info:", result.user);
      console.log("Login as:", role);

      // Store role in localStorage
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", result.user.email);

      // Navigate based on role
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "organizer") {
        navigate("/organizer-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Hero / Poster */}
        <div className="card p-6 neon-glow">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h1 className="text-3xl font-bold">EventHub</h1>
              <p className="text-sm text-gray-500">Discover college events near you</p>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {/* Poster placeholder (SVG) */}
              <div className="w-full h-64 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="block">
                  <rect width="100%" height="100%" fill="#f3f4f6" />
                  <g transform="translate(40,40)">
                    <rect x="0" y="0" width="520" height="320" rx="10" fill="#ffffff" stroke="#e9e9ef" />
                    <text x="260" y="170" dominantBaseline="middle" textAnchor="middle" fill="#9ca3af" fontSize="20" fontFamily="Inter, sans-serif">Featured event</text>
                  </g>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Featured: Campus Hackathon</h2>
              <p className="text-sm text-gray-500">April 25 • Main Auditorium</p>
            </div>
          </div>
        </div>

        {/* Role selection / Sign-in */}
        <div className="card p-6">
          {!selectedRole ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Sign in</h2>
                <p className="text-sm text-gray-500">Select your role to continue</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => setSelectedRole('user')} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="font-semibold">User</div>
                  <div className="text-xs text-gray-500">Browse & register</div>
                </button>
                <button onClick={() => setSelectedRole('organizer')} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="font-semibold">Organizer</div>
                  <div className="text-xs text-gray-500">Create & manage events</div>
                </button>
                <button onClick={() => setSelectedRole('admin')} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left">
                  <div className="font-semibold">Admin</div>
                  <div className="text-xs text-gray-500">Manage platform</div>
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-400">Your account uses Google sign-in. We only store your role and email for a better experience.</div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <button onClick={() => { setSelectedRole(null); setError(''); }} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                <h2 className="mt-4 text-2xl font-bold">Sign in as {selectedRole}</h2>
                <p className="text-sm text-gray-500">Continue with Google to authenticate</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button onClick={() => handleLogin(selectedRole)} disabled={isLoading} className="w-full py-3 px-4 rounded-lg font-semibold bg-white border border-gray-200 hover:shadow-neon-pink/30 transition-all flex items-center justify-center gap-2">
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
