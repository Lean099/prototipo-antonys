import { useState, useEffect } from "react";
import { CreditCard, Landmark, Banknote, Copy } from "lucide-react";
import axios from 'axios';

// Datos de transferencia (pueden venir de .env o API)
const TRANSFER_DATA = {
  nombre: "Comidas Rápidas S.A.",
  cvu: "0000003100088822333444",
  alias: "comidas.rapidas.mp",
};

const PaymentMethods = ({ cart, total }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initPoint, setInitPoint] = useState("");
  const [isMobile, setIsMobile] = useState(null);
  const [efectivoOption, setEfectivoOption] = useState("");
  const [copiedField, setCopiedField] = useState(null); // "cvu" o "alias"

  useEffect(() => {
    // Reiniciar initPoint cuando cambia el carrito
    setInitPoint("");
  }, [cart]);

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

  // Manejar creación de preferencia para Mercado Pago (débito)
  const handleDebito = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://drucilla-nonfashionable-nonaesthetically.ngrok-free.dev/crear-preferencia",
        {
          items: cart,
          total,
        }
      );
      setInitPoint(res.data.init_point);
    } catch (error) {
      console.error("Error al enviar pedido: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar pedido para transferencia o efectivo
  const handleConfirmarPedido = async (datosAdicionales = {}) => {
    setLoading(true);
    try {
      await axios.post("/api/crear-pedido", {
        items: cart,
        total,
        metodoPago: selected,
        ...datosAdicionales, // { efectivo_modo: "delivery" } por ejemplo
      });
      alert("Pedido confirmado. ¡Gracias!");
      // Aquí podrías redirigir a una página de éxito
    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      alert("Hubo un error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  // Copiar texto al portapapeles
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(err => console.error("Error al copiar: ", err));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-3">Método de pago</h3>

      {/* Selector de métodos */}
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

      {/* --- DÉBITO (MERCADO PAGO) --- */}
      {selected === "debito" && (
        !initPoint ? (
          <button
            className="btn btn-primary w-full mt-6"
            onClick={handleDebito}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xl"></span>
            ) : (
              "Confirmar y crear orden"
            )}
          </button>
        ) : (
          <button
            className="btn btn-warning w-full mt-6"
            onClick={() => window.open(initPoint, "_blank")}
          >
            Ir a pagar
          </button>
        )
      )}

      {/* --- TRANSFERENCIA --- */}
      {selected === "transferencia" && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="font-semibold mb-2">Datos para transferencia</h4>

          <div className="space-y-3 text-sm">
            {/* Nombre */}
            <div>
              <span className="font-medium">Nombre:</span> {TRANSFER_DATA.nombre}
            </div>

            {/* CVU con botón copiar */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">CVU:</span> {TRANSFER_DATA.cvu}
              </div>
              <button
                onClick={() => handleCopy(TRANSFER_DATA.cvu, "cvu")}
                className="btn btn-ghost btn-xs gap-1"
                title="Copiar CVU"
              >
                <Copy size={16} />
                {copiedField === "cvu" && (
                  <span className="text-success text-xs">¡Copiado!</span>
                )}
              </button>
            </div>

            {/* Alias con botón copiar */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Alias:</span> {TRANSFER_DATA.alias}
              </div>
              <button
                onClick={() => handleCopy(TRANSFER_DATA.alias, "alias")}
                className="btn btn-ghost btn-xs gap-1"
                title="Copiar Alias"
              >
                <Copy size={16} />
                {copiedField === "alias" && (
                  <span className="text-success text-xs">¡Copiado!</span>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Una vez realizada la transferencia, confirmá tu pedido.
          </p>

          <button
            className="btn btn-primary w-full mt-4"
            onClick={() => handleConfirmarPedido()}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Confirmar pedido"
            )}
          </button>
        </div>
      )}

      {/* --- EFECTIVO --- */}
      {selected === "efectivo" && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="font-semibold mb-2">¿Cómo vas a pagar?</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="efectivoOption"
                value="delivery"
                checked={efectivoOption === "delivery"}
                onChange={(e) => setEfectivoOption(e.target.value)}
                className="radio radio-primary"
              />
              Pago al delivery cuando llega a casa
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="efectivoOption"
                value="retiro"
                checked={efectivoOption === "retiro"}
                onChange={(e) => setEfectivoOption(e.target.value)}
                className="radio radio-primary"
              />
              Pago al retirar en el local
            </label>
          </div>
          <button
            className="btn btn-primary w-full mt-4"
            onClick={() => handleConfirmarPedido({ efectivo_modo: efectivoOption })}
            disabled={loading || !efectivoOption}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Confirmar pedido"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;