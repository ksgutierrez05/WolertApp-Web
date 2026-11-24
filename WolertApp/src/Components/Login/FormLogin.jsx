import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { login, loginGoogle } from '../../Services/UsuariosAPI.js'

function FormLogin({ onLoginSuccess, aviso }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)

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
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="form-box form-login">
            <form onSubmit={handleSubmit} noValidate>
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
            </form>
        </div>
    )
}

export default FormLogin
