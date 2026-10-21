import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';
import Principal from '../../Components/Ciudadano/Pages/Principal';

export default function Ciudadano() {
  return (
    <CiudadanoLayout>
      <Routes>
        <Route index element={<Principal />} />
        <Route path="principal" element={<Principal />} />
      </Routes>
    </CiudadanoLayout>
  );
}