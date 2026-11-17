import { useEffect, useRef } from 'react'

function ComoFunciona() {
  // useRef nos da acceso al elemento del DOM
  const pasosRef = useRef(null)

  // useEffect se ejecuta cuando el componente se muestra en pantalla
  useEffect(() => {
    // Buscamos todos los elementos con clase "paso" dentro del contenedor
    const pasos = pasosRef.current.querySelectorAll('.paso')

    // Creamos el IntersectionObserver (igual que en tu JS original)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    })

    // Observamos cada paso
    pasos.forEach((paso) => observer.observe(paso))

    // Cleanup: desconectamos el observer cuando el componente se desmonta
    return () => observer.disconnect()
  }, []) // El array vacío significa que solo se ejecuta una vez al montar

  return (
    <section id="como-funciona" className="como-funciona">
      <div className="sec-head">
        <span className="kicker">Proceso</span>
        <h2>Cómo funciona</h2>
        <p>Cinco pasos simples para que tu comunidad esté siempre alerta.</p>
      </div>

      <div className="como-funciona-grid">
        <div className="pasos-lista" ref={pasosRef}>
          <div className="paso">
            <span className="num">1</span>
            <div>
              <h3>Regístrate</h3>
              <p>Crea tu cuenta en un par de minutos, sin complicaciones.</p>
            </div>
          </div>

          <div className="paso">
            <span className="num">2</span>
            <div>
              <h3>Roles</h3>
              <p>
                El administrador que se te asigne te pondrá un rol dependiendo
                de tu cargo, o si eres ciudadano tendrás acceso sencillo.
              </p>
            </div>
          </div>

          <div className="paso">
            <span className="num">3</span>
            <div>
              <h3>Gestiona alertas</h3>
              <p>
                Recibe o genera notificaciones en tiempo real sobre eventos
                importantes en tu comunidad.
              </p>
            </div>
          </div>

          <div className="paso">
            <span className="num">4</span>
            <div>
              <h3>Colabora</h3>
              <p>
                Participa en la mejora de tu comunidad al compartir información
                y experiencias relevantes.
              </p>
            </div>
          </div>

          <div className="paso">
            <span className="num">5</span>
            <div>
              <h3>Gestiona</h3>
              <p>
                Accede a un historial de alertas y reportes para mantener un
                registro de lo que ha sucedido en tu comunidad.
              </p>
            </div>
          </div>
        </div>

        <div className="como-funciona-imagen">
          <img src="/img/maya.png" alt="Mascota de WolertApp" />
        </div>
      </div>
    </section>
  )
}

export default ComoFunciona
