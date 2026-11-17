import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RutaProtegida from './Components/RutaProtegida';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/admin';
import Ciudadano from './Pages/Ciudadano/ciudadano';

// Tránsito
import Director from './Pages/transito/Director';
import Central from './Pages/transito/Central';
import Agente from './Pages/transito/Agente';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida roles={['ADMIN']} />}>
          <Route path="/admin/*" element={<Admin />} />
        </Route>

        <Route element={<RutaProtegida roles={['CIUDADANO']} />}>
          <Route path="/ciudadano/*" element={<Ciudadano />} />
        </Route>

        {/* Tránsito */}
        <Route element={<RutaProtegida roles={['ADMIN_TRANSITO', 'DirectorTransito']} />}>
          <Route path="/transito/director/*" element={<Director />} />
        </Route>

        <Route element={<RutaProtegida roles={['CENTRAL_TRANSITO']} />}>
          <Route path="/transito/central/*" element={<Central />} />
        </Route>

        <Route element={<RutaProtegida roles={['AGENTE_TRANSITO']} />}>
          <Route path="/transito/agente/*" element={<Agente />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;