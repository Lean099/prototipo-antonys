import axios from 'axios'
import { useState } from 'react'
import { useAuthStore } from "../../store/authStore"

const ModalLogin = ({id}) => {

    const [formData, setFormDataLogin] = useState({
        email: "",
        passw: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const login = useAuthStore((state) => state.login)

    const handleChangeLogin = (e) => {
        const { name, value } = e.target

        setFormDataLogin(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const sendDataLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "https://drucilla-nonfashionable-nonaesthetically.ngrok-free.dev/login",
                formData
            )

            login(response.data)

        } catch (error) {
            console.log("Hubo un error al loguearse", error)
        }
    }

    return (
        <>
            <button
                onClick={() => document.getElementById(id).showModal()}
                className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]"
            >
                Iniciar Sesión
            </button>

            <dialog id={id} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-md">

                    {/* botón cerrar */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>

                    <h3 className="font-bold text-xl text-center mb-6">
                        Iniciar sesión
                    </h3>

                    {/* FORM */}
                    <form onSubmit={sendDataLogin} className="space-y-4">

                        {/* EMAIL */}
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChangeLogin}
                                required
                                placeholder="mail@site.com"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="label">Contraseña</label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="passw"
                                    value={formData.passw}
                                    onChange={handleChangeLogin}
                                    required
                                    placeholder="********"
                                    className="input input-bordered w-full pr-12"
                                />

                                {/* botón mostrar/ocultar */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
                                >
                                    {showPassword ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                        </div>

                        {/* BOTÓN */}
                        <button className="btn btn-primary w-full mt-2">
                            Iniciar sesión
                        </button>

                    </form>

                    {/* FOOTER */}
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>

                </div>

                {/* click afuera */}
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}

export default ModalLogin;