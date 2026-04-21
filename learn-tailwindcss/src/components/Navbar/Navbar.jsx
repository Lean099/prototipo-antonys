import logo1 from '../../../public/logo1-inverted.png'
import defaultPhoto from '../../../public/default-photo.webp'
import {TextAlignJustify, ShoppingCart} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import {useState} from 'react'
import ModalLogin from '././ModalLogin'
import ModalSignUp from '././ModalSignup'
import { useAuthStore } from '../../store/authStore'
import Cart from './Cart'

const Navbar = ({cart, total, removeFromCart, updateQuantity})=>{

    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const user = useAuthStore((state)=> state.user)
    const logout = useAuthStore((state)=> state.logout)
    const testUser = ()=>{
      console.log(user)
    }
    const logoutTest = ()=>{
      logout()
    }

    return(
            <div className="navbar sticky top-0 z-50 bg-base-100 shadow-sm w-full px-4">


                {/* Boton que aparece en telefonos */}
                <div className='sm:flex md:hidden lg:hidden'>
                    <details class="dropdown ">
                      <summary class="btn m-1"><TextAlignJustify /></summary>
                      <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-45 p-2 shadow-sm">
                        <li><Link className="flex justify-center w-full" to="/">Inicio</Link></li>
                        <li><Link className="flex justify-center w-full" to="/#menu">Menu</Link></li>
                        <li><Link className="flex justify-center w-full" to="/contacto">Contacto</Link></li>
                        {!user && (
                          <>
                            <ModalLogin id="my_modal_1"/>
                            <ModalSignUp id="my_modal_2"/>
                          </>
                        )}
                        {
                          user && (
                            <>
                              <li><Link className="flex justify-center w-full" to="/perfil">Perfil</Link></li>
                              <li><Link className="flex justify-center w-full" to="/pedidos">Pedidos</Link></li>
                              <li><button onClick={logoutTest} className="flex justify-center w-full">Cerrar sesión</button></li>
                            </>
                          )
                        }
                      </ul>
                  </details>
                </div>

                {/* Logo */}
                <div className="flex-1">
                  <Link to="/" className="btn btn-ghost text-xl">
                    <img src={logo1} className='w-20 h-20 object-contain' alt="" srcset="" />
                  </Link>
                  
                </div>

                {/* Botones para las pantallas mas grandes */}
                <div className="hidden md:flex gap-2 mr-3">
                  <Link to="/" className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Inicio</Link>
                  <Link to="/#menu" className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Menu</Link>
                  <Link to="/contacto" className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Contacto</Link>
                  { !user ?  (
                    <>
                      <ModalLogin id="my_modal_3"/>
                      <ModalSignUp id="my_modal_4"/>
                    </>
                  ): (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-mono">
                          Hola {user.name}
                        </span>
                      </div>
                    </>
                  ) }
                </div>

                {/* Derecha */}
                {/* Boton de carrito 1 */}
                <div className="flex-none gap-3">
                  
                  <Cart/>

                  {/* Boton de cuenta */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt="Tailwind CSS Navbar component"
                          src={defaultPhoto} />
                      </div>
                    </div>
                    <ul
                      tabIndex="-1"
                      className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                      <li><Link to='/perfil'>Perfil</Link></li>
                      <li><Link to='/pedidos'>Pedidos</Link></li>
                      <li><a onClick={logoutTest}>Cerrar Sesion</a></li>
                    </ul>
                  </div>
                </div>

            </div>

            
    )
}

export default Navbar;