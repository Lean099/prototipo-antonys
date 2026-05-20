import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

const FormUserData = () => {

  const user = useAuthStore(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || ""
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log(
      "UPDATE USER:",
      formData
    );

    // FUTURO
    // await updateUser(formData)

  };

  return (

    <div className="card bg-base-200 shadow-sm">

      <div className="card-body">

        <h3 className="card-title mb-4">

          Datos personales

        </h3>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            className="input input-bordered w-full"
            value={formData.username}
            onChange={handleChange}
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={formData.email}
            onChange={handleChange}
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Nueva contraseña"
            className="input input-bordered w-full"
            value={formData.password}
            onChange={handleChange}
          />

          {/* PHONE */}
          <input
            type="text"
            name="phone"
            placeholder="Teléfono"
            className="input input-bordered w-full"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* SUBMIT */}
          <button
            className="btn btn-primary w-full"
          >
            Guardar cambios
          </button>

        </form>

      </div>

    </div>

  );

};

export default FormUserData;