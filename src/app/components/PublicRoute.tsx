import { Navigate, Outlet, useLocation } from "react-router";

export function PublicRoute() {
  const token = localStorage.getItem('ncho_token');
  const userRaw = localStorage.getItem('ncho_user');
  const location = useLocation();
  
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      const searchParams = new URLSearchParams(location.search);
      const requestedRole = searchParams.get('role');

      // If the user is logged in and either:
      // 1. There is no role specified in the URL query, OR
      // 2. The requested role in the URL matches the user's current active session role,
      // Then bypass the login page and redirect them straight to their dashboard!
      if (!requestedRole || requestedRole === user.role) {
        if (user.role === 'patient') {
          return <Navigate to="/patient" replace />;
        } else if (user.role === 'provider' || user.role === 'admin') {
          return <Navigate to="/provider/dashboard" replace />;
        }
      }
    } catch (e) {
      // If parsing fails, proceed to login page
    }
  }

  return <Outlet />;
}
