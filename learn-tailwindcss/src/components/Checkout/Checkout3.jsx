import { useState, useEffect } from "react";
import PaymentMethods from "./PaymentMethods2";
import { useCartStore } from "../../store/useCartStore";
import { Plus, MapPin, Check } from "lucide-react";
import axios from "axios";

const Checkout = () => {
  const { cart, getTotal } = useCartStore();

  // Estado para tipo de entrega: "retiro" o "delivery"
  const [deliveryType, setDeliveryType] = useState("retiro");
  // Estado para dirección seleccionada (ID de la dirección)
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // Estado para mostrar formulario de nueva dirección
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  // Estado para lista de direcciones
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Estado para nueva dirección
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    floor: "",
    city: "",
    postalCode: "",
    references: "",
  });

  // Cargar direcciones del usuario (simulado o desde API)
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        // Reemplazar con tu endpoint real
        const response = await axios.get("/api/user/addresses");
        setAddresses(response.data);
        if (response.data.length > 0 && deliveryType === "delivery") {
          setSelectedAddressId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error cargando direcciones:", error);
        // Datos de ejemplo para pruebas
        const mockAddresses = [
          {
            id: 1,
            street: "Av. Corrientes",
            number: "1234",
            floor: "2B",
            city: "CABA",
            postalCode: "1043",
            references: "Entre Callao y Uruguay",
          },
        ];
        setAddresses(mockAddresses);
        if (deliveryType === "delivery") {
          setSelectedAddressId(mockAddresses[0].id);
        }
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [deliveryType]);

  // Manejar cambio de tipo de entrega
  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    if (type === "retiro") {
      setSelectedAddressId(null);
    } else {
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id);
      }
    }
  };

  // Manejar selección de dirección existente
  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  // Manejar agregar nueva dirección
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.number || !newAddress.city) {
      alert("Completá los campos obligatorios");
      return;
    }
    try {
      // Enviar a la API
      const response = await axios.post("/api/user/addresses", newAddress);
      const addedAddress = response.data;
      setAddresses([...addresses, addedAddress]);
      setSelectedAddressId(addedAddress.id);
      setShowNewAddressForm(false);
      setNewAddress({
        street: "",
        number: "",
        floor: "",
        city: "",
        postalCode: "",
        references: "",
      });
    } catch (error) {
      console.error("Error al agregar dirección:", error);
      alert("No se pudo guardar la dirección");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Resumen del carrito */}
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <figure className="h-30 w-35 overflow-hidden">
              <img
                className="w-full h-full object-cover rounded-md"
                src={item.image}
                alt={item.title}
              />
            </figure>
            <span>
              {item.title} x {item.quantity}
            </span>
          </div>
          <span>${item.price * item.quantity}</span>
        </div>
      ))}

      <hr className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>${getTotal}</span>
      </div>

      {/* Sección de tipo de entrega */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3">¿Cómo querés recibir tu pedido?</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryType"
              value="retiro"
              checked={deliveryType === "retiro"}
              onChange={() => handleDeliveryTypeChange("retiro")}
              className="radio radio-primary"
            />
            <span>Retiro en el local</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryType"
              value="delivery"
              checked={deliveryType === "delivery"}
              onChange={() => handleDeliveryTypeChange("delivery")}
              className="radio radio-primary"
            />
            <span>Envío a domicilio</span>
          </label>
        </div>

        {/* Si elige delivery, mostrar direcciones */}
        {deliveryType === "delivery" && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold mb-2">Dirección de envío</h3>

            {loadingAddresses ? (
              <div className="text-center py-4">
                <span className="loading loading-spinner"></span>
              </div>
            ) : (
              <>
                {/* Lista de direcciones guardadas */}
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-3 border rounded-lg cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handleSelectAddress(addr.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                            <div>
                              <p className="font-medium">
                                {addr.street} {addr.number}
                                {addr.floor && `, Piso ${addr.floor}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.postalCode}
                              </p>
                              {addr.references && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Ref: {addr.references}
                                </p>
                              )}
                            </div>
                          </div>
                          {selectedAddressId === addr.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">
                    No tenés direcciones guardadas. Agregá una para continuar.
                  </p>
                )}

                {/* Botón para agregar nueva dirección */}
                {!showNewAddressForm ? (
                  <button
                    className="btn btn-outline btn-sm mt-3 gap-2"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    <Plus size={16} />
                    Agregar nueva dirección
                  </button>
                ) : (
                  <form onSubmit={handleAddNewAddress} className="mt-4 space-y-3">
                    <h4 className="font-medium">Nueva dirección</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Calle *"
                        className="input input-bordered w-full"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Número *"
                        className="input input-bordered w-full"
                        value={newAddress.number}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, number: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Piso / Depto (opcional)"
                        className="input input-bordered w-full"
                        value={newAddress.floor}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, floor: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Ciudad *"
                        className="input input-bordered w-full"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Código Postal"
                        className="input input-bordered w-full"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, postalCode: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Referencias (ej: entre calles)"
                        className="input input-bordered w-full"
                        value={newAddress.references}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, references: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Guardar dirección
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Métodos de pago */}
      <PaymentMethods
        cart={cart}
        total={getTotal}
        deliveryType={deliveryType}
        selectedAddressId={selectedAddressId}
      />
    </div>
  );
};

export default Checkout;