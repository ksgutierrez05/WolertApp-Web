import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../Components/Admin/AdminLayout';
import Dashboard from './Dashboard';
import UsuariosList from '../../Components/Admin/Usuarios/UsuariosList';
import UsuariosForm from '../../Components/Admin/Usuarios/UsuariosForm';
import Notificaciones from './Notificaciones';
import Configuracion from './Configuracion';
import Comunas from './Comunas';
import Barrios from './Barrios';
import Alertas from './Alertas';
import Tipos from './Tipos';
import Reportes from './Reportes';
import Estadisticas from './Estadisticas';
import MapaSucesos from './MapaSucesos';

export default function Admin() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="usuarios" element={<UsuariosList />} />
        <Route path="usuarios/nuevo" element={<UsuariosForm />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="mapa-sucesos" element={<MapaSucesos />} />
        <Route path="tipos" element={<Tipos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="comunas" element={<Comunas />} />
        <Route path="barrios" element={<Barrios />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Routes>
    </AdminLayout>
  );
}
