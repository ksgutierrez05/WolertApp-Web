import Layout from "../../Components/transito/Layout";
import SolicitudesApoyo from "../../Components/apoyo/SolicitudesApoyo";

export default function SolicitudesApoyoTransito() {
  return (
    <Layout
      rol="central"
      titulo="Solicitudes de apoyo"
      activo="solicitudes-apoyo"
    >
      <SolicitudesApoyo central="TRANSITO" />
    </Layout>
  );
}