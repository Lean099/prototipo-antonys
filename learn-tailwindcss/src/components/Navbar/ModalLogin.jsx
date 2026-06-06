import axios from 'axios';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useModalStore } from '../../store/useModalStore';

const ModalLogin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormDataLogin] = useState({
    identifier: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const setAddresses = useCheckoutStore((state) => state.setAddresses);
  const activeModal = useModalStore((state) => state.activeModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const openModal = useModalStore((state) => state.openModal);

  const handleChangeLogin = (e) => {
    const { name, value } = e.target;

    setFormDataLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeAndClear = () => {
    setFormDataLogin({
      identifier: '',
      password: '',
    });
    closeModal();
  };

  const sendDataLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);

      login(response.data);
      console.log('Usuario logueado con éxito', response.data);
      if (response.data) {
        // realizar otras acciones después del inicio de sesión
        const res = await axios.get(`${API_URL}/user/getUserAddresses/${response.data.id}`);
        setAddresses(res.data);
        console.log(useCheckoutStore.getState().addresses); // Verificar el estado actualizado de direcciones
      }
      closeAndClear();
    } catch (error) {
      console.log('Hubo un error al loguearse', error);
    }
  };

  return (
    <>
      <dialog className={`modal ${activeModal === 'login' ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-md">
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

          <h3 className="font-bold text-xl text-center mb-6">Iniciar sesión</h3>

          {/* FORM */}
          <form onSubmit={sendDataLogin} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="label mb-2">Nombre de usuario o tu Email</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChangeLogin}
                required
                placeholder="pepito / mail@site.com"
                className="input input-bordered w-full"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="label mb-2">Contraseña</label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChangeLogin}
                  required
                  placeholder="********"
                  className="input input-bordered w-full pr-12"
                />

                {/* botón mostrar/ocultar */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {/* BOTÓN */}
            <button className="btn btn-primary w-full mt-2">Iniciar sesión</button>
          </form>
          <div className="text-center mt-4">
            <span className="text-sm">¿No tenés cuenta?</span>
            <button type="button" className="btn btn-link btn-sm text-base-content" onClick={() => openModal('signup')}>
              Registrate
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

export default ModalLogin;
