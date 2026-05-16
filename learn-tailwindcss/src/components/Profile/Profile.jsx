import { useState, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import Avatar from "./Avatar";

const Profile = () => {

  const user = useAuthStore((state) => state.user);

  // =========================
  // USER FORM
  // =========================
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || ""
  });

  // =========================
  // ADDRESSES
  // =========================
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Casa",
      street: "San Martín",
      street_number: "123",
      details: "Portón negro",
      neighborhood: "Centro",
      latitude: -27.3412,
      longitude: -65.5921,
      isDefault: true
    }
  ]);

  // =========================
  // ADDRESS FORM
  // =========================
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

  const [addressForm, setAddressForm] = useState(initialAddressState);

  const deleteModalRef = useRef(null);

  // =========================
  // USER INPUTS
  // =========================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  // =========================
  // ADDRESS INPUTS
  // =========================
  const handleAddressChange = (e) => {

    const { name, value, type, checked } = e.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : value
    }));

  };

  // =========================
  // GET LOCATION
  // =========================
  const handleGetLocation = () => {

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const { latitude, longitude } = position.coords;

        setAddressForm((prev) => ({
          ...prev,
          latitude,
          longitude
        }));

      },

      (error) => {
        console.log(error);
        alert("No se pudo obtener la ubicación");
      },

      {
        enableHighAccuracy: true
      }

    );

  };

  // =========================
  // SAVE ADDRESS
  // =========================
  const handleSaveAddress = () => {

    if (
      !addressForm.label ||
      !addressForm.street ||
      !addressForm.street_number
    ) {
      alert("Completa los campos obligatorios");
      return;
    }

    let updatedAddresses = [...addresses];

    // SOLO UNA DIRECCIÓN PRINCIPAL
    if (addressForm.isDefault) {

      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: false
      }));

    }

    // EDITAR
    if (addressForm.id) {

      updatedAddresses = updatedAddresses.map((addr) =>
        addr.id === addressForm.id
          ? addressForm
          : addr
      );

    } else {

      // CREAR
      updatedAddresses.push({
        ...addressForm,
        id: Date.now()
      });

    }

    setAddresses(updatedAddresses);

    // RESET
    setAddressForm(initialAddressState);

  };

  // =========================
  // EDIT ADDRESS
  // =========================
  const handleEditAddress = (address) => {
    setAddressForm(address);
  };

  // =========================
  // DELETE ADDRESS
  // =========================
  const handleDeleteAddress = (id) => {

    setAddresses((prev) =>
      prev.filter((addr) => addr.id !== id)
    );

    // SI ESTABA EDITANDO ESA DIRECCIÓN
    if (addressForm.id === id) {
      setAddressForm(initialAddressState);
    }

  };

  // =========================
  // SAVE USER
  // =========================
  const handleSubmit = (e) => {

    e.preventDefault();

    const payload = {
      ...formData,
      addresses
    };

    console.log("USER UPDATE:", payload);

  };

  // =========================
  // DELETE ACCOUNT
  // =========================
  const handleDelete = () => {
    console.log("Cuenta eliminada");
  };

  return (

    <div className="max-w-7xl mx-auto p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ========================= */}
        {/* LEFT SIDE */}
        {/* ========================= */}
        <div>

          {/* PROFILE */}
          <div className="flex flex-col items-center gap-4 mb-6">

            <Avatar name={user?.username || "Usuario"} />

            <h2 className="text-2xl font-bold text-center">
              Hola, {user?.username || "Usuario"} 👋
            </h2>

          </div>

          {/* USER FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              type="text"
              name="username"
              placeholder="Usuario"
              className="input input-bordered w-full"
              value={formData.username}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={handleChange}
            />

            <button className="btn btn-primary w-full">
              Guardar cambios
            </button>

          </form>

          {/* DELETE ACCOUNT */}
          <div className="mt-6">

            <button
              onClick={() =>
                deleteModalRef.current.showModal()
              }
              className="btn btn-error w-full"
            >
              Eliminar cuenta
            </button>

          </div>

        </div>

        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}
        <div className="bg-base-200 rounded-2xl p-5 h-fit">

          <h3 className="text-xl font-bold mb-5">
            Mis direcciones
          </h3>

          {/* ADDRESS FORM */}
          <div className="space-y-3">

            {/* LABEL */}
            <input
              type="text"
              name="label"
              placeholder="Casa, Trabajo..."
              className="input input-bordered w-full"
              value={addressForm.label}
              onChange={handleAddressChange}
            />

            {/* STREET */}
            <div className="grid grid-cols-2 gap-3">

              <input
                type="text"
                name="street"
                placeholder="Calle"
                className="input input-bordered w-full"
                value={addressForm.street}
                onChange={handleAddressChange}
              />

              <input
                type="text"
                name="street_number"
                placeholder="Número"
                className="input input-bordered w-full"
                value={addressForm.street_number}
                onChange={handleAddressChange}
              />

            </div>

            {/* NEIGHBORHOOD */}
            <input
              type="text"
              name="neighborhood"
              placeholder="Barrio"
              className="input input-bordered w-full"
              value={addressForm.neighborhood}
              onChange={handleAddressChange}
            />

            {/* DETAILS */}
            <textarea
              name="details"
              placeholder="Detalles para el delivery"
              className="textarea textarea-bordered w-full"
              value={addressForm.details}
              onChange={handleAddressChange}
            />

            {/* LAT LNG */}
            <div className="grid grid-cols-2 gap-3">

              <input
                type="text"
                name="latitude"
                placeholder="Latitud"
                className="input input-bordered w-full"
                value={addressForm.latitude}
                onChange={handleAddressChange}
              />

              <input
                type="text"
                name="longitude"
                placeholder="Longitud"
                className="input input-bordered w-full"
                value={addressForm.longitude}
                onChange={handleAddressChange}
              />

            </div>

            {/* LOCATION BUTTON */}
            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={handleGetLocation}
            >
              📍 Usar mi ubicación
            </button>

            {/* DEFAULT */}
            <label className="label cursor-pointer justify-start gap-3">

              <input
                type="checkbox"
                name="isDefault"
                className="checkbox checkbox-primary"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
              />

              <span className="label-text">
                Dirección principal
              </span>

            </label>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">

              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={handleSaveAddress}
              >
                {addressForm.id
                  ? "Guardar cambios"
                  : "Agregar dirección"}
              </button>

              {addressForm.id && (

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setAddressForm(initialAddressState)
                  }
                >
                  Cancelar
                </button>

              )}

            </div>

          </div>

          {/* ADDRESS LIST */}
          <div className="space-y-3 mt-6">

            {addresses.length === 0 ? (

              <div className="alert">
                <span>
                  No tenés direcciones guardadas
                </span>
              </div>

            ) : (

              addresses.map((addr) => (

                <div
                  key={addr.id}
                  className="card bg-base-100 border border-base-300"
                >

                  <div className="card-body p-4">

                    <div className="flex justify-between items-start gap-4">

                      {/* INFO */}
                      <div>

                        <div className="flex items-center gap-2 mb-1">

                          <h4 className="font-bold">
                            {addr.label}
                          </h4>

                          {addr.isDefault && (
                            <div className="badge badge-primary">
                              Principal
                            </div>
                          )}

                        </div>

                        <p className="text-sm opacity-80">
                          {addr.street} {addr.street_number}
                        </p>

                        <p className="text-sm opacity-70">
                          {addr.neighborhood}
                        </p>

                        {addr.details && (
                          <p className="text-sm mt-2">
                            {addr.details}
                          </p>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-col gap-2">

                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() =>
                            handleEditAddress(addr)
                          }
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() =>
                            handleDeleteAddress(addr.id)
                          }
                        >
                          Eliminar
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* DELETE MODAL */}
      {/* ========================= */}
      <dialog
        ref={deleteModalRef}
        className="modal"
      >

        <div className="modal-box">

          <h3 className="font-bold text-lg">
            ¿Estás seguro?
          </h3>

          <p className="py-4">
            Esta acción no se puede deshacer.
          </p>

          <div className="modal-action">

            {/* CANCEL */}
            <form method="dialog">

              <button className="btn">
                Cancelar
              </button>

            </form>

            {/* CONFIRM */}
            <button
              onClick={handleDelete}
              className="btn btn-error"
            >
              Confirmar
            </button>

          </div>

        </div>

        {/* BACKDROP */}
        <form
          method="dialog"
          className="modal-backdrop"
        >
          <button>close</button>
        </form>

      </dialog>

    </div>

  );
};

export default Profile;