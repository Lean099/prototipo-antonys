import logo1 from '../../public/logo1-inverted.png'
import {TextAlignJustify, ShoppingCart} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import {useState} from 'react'
import ModalLogin from './ModalLogin'
import ModalSignUp from './ModalSignup'
import { useAuthStore } from '../store/authStore'

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
            <div className="navbar bg-base-100 shadow-sm w-full px-4">

                <div className='sm:flex md:hidden lg:hidden'>
                    <details class="dropdown ">
                      <summary class="btn m-1"><TextAlignJustify /></summary>
                      <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                        <li><Link to="/">Inicio</Link></li>
                        <li><a>Menu</a></li>
                        <li><Link to="/contacto">Contacto / Ubicacion</Link></li>
                        <li><a>Iniciar Sesion</a></li>
                      </ul>
                  </details>
                </div>

                {/* Izquierda */}
                <div className="flex-1">
                  <Link to="/" className="btn btn-ghost text-xl">
                    <img src={logo1} className='w-20 h-20 object-contain' alt="" srcset="" />
                  </Link>
                  
                </div>

                {/* Centro */}
                <div className="hidden md:flex gap-4 mr-3">
                  <Link to="/" className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Inicio</Link>
                  <button className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Menu</button>
                  <Link to="/contacto" className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Contacto / Ubicacion</Link>
                  { !user ?  (
                    <>
                      <ModalLogin/>
                      <ModalSignUp/>
                    </>
                  ): (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-mono">
                          Hola {user.name}
                        </span>
                        <button onClick={logoutTest} className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  ) }
                  
                  <button onClick={testUser} className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]">Test</button>
                </div>

                {/* Derecha */}
                {/* Boton de carrito */}
                <div className="flex-none gap-3">
                  <div className={`dropdown dropdown-end mr-3 ${ open ? "dropdown-open" : "" }`} 
                       onClick={()=>{setOpen(prev => !prev); console.log(open)}}>
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                      <div className="indicator">
                        <ShoppingCart className='h-5 w-5'/>
                        <span className="badge badge-sm indicator-item">{cart.length}</span>
                      </div>
                    </div>
                    {
                      open && (
                        <div
                          tabIndex={0}
                          className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-52 shadow"
                          onClick={(e) => e.stopPropagation()}>
                          <div className="card-body">
                            <span className="text-lg font-bold">{cart.length} Items</span>
                            {
                              cart.map(item =>(
                                <li key={item.id} className='flex justify-between items-center'>
                                  <span>{item.title}</span>
                                  <div className='flex gap-2'>
                                      <button onClick={() => updateQuantity(item.id, -1)}>➖</button>
                                      <span>{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, 1)}>➕</button>
                                      <button onClick={() => removeFromCart(item.id)}>❌</button>
                                  </div>
                                </li>
                              ))
                            }
                            <span className="text-info">Total: {total}</span>
                            <div className="card-actions">
                              <button className="btn btn-primary btn-block"
                                onClick={() => navigate("/checkout")}
                                disabled={cart.length === 0}
                              >Ver resumen</button>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    
                  </div>

                  {/* Boton de cuenta */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt="Tailwind CSS Navbar component"
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
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