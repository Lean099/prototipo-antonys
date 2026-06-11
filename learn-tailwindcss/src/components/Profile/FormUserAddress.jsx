import { useState, useRef, useEffect } from 'react';
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
  const formRef = useRef(null);

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

      /* Faltaria agregar mas seguridad aca, si no se pudo guardar la direccion en la DB, no deberiamos
       actualizar el estado de las direcciones en el frontend. Por ahora confio en que el backend va a
      responder con un error si algo sale mal, pero idealmente habria que manejar eso de forma mas robusta*/
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
  // Esta logica tendra que ir en el modal de confirmacion de borrado, pero por ahora la dejo aca para probar el flujo
  const handleDelete = (id) => {
    // Aca poner la logica para borrar la dirección de la DB
    store.removeAddress(id);

    if (editingAddress?.id === id) {
      // Si estoy editando la direccion que se borro, limpio el formulario
      setEditingAddress(null);
    }
  };

  useEffect(() => {
    if (!editingAddress) return;

    const navbarHeight = 64;

    const y = formRef.current.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 55; // Antes estaba en 16

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  }, [editingAddress]);

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

        <div ref={formRef}>
          <AddressForm
            key={editingAddress?.id || 'new'}
            initialData={editingAddress || {}}
            showDefault
            submitLabel={editingAddress ? 'Guardar cambios' : 'Agregar dirección'}
            onSubmit={handleSave}
            onCancel={editingAddress ? () => setEditingAddress(null) : undefined}
          />
        </div>

        {/* LIST */}

        {store.addresses.length > 3 && (
          <p className="text-xs opacity-60 mt-2">Mostrando las primeras direcciones. Deslizá para ver más.</p>
        )}

        <div
          className={`
    space-y-3
    mt-6

    ${
      store.addresses.length > 4
        ? `
          max-h-[370px]
          md:max-h-[460px]
          overflow-y-auto
          pr-2
        `
        : ''
    }
  `}
        >
          {store.addresses.length === 0 ? (
            <div className="alert">
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
