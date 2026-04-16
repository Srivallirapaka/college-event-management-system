import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase.js";

function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const user = auth.currentUser;
      const userRole = localStorage.getItem("userRole");

      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (userRole === requiredRole) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rust"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
