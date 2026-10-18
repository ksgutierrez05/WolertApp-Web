import { Outlet } from 'react-router-dom';
import AdminLayout from '../Components/Admin/AdminLayout';

function AdminPanel() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default AdminPanel;
