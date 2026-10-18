import AdminLayout from '../Components/Admin/AdminLayout';

function AdminPanel() {
  return (
    <AdminLayout>
      <section className="admin-panel__welcome">
        <h2>Bienvenido al panel de administración</h2>
        <p>Selecciona una opción del menú lateral para comenzar.</p>
      </section>
    </AdminLayout>
  );
}

export default AdminPanel;