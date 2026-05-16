import { useState } from "react";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { useThemeStore } from "../../store/useThemeStore"
import { MapPin, Store, Plus, CheckCircle2, X, LocateFixed } from "lucide-react";

const ShippingSelector = () => {
  const { 
    deliveryOption, setDeliveryOption, 
    addresses, selectedAddressId, setSelectedAddress, addAddress
  } = useCheckoutStore();

  const { theme } = useThemeStore();

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: "", obs: "" });

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street) return;
    addAddress(newAddress);
    setNewAddress({ street: "", obs: "" });
    setShowForm(false);
  };

  const handleGetCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log(lat, lng)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        setNewAddress((prev) => ({
          ...prev,
          street: data.display_name || "",
          lat,
          lng,
        }));
      } catch (error) {
        console.error(error);
        alert("No se pudo obtener la dirección");
      }
    },
    (error) => {
      console.error(error);

      if (error.code === 1) {
        alert("Permiso de ubicación denegado");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold mb-4">¿Cómo querés recibir tu pedido?</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => setDeliveryOption('pickup')}
          className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 
          ${deliveryOption === 'pickup' ? (theme === 'cupcake' ? 'border-neutral bg-neutral/5' : 'border-secondary bg-secondary/5') : 'border-base-300'}`}
        >
          <Store className={deliveryOption === 'pickup' ? (theme === 'cupcake' ? 'text-neutral' : 'text-secondary') : ''} />
          <div>
            <p className="font-bold text-sm">Retiro por el local</p>
            <p className="text-xs opacity-60">Sin costo adicional</p>
          </div>
        </div>

        <div 
          onClick={() => setDeliveryOption('delivery')}
          className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 
          ${deliveryOption === 'delivery' ? (theme === 'cupcake' ? 'border-neutral bg-neutral/5' : 'border-secondary bg-secondary/5') : 'border-base-300'}`}
        >
          <MapPin className={deliveryOption === 'delivery' ? (theme === 'cupcake' ? 'text-neutral' : 'text-secondary') : ''} />
          <div>
            <p className="font-bold text-sm">Envío a domicilio</p>
            <p className="text-xs opacity-60">Llega en 30-45 min</p>
          </div>
        </div>
      </div>

      {deliveryOption === 'delivery' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tus direcciones</h4>
          
          {addresses.map((addr) => (
            <div 
              key={addr.id}
              onClick={() => setSelectedAddress(addr.id)}
              className={`relative p-4 border rounded-xl cursor-pointer transition flex items-start gap-3
                ${selectedAddressId === addr.id ? `${theme === 'cupcake' ? 'border-neutral': 'border-secondary'} bg-base-100 shadow-md` : 'border-base-300 bg-base-200/50 opacity-70'}
              `}
            >
              <div className={`mt-1 ${selectedAddressId === addr.id ? (theme === 'cupcake' ? 'text-neutral': 'text-secondary') : 'text-gray-400'}`}>
                {selectedAddressId === addr.id ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{addr.street}</p>
                <p className="text-xs opacity-60">{addr.obs || "Sin notas"}</p>
              </div>
            </div>
          ))}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className={`btn ${theme === 'cupcake' ? 'btn-neutral' : 'btn-secondary'} btn-outline  btn-sm gap-2 mt-2`}>
              <Plus size={16} /> Agregar otra dirección
            </button>
          ) : (
            <form onSubmit={handleAddNewAddress} className={`bg-base-100 border-2 border-dashed ${theme === 'cupcake' ? 'border-neutral/30':'border-secondary/30'} p-5 rounded-xl mt-4 space-y-3`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    Nueva ubicación
                  </span>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className={`btn btn-sm mt-3 ${
                      theme === 'cupcake'
                        ? 'btn-neutral'
                        : 'btn-secondary'
                    }`}
                  >
                    <LocateFixed size={16} />
                    Usar mi ubicación actual
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X size={16} />
                </button>
              </div>
              <input 
                type="text" placeholder="Calle y número" className="input input-bordered w-full input-sm" required
                value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              />
              <input 
                type="text" placeholder="Notas (opcional)" className="input input-bordered w-full input-sm"
                value={newAddress.obs} onChange={(e) => setNewAddress({...newAddress, obs: e.target.value})}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary btn-sm flex-1">Guardar y usar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
};

export default ShippingSelector;