import { useState } from "react";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { MapPin, Store, Plus, CheckCircle2, X } from "lucide-react";

const ShippingSelector = () => {
  const { 
    deliveryOption, setDeliveryOption, 
    addresses, selectedAddressId, setSelectedAddress, addAddress
  } = useCheckoutStore();

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: "", obs: "" });

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street) return;
    addAddress(newAddress);
    setNewAddress({ street: "", obs: "" });
    setShowForm(false);
  };

  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold mb-4">¿Cómo querés recibir tu pedido?</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => setDeliveryOption('pickup')}
          className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 
          ${deliveryOption === 'pickup' ? 'border-neutral bg-neutral/5' : 'border-base-300'}`}
        >
          <Store className={deliveryOption === 'pickup' ? 'text-neutral' : ''} />
          <div>
            <p className="font-bold text-sm">Retiro por el local</p>
            <p className="text-xs opacity-60">Sin costo adicional</p>
          </div>
        </div>

        <div 
          onClick={() => setDeliveryOption('delivery')}
          className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-center gap-4 
          ${deliveryOption === 'delivery' ? 'border-neutral bg-neutral/5' : 'border-base-300'}`}
        >
          <MapPin className={deliveryOption === 'delivery' ? 'text-neutral' : ''} />
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
                ${selectedAddressId === addr.id ? 'border-neutral bg-base-100 shadow-md' : 'border-base-300 bg-base-200/50 opacity-70'}
              `}
            >
              <div className={`mt-1 ${selectedAddressId === addr.id ? 'text-neutral' : 'text-gray-400'}`}>
                {selectedAddressId === addr.id ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{addr.street}</p>
                <p className="text-xs opacity-60">{addr.obs || "Sin notas"}</p>
              </div>
            </div>
          ))}

          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn btn-outline btn-neutral btn-sm gap-2 mt-2">
              <Plus size={16} /> Agregar otra dirección
            </button>
          ) : (
            <form onSubmit={handleAddNewAddress} className="bg-base-100 border-2 border-dashed border-neutral/30 p-5 rounded-xl mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Nueva ubicación</span>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-xs btn-circle"><X size={16}/></button>
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