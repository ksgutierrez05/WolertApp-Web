import { useState } from 'react'
import { obtenerUsuarios } from '../../utils/utils'

function FormLogin({ onLoginSuccess, aviso }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)

    function handleSubmit(event) {
        event.preventDefault()

        if (!username.trim() || !password) {
            setError('Escribe tu usuario y tu contraseña')
            return
        }

        const encontrado = obtenerUsuarios().find(
            u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
        )

        if (!encontrado) {
            setError('El usuario o la contraseña no coinciden.')
            return
        }

        setError('')
        onLoginSuccess(encontrado)
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

                <button type="submit" className="btn-primary">LOGIN</button>
            </form>
        </div>
    )
}

export default FormLogin