import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../../Service/UsuariosAPI.js'

// AJUSTA estas rutas a las que realmente tengas definidas en tu router.
const RUTA_POR_ROL = {
    Admin: '/admin',
    AdminPolicia: '/admin-policia',
    DirectorTransito: '/director-transito',
    Policia: '/policia',
    CentralPolicia: '/central-policia',
    AgenteTransito: '/agente-transito',
    CentralTransito: '/central-transito',
    Ciudadano: '/ciudadano',
};

function FormLogin({ onLoginSuccess, aviso }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

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
            
            // 1) Primero avisamos a App para que actualice su estado de sesión
            //    (así el guard de rutas ya ve al usuario autenticado)
            if (onLoginSuccess) onLoginSuccess(datos)   // { token, idUsuario, username, rol }

            // 2) Luego navegamos según el rol
            navigate(RUTA_POR_ROL[datos.rol] || '/', { replace: true })
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
                        autoFocus
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

            </form>
        </div>
    )
}

export default FormLogin