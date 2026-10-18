import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import AdminPanel from './Pages/Admin/AdminPanel';
import UsuariosList from './Components/Admin/Usuarios/UsuariosList';
import UsuariosForm from './Components/Admin/Usuarios/UsuariosForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />}>
          <Route index element={<UsuariosList />} />
          <Route path="usuarios" element={<UsuariosList />} />
          <Route path="usuarios/nuevo" element={<UsuariosForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
