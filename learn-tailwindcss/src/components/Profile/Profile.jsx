import { useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import Avatar from "./Avatar";

const Profile = () => {
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    passw: "",
    direccion: user?.direccion || "",
    telefono: user?.telefono || ""
  });

  const deleteModalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Actualizar usuario:", formData);
  };

  const handleDelete = () => {
    console.log("Cuenta eliminada");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* PERFIL */}
      <div className="flex flex-col items-center gap-4 mb-6">

        {/* OPCIÓN 1: FOTO 
        <div className="avatar">
          <div className="w-24 rounded-full">
            <img src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-profile-picture-business-profile-woman-suitable-social-media-profiles-icons-screensavers-as-templatex9_719432-1339.jpg?semt=ais_hybrid&w=740&q=80" alt="profile" />
          </div>
        </div>*/}

        <Avatar name="Leandro"/>

        {/* OPCIÓN 2: TEXTO */}
        <h2 className="text-2xl font-bold">
          Hola, {user?.name || "Usuario"} 👋
        </h2>

      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Nombre"
          className="input input-bordered w-full"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="passw"
          placeholder="Nueva contraseña"
          className="input input-bordered w-full"
          value={formData.passw}
          onChange={handleChange}
        />

        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          className="input input-bordered w-full"
          value={formData.direccion}
          onChange={handleChange}
        />

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          className="input input-bordered w-full"
          value={formData.telefono}
          onChange={handleChange}
        />

        {/* BOTÓN GUARDAR */}
        <button className="btn btn-primary w-full">
          Guardar cambios
        </button>
      </form>

      {/* BOTÓN ELIMINAR */}
      <div className="mt-6">
        <button
          onClick={() => deleteModalRef.current.showModal()}
          className="btn btn-error w-full"
        >
          Eliminar cuenta
        </button>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            ¿Estás seguro?
          </h3>
          <p className="py-4">
            Esta acción no se puede deshacer.
          </p>

          <div className="modal-action">

            {/* Cancelar */}
            <form method="dialog">
              <button className="btn">Cancelar</button>
            </form>

            {/* Confirmar */}
            <button
              onClick={handleDelete}
              className="btn btn-error"
            >
              Confirmar
            </button>

          </div>
        </div>

        {/* cerrar clic afuera */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}

export default Profile;