import { useState, useRef, useEffect } from 'react';
import { MapPin, Store, Plus, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

import { useCheckoutStore } from '../../store/useCheckoutStore';

import { useThemeStore } from '../../store/useThemeStore';

import AddressForm from '../address/AddressForm';

const ShippingSelector = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const {
    deliveryOption,
    setDeliveryOption,

    addresses,

    selectedAddressId,
    setSelectedAddress,

    setAddresses,
  } = useCheckoutStore();
  const user = useAuthStore((state) => state.user);

  const { theme } = useThemeStore();

  const [showForm, setShowForm] = useState(false);

  const formAnchorRef = useRef(null);

  // SAVE

  const handleAddAddress = async (formData) => {
    try {
      const payload = {
        ...formData,

        latitude: formData.latitude === '' ? null : Number(formData.latitude),

        longitude: formData.longitude === '' ? null : Number(formData.longitude),
      };
      delete payload.id;
      console.log(payload);
      const res = await axios.post(`${API_URL}/address/createAddress/${user.id}`, payload); // devuelve {"message": "", "address": {}}
      setSelectedAddress(res.data.address.id); // Selecciono la dirección recién creada
      // Refetch para sincronizar Zustand con la DB
      const addressesResponse = await axios.get(`${API_URL}/user/getUserAddresses/${user.id}`);
      console.log(addressesResponse.data);
      setAddresses(addressesResponse.data);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.detail || 'Error al guardar la dirección');
      } else {
        console.error('Error inesperado');
      }
    }

    /*addAddress({
      ...formData,

      id: Date.now(),
    });*/

    setShowForm(false);
  };

  useEffect(() => {
    if (!showForm) return;

    const element = formAnchorRef.current;

    if (!element) return;

    const y = element.getBoundingClientRect().top + window.scrollY - 80;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  }, [showForm]);

  return (
    <section className="mb-8">
      <h3
        className="
          text-lg
          font-bold
          mb-4
        "
      >
        ¿Cómo querés recibir tu pedido?
      </h3>

      {/* OPTIONS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
          mb-6
        "
      >
        {/* PICKUP */}

        <div
          onClick={() => setDeliveryOption('pickup')}
          className={`
            p-4
            border-2
            rounded-xl
            cursor-pointer
            transition
            flex
            items-center
            gap-4

            ${
              deliveryOption === 'pickup'
                ? theme === 'cupcake'
                  ? `
                        border-neutral
                        bg-neutral/5
                        `
                  : `
                        border-secondary
                        bg-secondary/5
                        `
                : 'border-base-300'
            }
          `}
        >
          <Store />

          <div>
            <p
              className="
                font-bold
                text-sm
              "
            >
              Retiro por local
            </p>

            <p
              className="
                text-xs
                opacity-60
              "
            >
              Sin costo adicional
            </p>
          </div>
        </div>

        {/* DELIVERY */}

        <div
          onClick={() => setDeliveryOption('delivery')}
          className={`
            p-4
            border-2
            rounded-xl
            cursor-pointer
            transition
            flex
            items-center
            gap-4

            ${
              deliveryOption === 'delivery'
                ? theme === 'cupcake'
                  ? `
                        border-neutral
                        bg-neutral/5
                        `
                  : `
                        border-secondary
                        bg-secondary/5
                        `
                : 'border-base-300'
            }
          `}
        >
          <MapPin />

          <div>
            <p
              className="
                font-bold
                text-sm
              "
            >
              Envío domicilio
            </p>

            <p
              className="
                text-xs
                opacity-60
              "
            >
              30-45 min
            </p>
          </div>
        </div>
      </div>

      {/* DELIVERY */}

      {deliveryOption === 'delivery' && (
        <div
          className="
            space-y-3
            animate-in
            fade-in
          "
        >
          <h4
            className="
              text-sm
              font-bold
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Tus direcciones
          </h4>

          {/* LIST */}

          {addresses.length > 3 && (
            <p className="text-xs opacity-60 mb-2">Mostrando las primeras direcciones. Deslizá para ver más.</p>
          )}

          <div
            className={`
              space-y-3
              ${
                addresses.length > 3
                  ? `
                    max-h-64
                    md:max-h-80
                    overflow-y-auto
                    pr-2
                  `
                  : ''
              }
            `}
          >
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddress(addr.id)}
                className={`
                relative
                p-4
                border
                rounded-xl
                cursor-pointer
                transition
                flex
                gap-3

                ${
                  selectedAddressId === addr.id
                    ? `
                      border-secondary
                      bg-base-100
                      shadow-md
                      `
                    : `
                      border-base-300
                      opacity-70
                      `
                }
              `}
              >
                <div className="mt-1">
                  {selectedAddressId === addr.id ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <div
                      className="
                        w-5
                        h-5
                        rounded-full
                        border-2
                      "
                    />
                  )}
                </div>

                <div
                  className="
                  flex-1
                "
                >
                  <p
                    className="
                    font-semibold
                    text-sm
                  "
                  >
                    {addr.label || 'Dirección'}
                    {' · '}
                    {addr.street} {addr.street_number}
                  </p>

                  <p
                    className="
                    text-xs
                    opacity-60
                  "
                  >
                    {addr.details || 'Sin notas'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FORM */}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className={`
                btn
                btn-outline
                btn-sm
                gap-2

                ${theme === 'cupcake' ? 'btn-neutral' : 'btn-secondary'}
              `}
            >
              <Plus size={16} />
              Agregar dirección
            </button>
          ) : (
            <div
              ref={formAnchorRef}
              className="
                bg-base-100
                rounded-xl
                border-2
                border-dashed
                p-5
                mt-4
              "
            >
              <AddressForm
                autofocus
                showDefault={false}
                submitLabel="
                  Guardar y usar
                "
                onSubmit={handleAddAddress}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ShippingSelector;
