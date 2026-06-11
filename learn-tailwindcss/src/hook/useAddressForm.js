import { useState } from 'react';

const useAddressForm = (initialData = {}) => {
  const initialFormData = {
    id: null,

    label: '',

    street: '',

    street_number: '',

    neighborhood: '',

    details: '',

    latitude: '',

    longitude: '',

    is_default: false,

    ...initialData,
  };

  const [formData, setFormData] = useState(initialFormData);

  // INPUTS

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // GEOLOCATION

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,

          latitude: latitude.toFixed(6),

          longitude: longitude.toFixed(6),
        }));
      },

      (error) => {
        console.error(error);

        alert('No se pudo obtener ubicación');
      },

      {
        enableHighAccuracy: true,
      },
    );
  };

  return {
    formData,

    initialFormData,

    setFormData,

    handleChange,

    handleGetLocation,
  };
};

export default useAddressForm;
