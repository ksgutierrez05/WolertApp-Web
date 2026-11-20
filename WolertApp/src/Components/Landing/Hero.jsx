import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCountUp } from '../../Services/useReveal'

// Alertas de ejemplo para mostrar cómo se ve el flujo (demostración visual)
const ALERTAS_DEMO = [
  { icono: 'bi-bell-fill', titulo: 'Alarma comunitaria activada', detalle: 'Tu zona · ahora', tono: 'alerta' },
  { icono: 'bi-exclamation-triangle-fill', titulo: 'Actividad sospechosa', detalle: 'Cerca de ti · hace 2 min', tono: 'aviso' },
  { icono: 'bi-heart-pulse-fill', titulo: 'Emergencia médica', detalle: 'Tu barrio · hace 5 min', tono: 'alerta' },
  { icono: 'bi-check-circle-fill', titulo: 'Situación atendida', detalle: 'Reporte cerrado · hace 8 min', tono: 'ok' },
]

// Cada palabra del título entra con su propia máscara (efecto "revelado")
const TITULO = [
  { t: 'Alarmas' },
  { t: 'comunitarias' },
  { t: 'en', r: true },
  { t: 'la', r: true },
  { t: 'palma', r: true },
  { t: 'de', r: true },
  { t: 'tu', r: true },
  { t: 'mano', r: true },
]

const CIFRAS = [
  { valor: 1, etiqueta: 'ciudad activa' },
  { texto: '24/7', etiqueta: 'monitoreo comunitario' },
  { valor: 5, etiqueta: 'pasos para empezar' },
  { valor: 3, etiqueta: 'ciudades en el plan' },
]

function Cifra({ valor = 0, texto, etiqueta, indice }) {
  const [ref, n] = useCountUp(valor)
  return (
    <li className="cifra entrada" style={{ '--d': 7 + indice }}>
      <span className="cifra-num" ref={ref}>
        {texto ?? n}
      </span>
      <span className="cifra-label">{etiqueta}</span>
    </li>
  )
}

function Hero() {
  const [indice, setIndice] = useState(0)

  // Rota la alerta de ejemplo cada 3.2 s
  useEffect(() => {
    const t = setInterval(() => setIndice((i) => (i + 1) % ALERTAS_DEMO.length), 3200)
    return () => clearInterval(t)
  }, [])

  const alerta = ALERTAS_DEMO[indice]

  return (
    <section id="inicio" className="hero">
      <div className="hero-fondo" aria-hidden="true">
        <span className="aurora a1"></span>
        <span className="aurora a2"></span>
        <span className="hero-grid-bg"></span>
      </div>

      <div className="hero-inner">
        <div className="hero-texto">
          <span className="hero-badge entrada" style={{ '--d': 0 }}>
            <span className="punto-activo"></span>
            Activo en Valledupar
          </span>

          <h1 aria-label="Alarmas comunitarias en la palma de tu mano">
            {TITULO.map((p, i) => (
              <span key={i} className="palabra" aria-hidden="true">
                <span className={p.r ? 'resaltado' : ''} style={{ '--w': i }}>
                  {p.t}
                </span>
                {' '}
              </span>
            ))}
          </h1>

          <p className="hero-lead entrada" style={{ '--d': 3 }}>
            Tu barrio se cuida entre todos. Activa o recibe alertas sobre
            eventos importantes en tu comunidad de manera rápida y sencilla.
            Inicia sesión para acceder a tu rol y listo.
          </p>

          <div className="hero-acciones entrada" style={{ '--d': 4 }}>
            <Link to="/login" className="btn">
              Iniciar sesión <i className="bi bi-arrow-right"></i>
            </Link>
            <a href="#como-funciona" className="btn btn-secundario">
              Ver cómo funciona
            </a>
          </div>

          <ul className="hero-confianza entrada" style={{ '--d': 5 }}>
            <li><i className="bi bi-incognito"></i> Privacidad de datos</li>
            <li><i className="bi bi-broadcast"></i> Tiempo real</li>
            <li><i className="bi bi-person-badge"></i> Acceso por rol</li>
          </ul>
        </div>

        <div className="hero-visual entrada" style={{ '--d': 3 }}>
          <div className="radar-wrap">
            <div className="radar" role="img" aria-label="Radar de alertas de la comunidad">
              <span className="radar-ring r1"></span>
              <span className="radar-ring r2"></span>
              <span className="radar-cruz"></span>
              <div className="sweep"></div>

              <span className="blip blip-1"></span>
              <span className="blip blip-2"></span>
              <span className="blip blip-3"></span>

              <div className="radar-centro">
                <span className="alarma-onda"></span>
                <span className="alarma-onda alarma-onda-2"></span>
                <img src="/img/logo.png" alt="WolertApp" />
              </div>
            </div>

            <div className="float-card fc1">
              <div className="row">
                <span className="dot"></span>
                <span className="t1">Notifica</span>
              </div>
              <div className="t2">Alertas en tiempo real</div>
            </div>

            <div className="float-card fc2" aria-live="polite">
              <div key={indice} className="feed-item">
                <span className={`feed-icono tono-${alerta.tono}`}>
                  <i className={`bi ${alerta.icono}`}></i>
                </span>
                <div>
                  <div className="t1">{alerta.titulo}</div>
                  <div className="t2">{alerta.detalle}</div>
                </div>
              </div>
            </div>

            <div className="float-card fc3">
              <div className="row">
                <span className="dot dot-verde"></span>
                <span className="t1">Gestiona</span>
              </div>
              <div className="t2">Historial y seguimiento</div>
            </div>
          </div>
        </div>
      </div>

      <ul className="hero-cifras">
        {CIFRAS.map((c, i) => (
          <Cifra key={c.etiqueta} {...c} indice={i} />
        ))}
      </ul>
    </section>
  )
}

export default Hero