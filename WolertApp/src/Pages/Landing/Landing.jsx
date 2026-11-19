import Header from '../../Components/Landing/Header'
import Hero from '../../Components/Landing/Hero'
import Producto from '../../Components/Landing/Producto'
import ComoFunciona from '../../Components/Landing/ComoFunciona'
import Cobertura from '../../Components/Landing/Cobertura'
import Seguridad from '../../Components/Landing/Seguridad'
import Footer from '../../Components/Landing/Footer'
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
