import { useState } from 'react';
import axios from 'axios';

const UserForm = ({ user, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    role: user?.role || 'customer',
    is_active: user?.is_active ?? true,
  });

  const isEditing = Boolean(user);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // Actualizar usuario existente
        const res = await axios.put(`${API_URL}/user/updateUser/${user.id}`, {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active,
        });

        if (res.status === 200) {
          console.log('Usuario actualizado:', res.data);
        }
      } else {
        // Crear nuevo usuario
        const res = await axios.post(`${API_URL}/user/createUser`, formData);

        if (res.status === 200) {
          console.log('Usuario creado:', res.data);
        }
      }

      console.log('Usuario:', formData);

      // Refrescar la lista de usuarios
      await onSuccess();

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    }
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

      {/* Teléfono */}
      <div>
        <label className="label">
          <span className="label-text">Teléfono</span>
        </label>

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="3811234567"
          className="input input-bordered w-full"
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

      {/* Usuario activo */}
      <div>
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />

          <span className="label-text">Usuario activo</span>
        </label>
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
