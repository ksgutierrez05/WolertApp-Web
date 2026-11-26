import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { login, loginGoogle, registrarConGoogle } from '../../Services/UsuariosAPI.js'
import { ListarBarrios } from '../../Services/BarriosApi.js'

function FormLogin({ onLoginSuccess, aviso, onCambiarRegistro }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [mostrarCompletarGoogle, setMostrarCompletarGoogle] = useState(false)
    const [cerrandoPanelGoogle, setCerrandoPanelGoogle] = useState(false)
    const [credencialGoogle, setCredencialGoogle] = useState('')
    const [barrios, setBarrios] = useState([])
    const [datosGoogle, setDatosGoogle] = useState({ cedula: '', username: '', telefono: '', barrioId: '' })

    useEffect(() => {
        if (!mostrarCompletarGoogle) return undefined
        let activo = true
        ListarBarrios()
            .then((datos) => {
                if (activo) setBarrios(Array.isArray(datos) ? datos : [])
            })
            .catch(() => {
                if (activo) setError('No se pudo cargar la lista de barrios. Intenta nuevamente.')
            })
        return () => { activo = false }
    }, [mostrarCompletarGoogle])

    async function handleSubmit(event) {
        event.preventDefault()

        if (!username.trim() || !password) {
            setError('Escribe tu usuario y tu contraseña')
            return
        }

        try {
            setCargando(true)
            setError('')
            const datos = await login({ username: username.trim(), password })

            // El padre (Login.jsx) guarda la sesión y navega según el rol.
            // No navegar aquí para evitar redirecciones duplicadas.
            if (onLoginSuccess) onLoginSuccess(datos)   // { token, idUsuario, username, rol }
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    // Va FUERA de handleSubmit, al mismo nivel
    async function handleGoogle(respuesta) {
        try {
            setCargando(true)
            setError('')
            const datos = await loginGoogle(respuesta.credential)
            if (onLoginSuccess) onLoginSuccess(datos)
        } catch (err) {
            const mensaje = err.message || 'No se pudo iniciar sesión con Google.'
            if (/no hay una cuenta registrada|reg[ií]strate primero/i.test(mensaje)) {
                setCredencialGoogle(respuesta.credential)
                setDatosGoogle({ cedula: '', username: '', telefono: '', barrioId: '' })
                setError('')
                setMostrarCompletarGoogle(true)
            } else {
                setError(mensaje)
            }
        } finally {
            setCargando(false)
        }
    }

    function handleCambioGoogle(event) {
        const { name, value } = event.target
        const valor = ['cedula', 'telefono'].includes(name) ? value.replace(/\D/g, '') : value
        setDatosGoogle((actual) => ({ ...actual, [name]: valor }))
    }

    async function handleRegistroGoogle(event) {
        event.preventDefault()
        if (!/^\d{6,10}$/.test(datosGoogle.cedula)) {
            setError('La cédula debe tener entre 6 y 10 números.')
            return
        }
        if (!datosGoogle.username.trim()) {
            setError('Completa tu nombre de usuario.')
            return
        }
        if (datosGoogle.username.trim().length > 15) {
            setError('El nombre de usuario no puede superar los 15 caracteres.')
            return
        }
        if (
            !datosGoogle.barrioId &&
            !window.confirm(
                'No seleccionaste tu barrio. Esta información ayuda a mostrarte vecinos registrados cerca de ti. ¿Seguro que quieres continuar sin agregarlo?'
            )
        ) return

        try {
            setCargando(true)
            setError('')
            const sesion = await registrarConGoogle({
                credential: credencialGoogle,
                cedula: datosGoogle.cedula,
                username: datosGoogle.username.trim(),
                telefono: datosGoogle.telefono || null,
                barrioId: datosGoogle.barrioId ? Number(datosGoogle.barrioId) : null,
            })
            if (onLoginSuccess) onLoginSuccess(sesion)
        } catch (err) {
            setError(err.message || 'No se pudo completar el registro con Google.')
        } finally {
            setCargando(false)
        }
    }

    function volverAlLogin() {
        if (cerrandoPanelGoogle) return
        setCerrandoPanelGoogle(true)
        window.setTimeout(() => {
            setMostrarCompletarGoogle(false)
            setCredencialGoogle('')
            setError('')
            setCerrandoPanelGoogle(false)
        }, 560)
    }

    return (
        <div className="form-box form-login">
            {mostrarCompletarGoogle ? (
                <form className={`google-completar-form${cerrandoPanelGoogle ? ' is-closing' : ''}`} onSubmit={handleRegistroGoogle}>
                    <img src="/img/logo.png" alt="WolertApp" className="auth-mobile-logo" />
                    <h2>Completa tu perfil</h2>
                    <p className="google-completar-subtitulo">
                        Google confirmó tu correo. Completa estos datos para crear tu cuenta y continuar.
                    </p>
                    <input
                        className="google-completar-input"
                        type="text"
                        name="cedula"
                        placeholder="Cédula"
                        aria-label="Cédula"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        minLength={6}
                        maxLength={10}
                        value={datosGoogle.cedula}
                        onChange={handleCambioGoogle}
                        required
                    />
                    <input
                        className="google-completar-input"
                        type="text"
                        name="username"
                        placeholder="Nombre de usuario"
                        aria-label="Nombre de usuario"
                        autoComplete="username"
                        maxLength={15}
                        value={datosGoogle.username}
                        onChange={handleCambioGoogle}
                        required
                    />
                    <input
                        className="google-completar-input"
                        type="tel"
                        name="telefono"
                        placeholder="Teléfono (opcional)"
                        aria-label="Teléfono (opcional)"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={datosGoogle.telefono}
                        onChange={handleCambioGoogle}
                    />
                    <select
                        className="google-completar-input"
                        name="barrioId"
                        aria-label="Barrio"
                        value={datosGoogle.barrioId}
                        onChange={handleCambioGoogle}
                    >
                        <option value="">Selecciona tu barrio (opcional)</option>
                        {barrios.map((barrio) => (
                            <option key={barrio.idBarrio ?? barrio.IdBarrio} value={barrio.idBarrio ?? barrio.IdBarrio}>
                                {barrio.nombre ?? barrio.Nombre}
                            </option>
                        ))}
                    </select>
                    {error && <div className="form-error" role="alert">{error}</div>}
                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Creando cuenta...' : 'Crear cuenta y continuar'}
                    </button>
                    <button type="button" className="google-completar-volver" onClick={volverAlLogin}>
                        Volver al inicio de sesión
                    </button>
                </form>
            ) : (
            <form onSubmit={handleSubmit} noValidate>
                <img src="/img/logo.png" alt="WolertApp" className="auth-mobile-logo" />
                <h2>Iniciar Sesión</h2>

                {aviso && <div className="form-ok" role="status">{aviso}</div>}

                <div className="input-wrapper">
                    <i className="bi bi-person input-icon"></i>
                    <input
                        type="text"
                        className="input"
                        placeholder="Usuario"
                        aria-label="Usuario"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-wrapper">
                    <i className="bi bi-lock-fill input-icon"></i>
                    <input
                        type={mostrarPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="Contraseña"
                        aria-label="Contraseña"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="toggle-pass"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <i className={`bi ${mostrarPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                </div>

                {error && <div className="form-error" role="alert">{error}</div>}

                <button type="submit" className="btn-primary" disabled={cargando}>
                    {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <div className="divisor"><span>o</span></div>

                <p className="google-caption">Continúa de forma segura con tu cuenta de Google</p>
                <div className="google-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogle}
                        onError={() => setError('Falló el inicio de sesión con Google')}
                        text="continue_with"
                        theme="outline"
                        shape="pill"
                        size="large"
                        width="320"
                        logo_alignment="center"
                        locale="es"
                    />
                </div>

                <button
                    type="button"
                    className="login-cambiar-registro"
                    onClick={onCambiarRegistro}
                >
                    <i className="bi bi-person-plus-fill" aria-hidden="true" />
                    ¿No tienes cuenta? Regístrate
                </button>
            </form>
            )}
        </div>
    )
}

export default FormLogin
