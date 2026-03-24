import axios from 'axios'
import { useState } from 'react'
import { useAuthStore } from "../store/authStore"

const ModalSignUp = () => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        passw: "",
        direccion: "",
        telefono: ""
    });

    const login = useAuthStore((state) => state.login)

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendData = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "https://drucilla-nonfashionable-nonaesthetically.ngrok-free.dev/create-user",
                formData
            );

            login(response.data);

        } catch (error) {
            console.log("Error al crear usuario: ", error)
        }
    }

    return (
        <>
            <button
                onClick={() => document.getElementById('my_modal_2').showModal()}
                className="btn btn-sm btn-soft bg-[#EBE1D1] text-[#222222]"
            >
                Registrarse
            </button>

            <dialog id="my_modal_2" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl">

                    {/* botón cerrar */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>

                    <h3 className="font-bold text-xl text-center mb-6">
                        Crear cuenta
                    </h3>

                    {/* FORM */}
                    <form onSubmit={sendData} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* EMAIL */}
                        <div className="md:col-span-2">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="mail@site.com"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* NOMBRE */}
                        <div>
                            <label className="label">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* TELEFONO */}
                        <div>
                            <label className="label">Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="+54 381..."
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* DIRECCION */}
                        <div className="md:col-span-2">
                            <label className="label">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Calle, número..."
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="md:col-span-2">
                            <label className="label">Contraseña</label>
                            <input
                                type="password"
                                name="passw"
                                value={formData.passw}
                                onChange={handleChange}
                                required
                                placeholder="********"
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* BOTÓN */}
                        <div className="md:col-span-2 mt-2">
                            <button className="btn btn-primary w-full">
                                Crear cuenta
                            </button>
                        </div>

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

export default ModalSignUp;