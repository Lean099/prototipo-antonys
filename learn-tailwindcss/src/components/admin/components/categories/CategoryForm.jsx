import { useState } from 'react';
import axios from 'axios';
import { useMenuStore } from '../../../../store/useMenuStore';

const CategoryForm = ({ category, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const setCategories = useMenuStore((state) => state.setCategories);

  const isEditing = Boolean(category);
  console.log(isActive);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      alert('El nombre de la categoría no puede estar vacío');
      return;
    }

    if (name.trim().length < 3) {
      alert('El nombre de la categoría debe tener al menos 3 caracteres');
      return;
    }

    try {
      if (isEditing) {
        console.log('ENVIANDO AL BACKEND:', {
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        });
        const res = await axios.put(`${API_URL}/categories/updateCategory/${category.id}`, {
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        });
        console.log('RESPUESTA DEL BACKEND:', res.data);
        if (res.status === 200) {
          const allCategories = await axios.get(`${API_URL}/categories/getAllCategories`);
          if (allCategories.status === 200) {
            setCategories(allCategories.data);
          }
        }

        console.log('Editar categoría:', res.data);
      } else {
        const res = await axios.post(`${API_URL}/categories/createCategory`, {
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        });
        if (res.status === 200) {
          const allCategories = await axios.get(`${API_URL}/categories/getAllCategories`);
          if (allCategories.status === 200) {
            setCategories(allCategories.data);
          }
        }
        console.log('Crear categoría:', res.data);
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar la categoría:', error);

      alert(error.response?.data?.detail || 'No se pudo guardar la categoría');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="label">
          <span className="label-text">Nombre</span>
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="label">
          <span className="label-text">Descripción</span>
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la categoría"
          className="textarea textarea-bordered w-full"
          rows="3"
        />
      </div>

      {/* Disponibilidad */}
      <div>
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="checkbox checkbox-primary"
          />

          <span className="label-text">Categoría disponible</span>
        </label>
      </div>

      {/* Botones */}
      <div className="modal-action">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>

        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
