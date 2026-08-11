import { useState } from 'react';

const ProductForm = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    hasStock: product?.hasStock ?? true,
    stock: product?.stock ?? '',
    isAvailable: product?.isAvailable ?? true,
    imageUrl: product?.imageUrl || '',
  });

  const isEditing = Boolean(product);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Producto:', formData);

    onClose();
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
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre del producto"
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
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción del producto"
          className="textarea textarea-bordered w-full"
          rows="3"
        />
      </div>

      {/* Categoría + Precio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Categoría</span>
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Seleccionar categoría</option>
            <option value="Hamburguesas">Hamburguesas</option>
            <option value="Sandwiches">Sandwiches</option>
            <option value="Pizzas">Pizzas</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Agregados">Agregados</option>
            <option value="Menús">Menús</option>
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Precio</span>
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="input input-bordered w-full"
            required
          />
        </div>
      </div>

      {/* Stock */}
      <div className="border rounded-lg p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hasStock"
            checked={formData.hasStock}
            onChange={handleChange}
            className="checkbox"
          />

          <span className="font-medium">Este producto maneja stock</span>
        </label>

        {formData.hasStock && (
          <div>
            <label className="label">
              <span className="label-text">Stock</span>
            </label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="input input-bordered w-full"
            />
          </div>
        )}
      </div>

      {/* Imagen */}
      <div>
        <label className="label">
          <span className="label-text">URL de imagen</span>
        </label>

        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
          className="input input-bordered w-full"
        />

        {formData.imageUrl && (
          <div className="mt-4">
            <img src={formData.imageUrl} alt="Vista previa" className="w-32 h-32 object-cover rounded-lg border" />
          </div>
        )}
      </div>

      {/* Disponible */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleChange}
          className="toggle toggle-primary"
        />

        <span className="font-medium">Producto disponible</span>
      </label>

      {/* Acciones */}
      <div className="modal-action">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>

        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
