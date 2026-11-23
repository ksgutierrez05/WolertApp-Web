import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { ListarBarrios } from '../../Services/BarriosApi.js'
import {
    crearUsuario,
    registrarConGoogle
} from '../../Services/UsuariosAPI.js'

const FORM_INICIAL = {
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
    const [formData, setFormData] = useState(FORM_INICIAL)
    const [barrios, setBarrios] = useState([])
    const [errorBarrios, setErrorBarrios] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const datosGoogleValidos = Boolean(
        formData.cedula.trim() && formData.username.trim() && formData.barrioId
    )

    useEffect(() => {
        ListarBarrios()
            .then(setBarrios)
            .catch(() => {
                setErrorBarrios('No se pudieron cargar los barrios')
            })
    }, [])

    function handleChange(event) {
        const { name, value } = event.target
        setFormData((actual) => ({ ...actual, [name]: value }))
    }

    async function handleRegistroClasico(event) {
        event.preventDefault()

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
                telefono: formData.telefono.trim(),
                barrioId: Number(formData.barrioId),
                calle: formData.calle.trim() || null,
                carrera: formData.carrera.trim() || null,
                etapa: formData.etapa.trim() || null,
                manzana: formData.manzana.trim() || null,
                casa: formData.casa.trim() || null,
                username: formData.username.trim(),
                password: formData.password
            })

            setFormData(FORM_INICIAL)
            window.alert('Registro exitoso. Ya puedes iniciar sesión.')
            if (onRegistroSuccess) onRegistroSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    async function handleGoogleSuccess(respuesta) {
        if (!respuesta.credential) {
            setError('Google no devolvió una credencial válida.')
            return
        }

        try {
            setCargando(true)
            setError('')

            const sesion = await registrarConGoogle({
                credential: respuesta.credential,
                cedula: formData.cedula.trim(),
                username: formData.username.trim(),
                telefono: formData.telefono.trim() || null,
                barrioId: Number(formData.barrioId)
            })

            if (onRegistroSuccess) onRegistroSuccess(sesion)
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="form-box form-registro">
            <form onSubmit={handleRegistroClasico}>
                <h2>Crear cuenta</h2>
                <p className="form-subtitle">
                    Regístrate con tus datos o continúa con Google.
                </p>

                <div className="seccion-titulo">REGISTRO CLÁSICO</div>

                <div className="grid-2">
                    <input
                        type="text"
                        placeholder="Primer nombre"
                        className="input-gris"
                        name="primerNombre"
                        value={formData.primerNombre}
                        onChange={handleChange}
                        autoComplete="given-name"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Segundo nombre"
                        className="input-gris"
                        name="segundoNombre"
                        value={formData.segundoNombre}
                        onChange={handleChange}
                        autoComplete="additional-name"
                    />
                </div>

                <div className="grid-2">
                    <input
                        type="text"
                        placeholder="Primer apellido"
                        className="input-gris"
                        name="primerApellido"
                        value={formData.primerApellido}
                        onChange={handleChange}
                        autoComplete="family-name"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Segundo apellido"
                        className="input-gris"
                        name="segundoApellido"
                        value={formData.segundoApellido}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Cédula"
                    className="input-gris"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                />
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="input-gris"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                />
                <input
                    type="tel"
                    placeholder="Teléfono"
                    className="input-gris"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                />

                <div className="seccion-titulo">UBICACIÓN</div>
                <select
                    name="barrioId"
                    className="input-gris"
                    value={formData.barrioId}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>
                        Selecciona tu barrio
                    </option>
                    {barrios.map((barrio) => (
                        <option
                            key={barrio.idBarrio}
                            value={barrio.idBarrio}
                        >
                            {barrio.nombre}
                        </option>
                    ))}
                </select>
                {errorBarrios && (
                    <div className="form-error" role="status">
                        {errorBarrios}
                    </div>
                )}

                <div className="grid-2">
                    <input
                        type="text"
                        placeholder="Calle"
                        className="input-gris"
                        name="calle"
                        value={formData.calle}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        placeholder="Carrera"
                        className="input-gris"
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                    />
                </div>
                <div className="grid-2">
                    <input
                        type="text"
                        placeholder="Etapa"
                        className="input-gris"
                        name="etapa"
                        value={formData.etapa}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        placeholder="Manzana"
                        className="input-gris"
                        name="manzana"
                        value={formData.manzana}
                        onChange={handleChange}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Casa"
                    className="input-gris"
                    name="casa"
                    value={formData.casa}
                    onChange={handleChange}
                />

                <div className="seccion-titulo">CUENTA</div>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    className="input-gris"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña (mínimo 8 caracteres)"
                    className="input-gris"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                />

                <button
                    type="submit"
                    className="btn-login"
                    disabled={cargando}
                >
                    {cargando ? 'Creando cuenta...' : 'Registrarme'}
                </button>

                <div className="divisor">
                    <span>o</span>
                </div>

                <div className="google-registro-ayuda">
                    Para Google completa tu cédula, nombre de usuario y
                    selecciona tu barrio. El teléfono es opcional.
                </div>

                <div className="google-wrapper">
                    {datosGoogleValidos && !cargando ? (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                setError(
                                    'No se pudo iniciar el registro con Google.'
                                )
                            }}
                            text="continue_with"
                            theme="outline"
                            size="large"
                            shape="pill"
                            locale="es"
                        />
                    ) : (
                        <button
                            type="button"
                            className="btn-google-deshabilitado"
                            disabled
                        >
                            <svg
                                className="google-g-icon"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.5H5.8v5.3A20 20 0 0 0 24 44Z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M24 11.9c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3c1.6-4.9 6.1-8.5 11.4-8.5Z"
                                />
                            </svg>
                            <span>
                                {cargando
                                    ? 'Procesando...'
                                    : 'Continuar con Google'}
                            </span>
                        </button>
                    )}
                </div>

                {error && (
                    <div className="form-error" role="alert">
                        {error}
                    </div>
                )}
            </form>
        </div>
    )
}

export default FormRegistro
