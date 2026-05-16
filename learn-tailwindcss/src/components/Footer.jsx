import { Facebook, Instagram, Phone } from "lucide-react";
import { Link } from 'react-router-dom'

const Footer = ()=>{
  return (
    <footer className="bg-base-200 text-base-content px-6 py-10">

      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">

        {/* NEGOCIO */}
        <div>
          <h2 className="text-xl font-bold mb-3">Antony's</h2>

          <p className="text-sm">
            Burger, pizza y lomos.  
            Calidad y sabor en cada pedido.
          </p>

          <p className="text-sm mt-3">
            📍 Diego de Villarroel 1819 - Aguilares - Tucuman
          </p>

          <p className="text-sm">
            📞 +54 38651234567
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Navegación</h2>

          <ul className="space-y-2 text-sm">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/#menu">Menú</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* REDES */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Seguinos</h2>

          <div className="flex gap-4">

            <a href="https://www.instagram.com/antonysd2/" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
              <Instagram className="w-5 h-5" />
            </a>

            <a href="https://www.instagram.com/antonysd2/" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
              <Facebook className="w-5 h-5" />
            </a>


          </div>

          {/* WhatsApp directo */}
          <a
            href="https://wa.me/5438651234567"
            target="_blank"
            className="btn btn-sm btn-success mt-4 w-full"
          >
            Contactar por WhatsApp
          </a>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-sm mt-10 border-t pt-4">
        © {new Date().getFullYear()} Antony's - Todos los derechos reservados
      </div>

    </footer>
  );
}

export default Footer;