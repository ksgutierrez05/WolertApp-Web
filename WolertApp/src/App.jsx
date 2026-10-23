import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Components/Administrador-policia/Layout'
import CentroOperaciones from './Pages/Administrador-Policia/Centro-Operaciones'
import Alertas from './Pages/Administrador-Policia/Alertas'
import Alarmas from './Pages/Administrador-Policia/Alarmas'
import TiposAlertas from './Pages/Administrador-Policia/Tipos-Alertas'
import Unidades from './Pages/Administrador-Policia/Unidades'
import Policias from './Pages/Administrador-Policia/Policias'
import Historial from './Pages/Administrador-Policia/Historial'
import Estadisticas from './Pages/Administrador-Policia/Estadisticas'
import Reportes from './Pages/Administrador-Policia/Reportes'
import Notificaciones from './Pages/Administrador-Policia/Notificaciones'
import Configuracion from './Pages/Administrador-Policia/Configuracion'


function App() {
  //PRUEBA DE RUTAS
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Administrador-Policia" replace />} />
      <Route path="/Administrador-Policia" element={<Layout />}>
        <Route index element={<CentroOperaciones />} />
        <Route path="Alertas" element={<Alertas />} />
        <Route path="Alarmas" element={<Alarmas />} />
        <Route path="Tipos-Alertas" element={<TiposAlertas />} />
        <Route path="Unidades" element={<Unidades />} />
        <Route path="Policias" element={<Policias />} />
        <Route path="Historial" element={<Historial />} />
        <Route path="Estadisticas" element={<Estadisticas />} />
        <Route path="Reportes" element={<Reportes />} />
        <Route path="Notificaciones" element={<Notificaciones />} />
        <Route path="Configuracion" element={<Configuracion />} />

        
      </Route>
    </Routes>
  )
}

export default App