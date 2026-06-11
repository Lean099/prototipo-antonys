import { useRef } from 'react';

const DeleteAccountModal = ({ onDelete }) => {
  const modalRef = useRef(null);

  const handleConfirm = () => {
    onDelete?.();
    // Tendremos que esperar la respuesta del backend para cerrar el modal, mientras tanto podria mostrar un loader o algo similar y luego cerrar el modal
    modalRef.current.close();
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <div className="mt-8">
        <button
          className="
            btn
            btn-error
            w-full
          "
          onClick={() => modalRef.current.showModal()}
        >
          Eliminar cuenta
        </button>
      </div>

      {/* MODAL */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">¿Estás seguro?</h3>

          <p className="py-4">Esta acción no se puede deshacer. Eliminaras todos tus datos.</p>

          <div className="modal-action">
            {/* CANCEL */}
            <form method="dialog">
              <button className="btn">Cancelar</button>
            </form>

            {/* CONFIRM */}
            <button
              className="
                btn
                btn-error
              "
              onClick={handleConfirm}
            >
              Confirmar
            </button>
          </div>
        </div>

        {/* BACKDROP */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default DeleteAccountModal;
