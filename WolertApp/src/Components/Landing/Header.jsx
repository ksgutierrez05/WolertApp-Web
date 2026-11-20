import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ENLACES = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'producto', label: 'Producto' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'cobertura', label: 'Cobertura' },
  { id: 'seguridad', label: 'Seguridad y privacidad' },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState('inicio')
  const barra = useRef(null)

  // Fondo del header + barra de progreso de lectura
  useEffect(() => {
    let raf = 0
    const actualizar = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (barra.current) barra.current.style.transform = `scaleX(${p})`
      setScrolled(window.scrollY > 24)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(actualizar)
    }
    actualizar()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Resalta el enlace de la sección visible
  useEffect(() => {
    const secciones = ENLACES.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!secciones.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActivo(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    secciones.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])

  const cerrar = () => setAbierto(false)

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${abierto ? 'is-open' : ''}`}>
      <a href="#inicio" className="logo" onClick={cerrar}>
        <img src="/img/logo.png" alt="" className="logo-img" />
        <span className="logo-texto">WolertApp</span>
      </a>

      <nav className="site-nav" aria-label="Principal">
        {ENLACES.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={activo === l.id ? 'activo' : ''}
            aria-current={activo === l.id ? 'true' : undefined}
            onClick={cerrar}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <Link to="/login" className="btn btn-header btn-header-desktop">
        Iniciar sesión <i className="bi bi-arrow-right"></i>
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <span className="scroll-progress" ref={barra} aria-hidden="true"></span>
    </header>
  )
}

export default Header