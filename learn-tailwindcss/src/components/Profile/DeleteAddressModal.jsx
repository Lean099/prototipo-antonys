import axios from 'axios';
import { useModalStore } from '../../store/useModalStore';

const DeleteAddressModal = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const activeModal = useModalStore((state) => state.activeModal);

  const modalData = useModalStore((state) => state.modalData);

  const closeModal = useModalStore((state) => state.closeModal);

  const handleDelete = async () => {
    const addressId = modalData?.address?.id;

    if (!addressId) return;

    try {
      await axios.delete(`${API_URL}/address/deleteAddress/${addressId}`);

      modalData?.onConfirm?.(addressId);

      closeModal();
    } catch (error) {
      console.error('Error al eliminar dirección', error);
    }
  };

  console.log('Modal data:', modalData);

  return (
    <dialog className={`modal ${activeModal === 'deleteAddress' ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Eliminar dirección</h3>

        <p className="py-4">¿Estás seguro que deseas eliminar esta dirección?</p>

        {modalData?.address && (
          <div className="bg-base-200 p-3 rounded-lg text-sm">
            <p>Titulo: {modalData?.address?.label}</p>
            <p>
              Calle: {modalData?.address?.street} {modalData?.address?.street_number}
            </p>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            Cancelar
          </button>

          <button className="btn btn-error" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={closeModal} />
    </dialog>
  );
};

export default DeleteAddressModal;
