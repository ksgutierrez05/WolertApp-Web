import { useEffect, useState } from 'react'
import { crearUsuario } from '../../Services/UsuariosAPI.js'
// AJUSTA el nombre de la función al que exporta tu BarriosApi.js (ListarBarrios, listaBarrios...)
import { ListarBarrios } from '../../Services/BarriosApi.js'

// El registro público siempre crea un Ciudadano (lo decide el backend),
// por eso no hay selector de rol en este formulario.
const FORM_VACIO = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    barrioId: '',
    calle: '',
    carrera: '',
    etapa: '',
    manzana: '',
    casa: '',
    username: '',
    password: ''
}

function FormRegistro({ onRegistroSuccess }) {
    const [formData, setFormData] = useState(FORM_VACIO)
    const [barrios, setBarrios] = useState([])
    const [errorBarrios, setErrorBarrios] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    // Cargar los barrios para que el usuario elija el suyo
    useEffect(() => {
        ListarBarrios()
            .then(setBarrios)
            .catch(() => setErrorBarrios('No se pudieron cargar los barrios'))
    }, [])

    function handleChange(event) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!formData.primerNombre.trim() || !formData.primerApellido.trim() || !formData.cedula.trim()
            || !formData.telefono.trim() || !formData.correo.trim() || !formData.username.trim() || !formData.password) {
            setError('Por favor, complete todos los campos obligatorios')
            return
        }

        if (!formData.barrioId) {
            setError('Selecciona tu barrio')
            return
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        try {
            setCargando(true)
            setError('')

            await crearUsuario({
                cedula: formData.cedula.trim(),
                primerNombre: formData.primerNombre.trim(),
                segundoNombre: formData.segundoNombre.trim() || null,
                primerApellido: formData.primerApellido.trim(),
                segundoApellido: formData.segundoApellido.trim() || null,
                correo: formData.correo.trim(),
                telefono: formData.telefono.trim() || null,
                barrioId: Number(formData.barrioId),
                calle: formData.calle.trim() || null,
                carrera: formData.carrera.trim() || null,
                etapa: formData.etapa.trim() || null,
                manzana: formData.manzana.trim() || null,
                casa: formData.casa.trim() || null,
                username: formData.username.trim(),
                password: formData.password
            })

            setFormData(FORM_VACIO)
            alert('Registro exitoso')
            if (onRegistroSuccess) onRegistroSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="form-box form-registro">
        <form onSubmit={handleSubmit}>
            <h2>Crear Cuenta</h2>
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
            <input type="tel" placeholder="Teléfono" className="input-gris" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>

            <input type="email" placeholder="Correo Electrónico" className="input-gris" name="correo" value={formData.correo} onChange={handleChange} required />

            <div className="seccion-titulo">UBICACIÓN</div>

            <select name="barrioId" className="input-gris" value={formData.barrioId} onChange={handleChange} required>
                <option value="" disabled>Selecciona tu barrio *</option>
                {barrios.map((b) => (
                    <option key={b.idBarrio} value={b.idBarrio}>{b.nombre}</option>
                ))}
            </select>
            {errorBarrios && <div className="form-error" style={{ display: 'block' }}>{errorBarrios}</div>}

            <div className="grid-2">
            <input type="text" placeholder="Calle" className="input-gris" name="calle" value={formData.calle} onChange={handleChange} />
            <input type="text" placeholder="Carrera" className="input-gris" name="carrera" value={formData.carrera} onChange={handleChange} />
            </div>

            <div className="grid-2">
            <input type="text" placeholder="Etapa" className="input-gris" name="etapa" value={formData.etapa} onChange={handleChange} />
            <input type="text" placeholder="Manzana" className="input-gris" name="manzana" value={formData.manzana} onChange={handleChange} />
            </div>

            <input type="text" placeholder="Casa" className="input-gris" name="casa" value={formData.casa} onChange={handleChange} />

            <div className="seccion-titulo">CUENTA</div>

            <input type="text" placeholder="Username" className="input-gris" name="username" value={formData.username} onChange={handleChange} required />

            <div className="input-wrapper">
            <i className="bi bi-lock"></i>
            <input
                type="password"
                placeholder="Contraseña (mínimo 8 caracteres)"
                className="input-gris"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                title="La contraseña debe tener al menos 8 caracteres"
            />
            </div>

            {error && (
            <div className="form-error" style={{ display: 'block' }} role="alert">
                {error}
            </div>
            )}

            <button type="submit" className="btn-login" disabled={cargando}>
                {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
        </form>
        </div>
    )
}
export default FormRegistro