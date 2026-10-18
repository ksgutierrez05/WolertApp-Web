import { useState } from 'react';

function UsuariosForm() {
  const [form, setForm] = useState({
    nombre: '',
    rol: '',
    estado: 'Activo',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Usuario a guardar:', form);
    // Aquí iría la lógica para enviar los datos al backend
  };

  return (
    <div className="usuarios-form">
      <h2>Registro de Usuario</h2>
      <form className="usuarios-form__form" onSubmit={handleSubmit}>
        <div className="usuarios-form__group">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ingrese el nombre"
          />
        </div>
        <div className="usuarios-form__group">
          <label>Rol</label>
          <select name="rol" value={form.rol} onChange={handleChange}>
            <option value="">Seleccione un rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Ciudadano">Ciudadano</option>
            <option value="Agente de Tránsito">Agente de Tránsito</option>
          </select>
        </div>
        <div className="usuarios-form__group">
          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <button type="submit" className="usuarios-form__button">Guardar</button>
      </form>
    </div>
  );
}

export default UsuariosForm;