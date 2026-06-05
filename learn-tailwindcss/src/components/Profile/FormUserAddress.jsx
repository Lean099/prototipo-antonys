import { useState } from 'react';
import axios from 'axios';
import AddressCard from './AddressCard';
import AddressForm from '../address/AddressForm';
import { useAuthStore } from '../../store/authStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';

const FormUserAddress = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  /*const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Casa',
      street: 'San Martín',
      street_number: '123',
      neighborhood: 'Centro',
      details: 'Portón negro',
      latitude: '-31.420100',
      longitude: '-64.188800',
      isDefault: true,
    },
  ]);*/

  const store = useCheckoutStore();
  const user = useAuthStore((state) => state.user);

  const [editingAddress, setEditingAddress] = useState(null);

  // SAVE

  const handleSave = async (formData) => {
    try {
      const payload = {
        ...formData,

        latitude: formData.latitude === '' ? null : Number(formData.latitude),

        longitude: formData.longitude === '' ? null : Number(formData.longitude),
      };
      // UPDATE
      if (payload.id) {
        await axios.post(`${API_URL}/address/updateAddress/${user.id}/${payload.id}`, payload);
      }
      // CREATE
      else {
        delete payload.id;
        console.log(payload);
        await axios.post(`${API_URL}/address/createAddress/${user.id}`, payload);
      }

      // Refetch para sincronizar Zustand con la DB
      const addressesResponse = await axios.get(`${API_URL}/user/getUserAddresses/${user.id}`);
      console.log(addressesResponse.data);
      store.setAddresses(addressesResponse.data);

      setEditingAddress(null);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.detail || 'Error al guardar la dirección');
      } else {
        console.error('Error inesperado');
      }
    }

    /*let updatedAddresses = [...useCheckoutStore.getState().addresses];
    // SOLO UNA DEFAULT
    if (formData.isDefault) {
      // Aca lo que hace es retornar todas las direcciones pero con el isDefault en false
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,

        isDefault: false,
      }));
    }
    // EDIT
    if (formData.id) {
      updatedAddresses = updatedAddresses.map((addr) => (addr.id === formData.id ? formData : addr));
    }
    // CREATE
    else {
      updatedAddresses.push({
        ...formData,
      });
    }

    store.setAddresses(updatedAddresses);
    */
  };

  // EDIT

  const handleEdit = (address) => {
    setEditingAddress(address);
  };

  // DELETE

  const handleDelete = (id) => {
    store.removeAddress(id);

    if (editingAddress?.id === id) {
      setEditingAddress(null);
    }
  };

  return (
    <div
      className="
        card
        bg-base-200
        shadow-sm
      "
    >
      <div
        className="
          card-body
        "
      >
        <h3
          className="
            card-title
            mb-4
          "
        >
          Mis direcciones
        </h3>

        <AddressForm
          key={editingAddress?.id || 'new'}
          initialData={editingAddress || {}}
          showDefault
          submitLabel={editingAddress ? 'Guardar cambios' : 'Agregar dirección'}
          onSubmit={handleSave}
          onCancel={editingAddress ? () => setEditingAddress(null) : undefined}
        />

        {/* LIST */}

        <div
          className="
            space-y-3
            mt-6
          "
        >
          {store.addresses.length === 0 ? (
            <div
              className="
                alert
              "
            >
              <span>No tenés direcciones guardadas.</span>
            </div>
          ) : (
            store.addresses.map((addr) => (
              <AddressCard key={addr.id} address={addr} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FormUserAddress;
