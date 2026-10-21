import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../Components/Admin/AdminLayout';
import Dashboard from '../../Components/Admin/Pages/Dashboard';
import UsuariosList from '../../Components/Admin/Usuarios/UsuariosList';
import UsuariosForm from '../../Components/Admin/Usuarios/UsuariosForm';
import Notificaciones from '../../Components/Admin/Pages/Notificaciones';
import Configuracion from '../../Components/Admin/Pages/Configuracion';
import Comunas from '../../Components/Admin/Pages/Comunas';
import Barrios from '../../Components/Admin/Pages/Barrios';
import Alertas from '../../Components/Admin/Pages/Alertas';
import Alarmas from '../../Components/Admin/Pages/Alarmas';
import Tipos from '../../Components/Admin/Pages/Tipos';
import Reportes from '../../Components/Admin/Pages/Reportes';
import Estadisticas from '../../Components/Admin/Pages/Estadisticas';

export default function Admin() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="usuarios" element={<UsuariosList />} />
        <Route path="usuarios/nuevo" element={<UsuariosForm />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="alarmas" element={<Alarmas />} />
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
