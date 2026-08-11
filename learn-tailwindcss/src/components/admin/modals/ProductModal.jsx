import { useModalStore } from '../../../store/useModalStore';
import ProductForm from '../components/products/ProductForm';

const ProductModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);

  if (activeModal !== 'product') return null;

  const product = modalData?.product;
  const isEditing = Boolean(product);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>

        <h3 className="font-bold text-xl mb-6">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h3>

        <ProductForm key={product?.id ?? 'new'} product={product} onClose={closeModal} />
      </div>

      <div className="modal-backdrop" onClick={closeModal} />
    </dialog>
  );
};

export default ProductModal;
