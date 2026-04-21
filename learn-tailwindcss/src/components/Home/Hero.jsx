import HeroFood from '../../../public/hero-food.png'
import { Link } from 'react-router-dom'

const Hero = ()=>{
  return (
    <div className="min-h-[75vh] flex items-center bg-base-200 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* TEXTO */}
        <div className="space-y-5 text-center md:text-left">

          <h1 className="text-4xl md:text-5xl font-bold">
            Sabor auténtico, entregado caliente
          </h1>

          <p className="text-gray-600">
            Hamburguesas jugosas, pizzas y lomos.  
            Pedí fácil, pagá en el local o al recibir.
          </p>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">

            <button 
            onClick={() => { document.getElementById("menu").scrollIntoView({ behavior: "smooth" });}}
            className="btn rounded-full px-6 bg-[#EBE1D1] text-[#222222] border-none">
              Ver menú
            </button>

            <Link to="/contacto" className="btn rounded-full px-6 btn-outline">
              Horarios
            </Link>

          </div>

        </div>

        {/* IMAGEN */}
        <div className="flex justify-center">
          <img
            src={HeroFood}
            alt="producto"
            className="w-[300px] md:w-[400px] drop-shadow-xl"
          />
        </div>

      </div>

    </div>
  )
}

export default Hero;