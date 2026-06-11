import { LocateFixed } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import useAddressForm from '../../hook/useAddressForm';

const AddressForm = ({ initialData = {}, showDefault = true, submitLabel = 'Guardar', onSubmit, onCancel }) => {
  const { theme } = useThemeStore();

  const { formData, initialFormData, setFormData, handleChange, handleGetLocation } = useAddressForm(initialData);

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.street || !formData.street_number) {
      alert('Completa los campos obligatorios');

      return;
    }

    onSubmit?.(formData);
    setFormData(initialFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* LABEL */}

      <input
        type="text"
        name="label"
        placeholder="Titulo: Casa, Amigo, Trabajo, Novia..."
        className="
          input
          input-bordered
          w-full
        "
        value={formData.label}
        onChange={handleChange}
      />

      {/* STREET */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        <input
          type="text"
          name="street"
          placeholder="Calle"
          className="
            input
            input-bordered
            w-full
          "
          value={formData.street}
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
          value={formData.street_number}
          onChange={handleChange}
        />
      </div>

      {/* NEIGHBORHOOD */}

      <input
        type="text"
        name="neighborhood"
        placeholder="Barrio (opcional)"
        className="
          input
          input-bordered
          w-full
        "
        value={formData.neighborhood}
        onChange={handleChange}
      />

      {/* DETAILS */}

      <textarea
        name="details"
        placeholder="Detalles/referencias para el delivery (opcional)"
        className="
          textarea
          textarea-bordered
          w-full
        "
        value={formData.details}
        onChange={handleChange}
      />

      {/* COORDINATES */}

      <div className="space-y-2">
        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <input
            type="text"
            name="latitude"
            placeholder="Latitud"
            className="
              input
              input-bordered
              w-full
            "
            value={formData.latitude}
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
            value={formData.longitude}
            readOnly
          />
        </div>

        <p
          className="
            text-xs
            text-base-content/60
            px-1
          "
        >
          <strong> “Latitud”</strong> y <strong> “Longitud”</strong> son Datos opcionales. Se completan automáticamente
          al usar la opcion
          <strong> “Usar mi ubicación”</strong>. No es necesario ingresarlos manualmente.
        </p>
      </div>

      {/* GEO */}

      <button
        type="button"
        onClick={handleGetLocation}
        className={`
          btn
          btn-outline
          w-full
          gap-2
          ${theme === 'cupcake' ? 'btn-neutral' : 'btn-secondary'}
        `}
      >
        <LocateFixed size={18} />
        Usar mi ubicación
      </button>

      {/* DEFAULT */}

      {showDefault && (
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
            name="is_default"
            className="
              checkbox
              checkbox-primary
            "
            checked={formData.is_default}
            onChange={handleChange}
          />

          <span
            className="
              label-text
            "
          >
            Dirección principal
          </span>
        </label>
      )}

      {/* ACTIONS */}

      <div
        className="
          flex
          gap-2
        "
      >
        <button
          type="submit"
          className="
            btn
            btn-primary
            flex-1
          "
        >
          {submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              btn
              btn-ghost
            "
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
