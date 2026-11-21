import { useCallback, useEffect, useRef, useState } from 'react'

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Entradas al hacer scroll.
 * Pon el ref en la <section> y marca los hijos con la clase "reveal"
 * (o "reveal-line"). Al entrar en pantalla reciben la clase "in" y el CSS
 * los anima con stagger usando la variable --i.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef(null)

  useEffect(() => {
    const raiz = ref.current
    if (!raiz) return

    const elementos = raiz.querySelectorAll('.reveal, .reveal-line')

    if (prefiereMenosMovimiento() || !('IntersectionObserver' in window)) {
      elementos.forEach((el) => el.classList.add('in'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )

    elementos.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [threshold])

  return ref
}

/**
 * Luz que sigue al cursor dentro de una tarjeta.
 * Uso: <div onMouseMove={spotlight}> y en CSS usa var(--mx) / var(--my).
 */
export function useSpotlight() {
  return useCallback((e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])
}

/**
 * Contador animado que arranca cuando el elemento entra en pantalla.
 * Devuelve [ref, valor]. Pon el ref en el elemento que muestra el número.
 */
export function useCountUp(objetivo, duracion = 1600) {
  const ref = useRef(null)
  const [valor, setValor] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefiereMenosMovimiento() || !('IntersectionObserver' in window)) {
      setValor(objetivo)
      return
    }

    let raf = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const inicio = performance.now()
        const paso = (ahora) => {
          const p = Math.min((ahora - inicio) / duracion, 1)
          const suave = p === 1 ? 1 : 1 - Math.pow(2, -10 * p) // easeOutExpo
          setValor(Math.round(objetivo * suave))
          if (p < 1) raf = requestAnimationFrame(paso)
        }
        raf = requestAnimationFrame(paso)
      },
      { threshold: 0.6 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [objetivo, duracion])

  return [ref, valor]
}

export default useReveal
