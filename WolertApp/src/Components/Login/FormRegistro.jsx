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

function FormRegistro({ onRegistroSuccess, onCambiarLogin }) {
    const [formData, setFormData] = useState(FORM_INICIAL)
    const [barrios, setBarrios] = useState([])
    const [errorBarrios, setErrorBarrios] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const [mostrarCompletarGoogle, setMostrarCompletarGoogle] = useState(false)
    const [cerrandoPanelGoogle, setCerrandoPanelGoogle] = useState(false)
    const [credencialGoogle, setCredencialGoogle] = useState('')

    useEffect(() => {
        ListarBarrios()
            .then(setBarrios)
            .catch(() => {
                setErrorBarrios('No se pudieron cargar los barrios')
            })
    }, [])

    function handleChange(event) {
        const { name, value } = event.target
        const valorLimpio = ['cedula', 'telefono'].includes(name)
            ? value.replace(/\D/g, '')
            : value
        setFormData((actual) => ({ ...actual, [name]: valorLimpio }))
    }

    function validarCamposNumericos() {
        if (!/^\d{6,10}$/.test(formData.cedula)) {
            setError('La cédula debe tener entre 6 y 10 números.')
            return false
        }
        if (formData.telefono && !/^\d+$/.test(formData.telefono)) {
            setError('El teléfono debe contener solo números.')
            return false
        }
        return true
    }

    function validarCorreo() {
        const correo = formData.correo.trim()
        const formatoCorreo = /^[^\s@]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i
        const parteLocal = correo.split('@')[0] || ''

        if (
            correo.length > 254 ||
            parteLocal.length > 64 ||
            correo.includes('..') ||
            !formatoCorreo.test(correo)
        ) {
            setError('Escribe un correo con formato válido, por ejemplo nombre@dominio.com.')
            return false
        }

        return true
    }

    async function handleRegistroClasico(event) {
        event.preventDefault()
        if (!validarCamposNumericos()) return
        if (!validarCorreo()) return
        if (
            !formData.barrioId &&
            !window.confirm(
                'No seleccionaste tu barrio. Esta información es util para apartados de la app. ¿Seguro que quieres continuar?'
            )
        ) return

        try {
            setCargando(true)
            setError('')

            await crearUsuario({
                cedula: formData.cedula.trim(),
                primerNombre: formData.primerNombre.trim(),
                segundoNombre: formData.segundoNombre.trim() || null,
                primerApellido: formData.primerApellido.trim(),
                segundoApellido: formData.segundoApellido.trim() || null,
                correo: formData.correo.trim().toLowerCase(),
                telefono: formData.telefono.trim(),
                barrioId: formData.barrioId ? Number(formData.barrioId) : null,
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
            setError('No se recibió una credencial válida de Google.')
            return
        }
        setError('')
        setCredencialGoogle(respuesta.credential)
        setMostrarCompletarGoogle(true)
    }

    function volverAlRegistroGoogle() {
        setCerrandoPanelGoogle(true)
        window.setTimeout(() => {
            setMostrarCompletarGoogle(false)
            setCredencialGoogle('')
            setError('')
            setCerrandoPanelGoogle(false)
        }, 560)
    }

    async function handleCompletarGoogle(event) {
        event.preventDefault()
        if (!validarCamposNumericos()) return
        if (!formData.username.trim()) {
            setError('Completa tu nombre de usuario.')
            return
        }
        if (
            !formData.barrioId &&
            !window.confirm(
                'No seleccionaste tu barrio. Esta información ayuda a mostrarte vecinos registrados cerca de ti. ¿Seguro que quieres continuar sin agregarlo?'
            )
        ) return
        try {
            setCargando(true)
            setError('')
            const sesion = await registrarConGoogle({
                credential: credencialGoogle,
                cedula: formData.cedula.trim(),
                username: formData.username.trim(),
                telefono: formData.telefono.trim() || null,
                barrioId: formData.barrioId ? Number(formData.barrioId) : null
            })
            if (onRegistroSuccess) onRegistroSuccess(sesion)
        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    if (mostrarCompletarGoogle) {
        return (
            <div className="form-box form-registro">
                <form className={`google-completar-form${cerrandoPanelGoogle ? ' is-closing' : ''}`} onSubmit={handleCompletarGoogle}>
                    <img src="/img/logo.png" alt="WolertApp" className="auth-mobile-logo" />
                    <h2>Completa tu perfil</h2>
                    <p className="google-completar-subtitulo">Tu cuenta de Google está lista. Agrega estos datos para terminar el registro.</p>
                    <input className="google-completar-input" type="text" name="cedula" placeholder="Cédula" inputMode="numeric" pattern="[0-9]*" minLength={6} maxLength={10} value={formData.cedula} onChange={handleChange} required />
                    <input className="google-completar-input" type="text" name="username" placeholder="Nombre de usuario" autoComplete="username" value={formData.username} onChange={handleChange} required />
                    <input className="google-completar-input" type="tel" name="telefono" placeholder="Teléfono (opcional)" inputMode="numeric" pattern="[0-9]*" value={formData.telefono} onChange={handleChange} />
                    <select className="google-completar-input" name="barrioId" value={formData.barrioId} onChange={handleChange}>
                        <option value="">Selecciona tu barrio (opcional)</option>
                        {barrios.map((barrio) => <option key={barrio.idBarrio} value={barrio.idBarrio}>{barrio.nombre}</option>)}
                    </select>
                    {errorBarrios && <div className="form-error" role="status">{errorBarrios}</div>}
                    {error && <div className="form-error" role="alert">{error}</div>}
                    <button type="submit" className="btn-primary" disabled={cargando}>{cargando ? 'Creando cuenta...' : 'Crear cuenta y continuar'}</button>
                    <button type="button" className="google-completar-volver" onClick={volverAlRegistroGoogle} disabled={cerrandoPanelGoogle}>Volver al registro</button>
                </form>
            </div>
        )
    }

    return (
        <div className="form-box form-registro">
            <form onSubmit={handleRegistroClasico}>
                <img src="/img/logo.png" alt="WolertApp" className="auth-mobile-logo" />
                <h2>Crear cuenta</h2>
                <p className="form-subtitle">
                    Regístrate con tus datos o continúa con Google.
                </p>

                <div className="google-registro-inicio">
                    <div className="google-registro-ayuda">Regístrate con Google y completa los datos que falten después.</div>
                    <div className="google-wrapper">
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('No se pudo iniciar el registro con Google.')} text="continue_with" theme="outline" size="large" shape="pill" width="320" logo_alignment="center" locale="es" />
                    </div>
                </div>
                <div className="divisor"><span>o regístrate con tus datos</span></div>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    minLength={6}
                    maxLength={10}
                    title="Ingresa entre 6 y 10 números."
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                />

                <div className="seccion-titulo">UBICACION</div>
                <select
                    name="barrioId"
                    className="input-gris"
                    value={formData.barrioId}
                    onChange={handleChange}
                >
                    <option value="">
                        Selecciona tu barrio (opcional)
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
                    maxLength={15}
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

                {error && (
                    <div className="form-error" role="alert">
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    className="registro-cambiar-login"
                    onClick={onCambiarLogin}
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
            </form>
        </div>
    )
}

export default FormRegistro
