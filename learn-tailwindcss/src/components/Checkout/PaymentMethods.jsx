import { useState, useEffect } from "react";
import { CreditCard, Landmark, Banknote } from "lucide-react";
import axios from 'axios'

const PaymentMethods = ({cart, total}) => {
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false)
    const [initPoint, setInitPoint] = useState("")
    const [isMobile, setIsMobile] = useState(null)

    console.log(cart)

    useEffect(()=>{
        console.log("initPoint:", initPoint);
        console.log("typeof:", typeof initPoint);
        console.log("== '' :", initPoint == "");
        console.log("=== '' :", initPoint === "");

        setInitPoint("")
    }, [cart])


  const methods = [
    {
      id: "debito",
      label: "Tarjeta Débito",
      icon: <CreditCard className="w-10 h-10" />,
    },
    {
      id: "transferencia",
      label: "Transferencia",
      icon: <Landmark className="w-10 h-10" />,
    },
    {
      id: "efectivo",
      label: "Efectivo",
      icon: <Banknote className="w-10 h-10" />,
    },
  ];

    const handleSubmit = async ()=>{
        setLoading(true)
        /*let newWindow = null;

        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        setIsMobile(isMobile)

        if(!isMobile){
            newWindow = window.open("", "_blank")
        }*/


        try {
            const res = await axios.post("https://drucilla-nonfashionable-nonaesthetically.ngrok-free.dev/crear-preferencia",
                {
                    items: cart,
                    total
                }
            );

            setInitPoint(res.data.init_point)
            /*console.log("Respuesta: ", res.data)
            console.log(isMobile)
            if(isMobile){
                window.location.href = url
            }*/
        } catch (error) {
            //if (newWindow) newWindow.close();
            console.log("Error al enviar pedido: ", error)
        }finally{
            setLoading(false)
        }
    }


  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-3">Método de pago</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => setSelected(method.id)}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition
              ${
                selected === method.id
                  ? "border-primary bg-primary/10 scale-105"
                  : "hover:border-primary hover:scale-105"
              }
            `}
          >
            {method.icon}
            <span className="font-medium">{method.label}</span>
          </div>
        ))}
      </div>

      {
        selected === "debito" && (
                !initPoint ? (
                    <button className="btn btn-primary w-full mt-6" onClick={handleSubmit}>
                        {!loading ? "Confirmar y crear orden": <span class="loading loading-spinner loading-xl"></span>}
                    </button>
                ) : (
                    <button className='btn btn-warning w-full mt-6' onClick={() => window.open(initPoint, "_blank")}>Ir a pagar</button>
                )
            
        )
      }

      
    </div>
  );
};

export default PaymentMethods;