import { useModalStore } from '../../../store/useModalStore';
import CategoryForm from '../components/categories/CategoryForm';

const CategoryModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);

  if (activeModal !== 'category') return null;

  const category = modalData?.category;
  const isEditing = Boolean(category);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>

        <h3 className="font-bold text-xl mb-6">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</h3>

        <CategoryForm key={category?.id ?? 'new'} category={category} onClose={closeModal} />
      </div>

      <div className="modal-backdrop" onClick={closeModal} />
    </dialog>
  );
};

export default CategoryModal;
