import { useEffect, useRef, useState } from 'react'
import useReveal from '../../Services/useReveal'

const PASOS = [
  {
    titulo: 'Regístrate',
    texto: 'Crea tu cuenta en un par de minutos, sin complicaciones.',
  },
  {
    titulo: 'Roles',
    texto:
      'El administrador que se te asigne te pondrá un rol dependiendo de tu cargo, o si eres ciudadano tendrás acceso sencillo.',
  },
  {
    titulo: 'Gestiona alertas',
    texto:
      'Recibe o genera notificaciones en tiempo real sobre eventos importantes en tu comunidad.',
  },
  {
    titulo: 'Colabora',
    texto:
      'Participa en la mejora de tu comunidad al compartir información y experiencias relevantes.',
  },
  {
    titulo: 'Gestiona',
    texto:
      'Accede a un historial de alertas y reportes para mantener un registro de lo que ha sucedido en tu comunidad.',
  },
]

function ComoFunciona() {
  const ref = useReveal()
  const pasosRef = useRef([])
  const [activo, setActivo] = useState(-1)

  // El paso que cruza el centro de la pantalla se marca como activo
  // y la línea de progreso se llena hasta él.
  useEffect(() => {
    const pasos = pasosRef.current.filter(Boolean)
    if (!('IntersectionObserver' in window)) {
      setActivo(PASOS.length - 1)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActivo(Number(e.target.dataset.i))
        })
      },
      { rootMargin: '-42% 0px -48% 0px' }
    )
    pasos.forEach((p) => observer.observe(p))
    return () => observer.disconnect()
  }, [])

  const progreso = activo < 0 ? 0 : activo / (PASOS.length - 1)

  return (
    <section id="como-funciona" className="como-funciona" ref={ref}>
      <div className="sec-head reveal">
        <span className="kicker">Proceso</span>
        <h2>Cómo funciona</h2>
        <p>Cinco pasos simples para que tu comunidad esté siempre alerta.</p>
      </div>

      <div className="como-funciona-grid">
        <div className="pasos-lista" style={{ '--p': progreso }}>
          <span className="pasos-linea" aria-hidden="true"></span>

          {PASOS.map((p, i) => (
            <div
              key={p.titulo + i}
              ref={(el) => (pasosRef.current[i] = el)}
              data-i={i}
              className={`paso reveal ${i <= activo ? 'hecho' : ''} ${i === activo ? 'activo' : ''}`}
              style={{ '--i': i }}
            >
              <span className="num">{i + 1}</span>
              <div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="como-funciona-imagen reveal reveal-scale">
          <span className="imagen-halo" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
          </span>
          <img src="/img/maya.png" alt="Mascota de WolertApp" />
        </div>
      </div>
    </section>
  )
}

export default ComoFunciona