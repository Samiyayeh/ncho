import { Navigate, Outlet } from "react-router";

export function PublicRoute() {
  const token = localStorage.getItem('ncho_token');
  const userRaw = localStorage.getItem('ncho_user');
  
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      if (user.role === 'patient') {
        return <Navigate to="/patient" replace />;
      } else if (user.role === 'provider' || user.role === 'admin') {
        return <Navigate to="/provider/analytics" replace />;
      }
    } catch (e) {
      // If parsing fails, treat as not logged in
      return <Outlet />;
    }
  }

  return <Outlet />;
}
