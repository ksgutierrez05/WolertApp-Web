import { Navigate, Outlet } from 'react-router-dom';
import { normalizarRol, rutaDelRol } from '../Utils/roles';

export default function RutaProtegida({ roles }) {
  if (import.meta.env.DEV && import.meta.env.VITE_SIN_LOGIN === 'true') {
    return <Outlet />;
  }

  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) return <Navigate to="/login" replace />;
  if (!roles.map(normalizarRol).includes(normalizarRol(rol))) {
    return <Navigate to={rutaDelRol(rol)} replace />;
  }
  return <Outlet />;
}
