import { Navigate, Outlet, useLocation } from "react-router";

export function PublicRoute() {
  const token = localStorage.getItem('ncho_token');
  const userRaw = localStorage.getItem('ncho_user');
  const location = useLocation();
  
  // If there's a 'role' parameter in the URL, the user is explicitly trying 
  // to reach a specific login/register state. Allow them to see the page
  // so they can switch accounts or roles.
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has('role')) {
    return <Outlet />;
  }

  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      if (user.role === 'patient') {
        return <Navigate to="/patient" replace />;
      } else if (user.role === 'provider' || user.role === 'admin') {
        return <Navigate to="/provider/dashboard" replace />;
      }
    } catch (e) {
      // If parsing fails, treat as not logged in
      return <Outlet />;
    }
  }

  return <Outlet />;
}
