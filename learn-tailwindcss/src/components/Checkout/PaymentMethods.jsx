import { useState, useEffect } from "react";
import { CreditCard, Landmark, Banknote, Copy, Check } from "lucide-react"; // Importamos los íconos
import axios from 'axios';
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { useThemeStore } from "../../store/useThemeStore"

const PaymentMethods = ({ cart, total }) => {

  const API_URL = import.meta.env.VITE_API_URL_NGROK
  const { deliveryOption, paymentMethodsOption, setPMSelected } = useCheckoutStore();
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(false);  // Se usa solo para simular
  const [initPoint, setInitPoint] = useState("");
  const [cashMethod, setCashMethod] = useState(null);  // delivery | pickup
  
  // Estado para feedback de copiado
  const [copied, setCopied] = useState("");

  const datosTransferencia = {
    titular: "Alfredo Enzo Gutierrez",
    cvu: "0000003100000000000000",
    alias: "antonys"
  };

  useEffect(() => {
    setInitPoint("");
  }, [cart]);

  // Función para copiar al portapapeles
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000); // Volver al ícono original tras 2 seg
  };

  const methods = [
    { id: "debito", label: "Tarjeta Débito", icon: <CreditCard className="w-10 h-10" /> },
    { id: "transferencia", label: "Transferencia", icon: <Landmark className="w-10 h-10" /> },
    { id: "efectivo", label: "Efectivo", icon: <Banknote className="w-10 h-10" /> },
  ];

  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/crear-preferencia`, { items: cart, total });
      setInitPoint(res.data.init_point);
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    // Simulación de envío
    setTimeout(() => {
      setLoading(false);
      alert("Pedido confirmado");
    }, 1000);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-3">Método de pago</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => { setPMSelected(method.id); setCashMethod(null); }}
            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition
              ${paymentMethodsOption === method.id ? (theme === 'cupcake' ? "border-neutral bg-neutral/10 scale-105" : "border-secondary bg-secondary/10 scale-105") : (theme === 'cupcake' ? "hover:border-neutral hover:scale-105" : "hover:border-secondary hover:scale-105")}
            `}
          >
            {method.icon}
            <span className="font-medium">{method.label}</span>
          </div>
        ))}
      </div>

      {/* --- VISTA: TRANSFERENCIA --- */}
      {paymentMethodsOption === "transferencia" && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm animate-in fade-in duration-300">
          <h4 className="font-bold mb-4 text-center">Datos de la cuenta</h4>
          <div className="flex flex-col gap-4 text-sm md:text-base">
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-500">Titular:</span>
              <span className="font-medium">{datosTransferencia.titular}</span>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold">CVU</span>
                <span className="font-mono">{datosTransferencia.cvu}</span>
              </div>
              <button 
                className={`btn btn-circle btn-ghost btn-sm ${copied === 'cvu' ? 'text-success' : ''}`}
                onClick={() => handleCopy(datosTransferencia.cvu, 'cvu')}
              >
                {copied === 'cvu' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold">Alias</span>
                <span className="font-medium">{datosTransferencia.alias}</span>
              </div>
              <button 
                className={`btn btn-circle btn-ghost btn-sm ${copied === 'alias' ? 'text-success' : ''}`}
                onClick={() => handleCopy(datosTransferencia.alias, 'alias')}
              >
                {copied === 'alias' ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            Copiá los datos y enviá el comprobante por WhatsApp.
          </p>
          <button className="btn btn-primary w-full mt-4" onClick={handleConfirmOrder} disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : "Ya transferí / Confirmar pedido"}
          </button>
        </div>
      )}

      {/* --- VISTA: DÉBITO --- */}
      {paymentMethodsOption === "debito" && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm">
          {!initPoint ? (
            <button className="btn btn-primary w-full" onClick={handleMercadoPago}>
              {!loading ? "Confirmar y crear orden" : <span className="loading loading-spinner"></span>}
            </button>
          ) : (
            <button className="btn btn-warning w-full" onClick={() => window.open(initPoint, "_blank")}>Ir a pagar</button>
          )}
        </div>
      )}

      {/* --- VISTA: EFECTIVO --- */}
      {paymentMethodsOption === "efectivo" && (
        <div className="mt-6 p-5 border rounded-xl bg-base-100 shadow-sm">
          <p className="italic text-sm text-center">
            {
              deliveryOption === 'delivery' ? "👉 Recordá que el pago en efectivo se realiza al recibir el pedido."
              :
              "👉 Pagás en efectivo al retirar en el local."
            }
            
          </p>
          <button className="btn btn-primary w-full mt-6" onClick={handleConfirmOrder} disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : "Confirmar pedido en efectivo"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;