import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRole?: "patient" | "provider" | "admin";
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('ncho_token');
  const userRaw = localStorage.getItem('ncho_user');
  
  // If not logged in at all, redirect to login page
  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw);

  // If a specific role is required and user role doesn't match, redirect them
  if (allowedRole && user.role !== allowedRole) {
    // Redirect patients to patient portal, and providers to provider portal
    if (user.role === 'patient') {
      return <Navigate to="/patient" replace />;
    } else {
      return <Navigate to="/provider/dashboard" replace />;
    }
  }

  // If authorized, render the child routes
  return <Outlet />;
}
