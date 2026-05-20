const AddressCard = ({
  address,
  onEdit,
  onDelete
}) => {

  return (

    <div className="card bg-base-100 border border-base-300">

      <div className="card-body p-4">

        <div className="flex justify-between items-start gap-4">

          {/* INFO */}
          <div>

            <div className="flex items-center gap-2 mb-2">

              <h4 className="font-bold">

                {address.label}

              </h4>

              {address.isDefault && (

                <div className="badge badge-primary">

                  Principal

                </div>

              )}

            </div>

            <p className="text-sm opacity-80">

              {address.street}
              {" "}
              {address.street_number}

            </p>

            {address.neighborhood && (

              <p className="text-sm opacity-70">

                Barrio:
                {" "}
                {address.neighborhood}

              </p>

            )}

            {address.details && (

              <p className="text-sm mt-2">

                {address.details}

              </p>

            )}

            {(address.latitude &&
              address.longitude) && (

              <p className="text-xs opacity-50 mt-2">

                📍 {address.latitude},
                {" "}
                {address.longitude}

              </p>

            )}

          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2">

            <button
              className="
                btn
                btn-sm
                btn-outline
              "
              onClick={() =>
                onEdit(address)
              }
            >
              Editar
            </button>

            <button
              className="
                btn
                btn-sm
                btn-error
                btn-outline
              "
              onClick={() =>
                onDelete(address.id)
              }
            >
              Eliminar
            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default AddressCard;