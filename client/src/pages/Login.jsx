import { auth } from "../firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LogIn, Sparkles, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-pink-100 opacity-20 blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="login-card bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
          
          {!selectedRole ? (
            /* Role Selection Screen */
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  CampusEvents
                </h1>
                <p className="text-gray-600 text-sm font-medium">
                  Discover and manage college events
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 mt-0.5"></div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Subtitle */}
              <div className="mb-8">
                <p className="text-gray-700 font-semibold text-center text-sm">
                  Select your role to continue
                </p>
              </div>

              {/* Role Selection Buttons */}
              <div className="space-y-3 mb-8">
                {/* User Role */}
                <button
                  onClick={() => setSelectedRole('user')}
                  className="role-btn w-full p-4 rounded-xl border-2 border-cyan-400 hover:border-cyan-500 bg-cyan-50 transition-all duration-300 text-left group"
                  aria-label="Select User role"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 flex items-center justify-center flex-shrink-0 transition-all">
                      <LogIn className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">User</div>
                      <div className="text-xs text-gray-500 mt-0.5">Browse & register for events</div>
                    </div>
                  </div>
                </button>

                {/* Organizer Role */}
                <button
                  onClick={() => setSelectedRole('organizer')}
                  className="role-btn w-full p-4 rounded-xl border-2 border-green-400 hover:border-green-500 bg-green-50 transition-all duration-300 text-left group"
                  aria-label="Select Organizer role"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-50 group-hover:from-green-200 flex items-center justify-center flex-shrink-0 transition-all">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Organizer</div>
                      <div className="text-xs text-gray-500 mt-0.5">Create & manage events</div>
                    </div>
                  </div>
                </button>

                {/* Admin Role */}
                <button
                  onClick={() => setSelectedRole('admin')}
                  className="role-btn w-full p-4 rounded-xl border-2 border-purple-400 hover:border-purple-500 bg-purple-50 transition-all duration-300 text-left group"
                  aria-label="Select Admin role"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 group-hover:from-purple-200 flex items-center justify-center flex-shrink-0 transition-all">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Admin</div>
                      <div className="text-xs text-gray-500 mt-0.5">Manage platform & users</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer Info */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  We use Google Sign-In for secure authentication. We only store your role and email address.
                </p>
              </div>
            </>
          ) : (
            /* Login Screen */
            <>
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setError("");
                }}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors group"
                aria-label="Go back to role selection"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign in as <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                </h2>
                <p className="text-gray-600 text-sm">
                  Continue with your Google account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 mt-0.5"></div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                onClick={() => handleLogin(selectedRole)}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mb-4"
                aria-label={`Sign in as ${selectedRole} with Google`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Additional Info */}
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </>
          )}
        </div>

        {/* Bottom Info Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Having trouble? <a href="#" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
