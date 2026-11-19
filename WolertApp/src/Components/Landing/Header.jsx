import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <div className="logo">
        <img src="/img/logo.png" alt="WolertApp" className="logo-img" />
        WolertApp
      </div>
      <nav>
        <a href="#inicio">Inicio</a>
        <a href="#producto">Producto</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#cobertura">Cobertura</a>
        <a href="#seguridad">Seguridad y privacidad</a>
      </nav>
      <Link to="/login" className="btn btn-header">Iniciar sesión</Link>
    </header>
  )
}

export default Header
