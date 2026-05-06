import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

const Card = ({id, title, description, price, image})=>{

    const navigate = useNavigate()
    const {
    addToCart
  } = useCartStore();

    return(
        <div className="card bg-base-100 shadow-md">
            <figure className="h-48 overflow-hidden">
                <img
                className="w-full h-full object-cover"
                src={image}
                alt={title} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>{description}</p>

                <div className="card-actions justify-between items-center">
                    <span className="font-bold">${price}</span>
                    <div className="">
                        <button className="btn btn-sm mr-2 btn-primary" onClick={()=> {addToCart({id, title, price, image})}}>
                            Agregar
                            
                        <ShoppingCart className="w-4 h-4"/>

                        </button>
                        <button className="btn btn-sm btn-primary" onClick={()=> {addToCart({id, title, price, image}); navigate('/checkout')}}>Comprar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card;