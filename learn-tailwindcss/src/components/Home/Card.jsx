import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

const Card = ({ id, name, description, price, image_url }) => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  return (
    <div className="card bg-base-100 shadow-md">
      <figure className="h-48 overflow-hidden">
        <img className="w-full h-full object-cover" src={image_url} alt={name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>

        <div className="card-actions justify-between items-center">
          <span className="font-bold">${price}</span>
          <div className="">
            <button
              className="btn btn-sm mr-2 btn-primary"
              onClick={() => {
                addToCart({ id, name, price, image_url });
              }}
            >
              Agregar
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                addToCart({ id, name, price, image_url });
                navigate('/checkout');
              }}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
