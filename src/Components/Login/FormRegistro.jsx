import {useState} from 'react'
import {obtenerUsuarios, guardarUsuariosLogin} from '../../utils/utils'

function FormRegistro({onRegistroSuccess}) {
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        cedula: '',
        telefono: '',
        correo: '',
        username: '',
        password: '',
        rol: 'ciudadano'
    })

    const [error, setError] = useState('')

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    function handleSubmit(event) {
        event.preventDefault()

        const usuarios = obtenerUsuarios()

        const yaExiste = usuarios.some(
            u => u.username.toLowerCase() === formData.username.toLowerCase() || u.cedula === formData.cedula
        )

        if (yaExiste) {
            setError('El nombre de usuario o la cédula ya están en uso')
            return
        }

        if (!formData.primerNombre || !formData.primerApellido || !formData.cedula || !formData.telefono || !formData.correo || !formData.username || !formData.password) {
            setError('Por favor, complete todos los campos obligatorios')
            return
        }

        setError('')

        const nombre = [
            formData.primerNombre,
            formData.segundoNombre,
            formData.primerApellido,
            formData.segundoApellido
        ].filter(Boolean).join(' ')

        usuarios.push({ nombre, ...formData })
        guardarUsuariosLogin(usuarios)

        alert('Registro exitoso')
        onRegistroSuccess()

    }
    return (
        <div className="form-box form-registro">
        <form onSubmit={handleSubmit}>
            <h2>Crear Cuenta</h2>
            <p className="form-subtitle">Completa la información para registrarte</p>
            <hr className="form-divider" />

            <div className="seccion-titulo">DATOS PERSONALES</div>

            <div className="grid-2">
            <input type="text" placeholder="Primer Nombre" className="input-gris" name="primerNombre" value={formData.primerNombre} onChange={handleChange} required />
            <input type="text" placeholder="Segundo Nombre" className="input-gris" name="segundoNombre" value={formData.segundoNombre} onChange={handleChange} />
            </div>

            <div className="grid-2">
            <input type="text" placeholder="Primer Apellido" className="input-gris" name="primerApellido" value={formData.primerApellido} onChange={handleChange} required />
            <input type="text" placeholder="Segundo Apellido" className="input-gris" name="segundoApellido" value={formData.segundoApellido} onChange={handleChange} />
            </div>

            <div className="grid-2">
            <input type="text" placeholder="Cédula" className="input-gris" name="cedula" value={formData.cedula} onChange={handleChange} required />
            <input type="tel" placeholder="Teléfono" className="input-gris" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>

            <input type="email" placeholder="Correo Electrónico" className="input-gris" name="correo" value={formData.correo} onChange={handleChange} />

            <div className="seccion-titulo">CUENTA</div>

            <input type="text" placeholder="Username" className="input-gris" name="username" value={formData.username} onChange={handleChange} required />

            <div className="input-wrapper">
            <i className="bi bi-lock"></i>
            <input type="password" placeholder="Contraseña" className="input-gris" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            {error && (
            <div className="form-error" style={{ display: 'block' }}>
                {error}
            </div>
            )}

            <select name="rol" className="input-gris" value={formData.rol} onChange={handleChange} required>
            <option value="admin">Administrador</option>
            <option value="admin-policia">Administrador Policía</option>
            <option value="central">Central (Policía)</option>
            <option value="policia">Policía</option>
            <option value="Agente-transito">Agente de transito</option>
            <option value="Central-transito">Central de transito</option>
            <option value="Director-transito">Director de transito</option>
            <option value="ciudadano">Ciudadano</option>
            </select>

            <button type="submit" className="btn-login">Registrarse</button>
        </form>
        </div>
    )
}
export default FormRegistro
