import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import formatSizeName from '../../utils/formatSizeName';

const Card = ({ id, category_id, name, description, price, image_url, sizes = [] }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const categories = useMenuStore((state) => state.categories);

  const [selectedSize, setSelectedSize] = useState(null);

  const hasSizes = sizes.length > 0;

  const selectedPrice = selectedSize ? selectedSize.price : price;

  const canAddToCart = !hasSizes || selectedSize !== null;

  // Identificamos la categoría del producto
  const category = categories.find((category) => category.id === category_id);

  const isHamburger = category?.name?.toLowerCase() === 'hamburguesas';

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      id,
      name,
      sizeId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      price: selectedPrice,
      image_url,
      isHamburger,
    });
  };

  const handleBuy = () => {
    if (!canAddToCart) return;

    addToCart({
      id,
      name,
      sizeId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      price: selectedPrice,
      image_url,
      isHamburger,
    });

    navigate('/checkout');
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <figure className="h-48 overflow-hidden">
        <img className="w-full h-full object-cover" src={image_url} alt={name} />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{name}</h2>

        <p>{description}</p>

        {hasSizes && (
          <div className="mt-2">
            <label className="text-sm font-medium mb-1 block">Tamaño</label>

            <select
              className="select select-bordered w-full"
              value={selectedSize?.id || ''}
              onChange={(e) => {
                const size = sizes.find((size) => size.id === e.target.value);

                setSelectedSize(size || null);
              }}
            >
              <option value="" disabled>
                Elegir tamaño
              </option>

              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {formatSizeName(size.name)} - ${size.price}
                </option>
              ))}
            </select>

            {selectedSize?.name === 'cuadruple' && (
              <div className="text-sm mt-2 p-2 rounded-lg bg-base-200">
                💡 ¿Querés agregar más carne?
                <br />
                Podés sumar medallones desde Agregados.
              </div>
            )}
          </div>
        )}

        <div className="card-actions justify-between items-center mt-2">
          <span className="font-bold">${selectedPrice}</span>

          <div>
            <button className="btn btn-sm mr-2 btn-primary" disabled={!canAddToCart} onClick={handleAddToCart}>
              Agregar
              <ShoppingCart className="w-4 h-4" />
            </button>

            <button className="btn btn-sm btn-primary" disabled={!canAddToCart} onClick={handleBuy}>
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
