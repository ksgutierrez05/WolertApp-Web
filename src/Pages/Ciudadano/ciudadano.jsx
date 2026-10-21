import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';

export default function Ciudadano() {
  return (
    <CiudadanoLayout>
      <Routes>
        <Route index element={<div className="container-fluid"><h1>Principal</h1></div>} />
      </Routes>
    </CiudadanoLayout>
  );
}