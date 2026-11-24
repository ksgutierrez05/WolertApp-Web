import Layout from "../../Components/transito/Layout";
import MapaOperaciones from "../../Components/transito/director-transito/MapaOperaciones";

export default function MapaTransito() {
  return (
    <Layout rol="director" titulo="Mapa de operaciones" activo="mapa" claseTopbar="mb-3">
      <MapaOperaciones />
    </Layout>
  );
}
