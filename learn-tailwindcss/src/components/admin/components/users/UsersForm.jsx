import { useState } from 'react';

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'customer',
  });

  const isEditing = Boolean(user);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Usuario:', formData);

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Usuario */}
      <div>
        <label className="label">
          <span className="label-text">Nombre de usuario</span>
        </label>

        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Nombre de usuario"
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="label">
          <span className="label-text">Email</span>
        </label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="label">
          <span className="label-text">{isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}</span>
        </label>

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          className="input input-bordered w-full"
          required={!isEditing}
        />
      </div>

      {/* Rol */}
      <div>
        <label className="label">
          <span className="label-text">Rol</span>
        </label>

        <select name="role" value={formData.role} onChange={handleChange} className="select select-bordered w-full">
          <option value="customer">Cliente</option>

          <option value="employee">Empleado</option>

          <option value="admin">Administrador</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="modal-action">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>

        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
