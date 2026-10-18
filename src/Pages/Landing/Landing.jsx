import Header from '../../components/Landing/Header'
import Hero from '../../components/Landing/Hero'
import Producto from '../../components/Landing/Producto'
import ComoFunciona from '../../components/Landing/ComoFunciona'
import Cobertura from '../../components/Landing/Cobertura'
import Seguridad from '../../components/Landing/Seguridad'
import Footer from '../../components/Landing/Footer'
import '../../css/landing/styles.css'

function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Producto />
        <ComoFunciona />
        <Cobertura />
        <Seguridad />
      </main>
      <Footer />
    </>
  )
}

export default Landing
