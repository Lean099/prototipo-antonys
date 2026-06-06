import axios from 'axios';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/useModalStore';

const ModalSignUp = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });

  const login = useAuthStore((state) => state.login);
  const activeModal = useModalStore((state) => state.activeModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeAndClear = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
    });
    closeModal();
  };

  const sendData = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);
      const response = await axios.post(`${API_URL}/auth/register`, formData);

      login(response.data);
      closeAndClear();
    } catch (error) {
      console.log('Error al crear usuario: ', error);
    }
  };

  return (
    <>
      <dialog className={`modal ${activeModal === 'signup' ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          {/* botón cerrar */}
          <form method="dialog">
            <button
              type="button"
              onClick={() => closeAndClear()}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>

          <h3 className="font-bold text-xl text-center mb-6">Crear cuenta</h3>

          {/* FORM */}
          <form onSubmit={sendData} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EMAIL */}
            <div className="md:col-span-2">
              <label className="label mb-2">Email</label>
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
              <label className="label mb-2">Nombre</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="input input-bordered w-full"
              />
            </div>

            {/* TELEFONO */}
            <div>
              <label className="label mb-2">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+54 381..."
                className="input input-bordered w-full"
              />
            </div>

            {/* PASSWORD */}
            <div className="md:col-span-2">
              <label className="label mb-2">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
                className="input input-bordered w-full"
              />
            </div>

            {/* BOTÓN */}
            <div className="md:col-span-2 mt-2">
              <button className="btn btn-primary w-full">Crear cuenta</button>
            </div>
          </form>
          <div className="text-center mt-4">
            <span className="text-sm">¿Ya tenés cuenta?</span>

            <button type="button" className="btn btn-link btn-sm text-base-content" onClick={() => openModal('login')}>
              Iniciar sesión
            </button>
          </div>

          {/* FOOTER */}
          <div className="modal-action">
            <form method="dialog">
              <button type="button" onClick={() => closeAndClear()} className="btn">
                Cerrar
              </button>
            </form>
          </div>
        </div>

        {/* click afuera */}
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => closeAndClear()}>
            close
          </button>
        </form>
      </dialog>
    </>
  );
};

export default ModalSignUp;
