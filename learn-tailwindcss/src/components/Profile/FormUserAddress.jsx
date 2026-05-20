import { useState } from "react";
import AddressCard from "./AddressCard";

const FormUserAddress = () => {

  // MOCK DATA
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Casa",
      street: "San Martín",
      street_number: "123",
      details: "Portón negro",
      neighborhood: "Centro",
      latitude: -31.4201,
      longitude: -64.1888,
      isDefault: true
    }
  ]);

  const initialAddressState = {
    id: null,
    label: "",
    street: "",
    street_number: "",
    details: "",
    neighborhood: "",
    latitude: "",
    longitude: "",
    isDefault: false
  };

  const [addressForm, setAddressForm] = useState(
    initialAddressState
  );

  // INPUTS
  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

  };

  // GEOLOCATION
  const handleGetLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Tu navegador no soporta geolocalización"
      );

      return;

    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const {
          latitude,
          longitude
        } = position.coords;

        setAddressForm((prev) => ({
          ...prev,
          latitude,
          longitude
        }));

      },

      (error) => {

        console.log(error);

        alert(
          "No se pudo obtener ubicación"
        );

      },

      {
        enableHighAccuracy: true
      }

    );

  };

  // SAVE
  const handleSave = () => {

    if (
      !addressForm.label ||
      !addressForm.street ||
      !addressForm.street_number
    ) {

      alert(
        "Completa los campos obligatorios"
      );

      return;

    }

    let updatedAddresses = [...addresses];

    // SOLO 1 DEFAULT
    if (addressForm.isDefault) {

      updatedAddresses =
        updatedAddresses.map((addr) => ({
          ...addr,
          isDefault: false
        }));

    }

    // EDIT
    if (addressForm.id) {

      updatedAddresses =
        updatedAddresses.map((addr) =>

          addr.id === addressForm.id
            ? addressForm
            : addr

        );

    }

    // CREATE
    else {

      updatedAddresses.push({
        ...addressForm,
        id: Date.now()
      });

    }

    setAddresses(updatedAddresses);

    setAddressForm(
      initialAddressState
    );

  };

  // EDIT
  const handleEdit = (address) => {

    setAddressForm(address);

  };

  // DELETE
  const handleDelete = (id) => {

    setAddresses((prev) =>

      prev.filter(
        (addr) => addr.id !== id
      )

    );

    if (addressForm.id === id) {

      setAddressForm(
        initialAddressState
      );

    }

  };

  return (

    <div className="card bg-base-200 shadow-sm">

      <div className="card-body">

        <h3 className="card-title mb-4">

          Mis direcciones

        </h3>

        {/* FORM */}
        <div className="space-y-4">

          <input
            type="text"
            name="label"
            placeholder="Casa, Trabajo..."
            className="
              input
              input-bordered
              w-full
            "
            value={addressForm.label}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">

            <input
              type="text"
              name="street"
              placeholder="Calle"
              className="
                input
                input-bordered
                w-full
              "
              value={addressForm.street}
              onChange={handleChange}
            />

            <input
              type="text"
              name="street_number"
              placeholder="Número"
              className="
                input
                input-bordered
                w-full
              "
              value={addressForm.street_number}
              onChange={handleChange}
            />

          </div>

          {/* NEIGHBORHOOD */}
            <input
            type="text"
            name="neighborhood"
            placeholder="Barrio (Opcional)"
            className="
                input
                input-bordered
                w-full
            "
            value={addressForm.neighborhood}
            onChange={handleChange}
            />

            {/* DETAILS */}
            <textarea
            name="details"
            placeholder="Detalles para el delivery (Opcional)"
            className="
                textarea
                textarea-bordered
                w-full
            "
            value={addressForm.details}
            onChange={handleChange}
            />

            {/* LATITUDE + LONGITUDE */}
            <div className="space-y-2">

            <div className="grid grid-cols-2 gap-3">

                <input
                type="text"
                name="latitude"
                placeholder="Latitud"
                className="
                    input
                    input-bordered
                    w-full
                "
                value={addressForm.latitude}
                readOnly
                />

                <input
                type="text"
                name="longitude"
                placeholder="Longitud"
                className="
                    input
                    input-bordered
                    w-full
                "
                value={addressForm.longitude}
                readOnly
                />

            </div>

            <p
                className="
                text-xs
                text-base-content/60
                leading-relaxed
                px-1
                "
            >

                <strong>{" "}“Latitud”</strong> y <strong>{" "}“Longitud”</strong> son Datos opcionales.
                Se completan automáticamente
                al usar la opcion
                <strong>
                {" "}“Usar mi ubicación”
                </strong>.
                No es necesario ingresarlos
                manualmente.

            </p>

            </div>

            {/* GEO BUTTON */}
            <button
            type="button"
            className="
                btn
                btn-outline
                w-full
            "
            onClick={handleGetLocation}
            >

            📍 Usar mi ubicación

            </button>

          {/* DEFAULT */}
          <label
            className="
              label
              cursor-pointer
              justify-start
              gap-3
            "
          >

            <input
              type="checkbox"
              name="isDefault"
              className="
                checkbox
                checkbox-primary
              "
              checked={
                addressForm.isDefault
              }
              onChange={handleChange}
            />

            <span className="label-text">

              Dirección principal

            </span>

          </label>

          {/* BUTTONS */}
          <div className="flex gap-2">

            <button
              type="button"
              className="
                btn
                btn-primary
                flex-1
              "
              onClick={handleSave}
            >
              {addressForm.id
                ? "Guardar cambios"
                : "Agregar dirección"}
            </button>

            {addressForm.id && (

              <button
                type="button"
                className="
                  btn
                  btn-ghost
                "
                onClick={() =>
                  setAddressForm(
                    initialAddressState
                  )
                }
              >
                Cancelar
              </button>

            )}

          </div>

        </div>

        {/* LIST */}
        <div className="space-y-3 mt-6">

          {addresses.length === 0 ? (

            <div className="alert">

              <span>

                No tenés direcciones
                guardadas.

              </span>

            </div>

          ) : (

            addresses.map((addr) => (

              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            ))

          )}

        </div>

      </div>

    </div>

  );

};

export default FormUserAddress;