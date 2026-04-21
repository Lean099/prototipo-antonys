import PaymentMethods from './PaymentMethods'
import { useCartStore } from "../../store/useCartStore";

const Checkout = ()=>{
    
    const {
    cart,
    getTotal
  } = useCartStore();

    return(
        <>
            <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                    <div className='flex items-center gap-4'>
                        <figure className="h-30 w-35 overflow-hidden">
                            <img
                            className="w-full h-full object-cover rounded-md"
                            src={item.image}
                            alt={item.title} />
                        </figure>
                        <span>{item.title} x {item.quantity}</span>
                    </div>
                    <span>${item.price * item.quantity}</span>
                </div>
            ))}

            <hr className="my-4" />

            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotal}</span>
            </div>

            

                <PaymentMethods cart={cart} total={getTotal}/>
            </div>
        </>
    )
}

export default Checkout;