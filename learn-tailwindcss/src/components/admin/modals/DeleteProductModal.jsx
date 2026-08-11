import { useModalStore } from '../../../store/useModalStore';

const DeleteProductModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);

  const product = modalData?.product;

  if (activeModal !== 'deleteProduct') return null;

  const handleDelete = () => {
    if (!product) return;

    console.log('Eliminar producto:', product);

    closeModal();
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Eliminar producto</h3>

        <p className="py-4">¿Estás seguro que deseas eliminar este producto?</p>

        {product && (
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="font-semibold">{product.name}</p>

            <p className="text-sm opacity-70">Categoría: {product.category}</p>

            <p className="text-sm opacity-70">Precio: ${product.price.toLocaleString()}</p>
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

export default DeleteProductModal;
