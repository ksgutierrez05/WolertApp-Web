import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/admin';
import Ciudadano from './Pages/Ciudadano/ciudadano';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/ciudadano/*" element={<Ciudadano />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
