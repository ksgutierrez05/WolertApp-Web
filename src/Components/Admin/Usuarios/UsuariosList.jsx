function UsuariosList() {
  const usuarios = [
    { id: 1, nombre: 'Juan Pérez', rol: 'Administrador', estado: 'Activo' },
    { id: 2, nombre: 'María Gómez', rol: 'Ciudadano', estado: 'Activo' },
    { id: 3, nombre: 'Carlos Ruiz', rol: 'Agente de Tránsito', estado: 'Inactivo' },
  ];

  return (
    <div className="usuarios-list">
      <h2>Usuarios</h2>
      <table className="usuarios-list__table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.rol}</td>
              <td>{usuario.estado}</td>
              <td>
                <button>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosList;