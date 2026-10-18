import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import Admin from './Pages/admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
