import { useState } from 'react'
import { obtenerUsuarios } from '../../utils/utils'

function FormLogin({ onLoginSuccess }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)

    function handleSubmit(event) {
        event.preventDefault()

        const usuarios = obtenerUsuarios()

        const encontrado = usuarios.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        )

        if (!encontrado) {
            setError('Usuario o contraseña incorrectos')
            return
        }

        setError('')
        onLoginSuccess(encontrado)
    }

    return (
        <div className="form-box form-login">
            <form onSubmit={handleSubmit}>
                <h2>Iniciar sesión</h2>

                <input
                    type="text"
                    placeholder="Usuario"
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <div className="input-wrapper">
                    <i className="bi bi-lock"></i>
                    <input
                        type={mostrarPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <i
                        className="bi bi-eye"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                    ></i>
                </div>

                {error && (
                    <div className="form-error" style={{ display: 'block' }}>
                        {error}
                    </div>
                )}

                <button type="submit" className="btn-login">Ingresar</button>
                <a href="#" className="link-olvide">¿Olvidaste tu contraseña?</a>
            </form>
        </div>
    )
}

export default FormLogin
