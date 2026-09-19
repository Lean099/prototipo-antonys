import { useState, useEffect, useRef } from 'react';
import { useMenuStore } from '../../../../store/useMenuStore';
import axios from 'axios';

const ProductForm = ({ product, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category_id || '',
    price: product?.price || '',
    hasStock: product?.hasStock ?? true,
    stock: product?.stock ?? '',
    isAvailable: product?.isAvailable ?? true,
    imageUrl: product?.imageUrl || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '');
  const fileInputRef = useRef(null);

  const isEditing = Boolean(product);

  const categories = useMenuStore((state) => state.categories);
  const setProducts = useMenuStore((state) => state.setProducts);

  // Liberar la URL temporal cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Guardamos el archivo para enviarlo más adelante
    setImageFile(file);

    // Creamos una URL temporal para la vista previa
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Ya no necesitamos la URL anterior si seleccionamos una imagen nueva
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
  };

  const handleRemoveImage = () => {
    // Liberamos la URL temporal si existe
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview('');

    // Limpiamos el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (price < 0) {
      alert('El precio no puede ser menor a 0');
      return;
    }

    if (formData.hasStock && stock < 0) {
      alert('El stock no puede ser menor a 0');
      return;
    }

    const data = new FormData();

    data.append('category_id', formData.category);
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('has_stock', formData.hasStock);
    data.append('stock', formData.stock);
    data.append('is_available', formData.isAvailable);

    if (imageFile) {
      data.append('image', imageFile);
    }

    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
      if (isEditing) {
        const res = await axios.put(`${API_URL}/products/updateProduct/${product.id}`, data);
        if (res.status === 200) {
          const products = await axios.get(`${API_URL}/products/getAllProducts`);
          if (products.status === 200) {
            setProducts(products.data);
          }
        }
      } else {
        const res = await axios.post(`${API_URL}/products/createProduct`, data);
        if (res.status === 200) {
          const products = await axios.get(`${API_URL}/products/getAllProducts`);
          if (products.status === 200) {
            setProducts(products.data);
          }
        }
      }
      onClose();
    } catch (error) {
      console.error('Error al crear el producto:', error);
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
            <option value="" disabled>
              Seleccionar categoría
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
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
            min="0"
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
          <span className="label-text">Imagen del producto</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input file-input-bordered w-full"
        />

        {imageFile && (
          <div className="flex items-center justify-between mt-2 gap-3">
            <p className="text-sm text-base-content/60 truncate">Imagen seleccionada: {imageFile.name}</p>

            <button type="button" onClick={handleRemoveImage} className="btn btn-sm btn-error btn-outline">
              Quitar
            </button>
          </div>
        )}

        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Vista previa</p>

            <img
              src={imagePreview}
              alt="Vista previa del producto"
              className="w-32 h-32 object-cover rounded-lg border border-base-300"
            />
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
