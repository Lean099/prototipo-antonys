import { useModalStore } from '../../../store/useModalStore';
import { useMenuStore } from '../../../store/useMenuStore';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const DeleteCategoryModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);
  const setCategories = useMenuStore((state) => state.setCategories);

  const category = modalData?.category;

  if (activeModal !== 'deleteCategory') return null;

  const handleDelete = async () => {
    if (!category) return;

    try {
      const res = await axios.delete(`${API_URL}/categories/deleteCategory/${category.id}`);
      if (res.status === 200) {
        console.log('Categoría eliminada:', res.data);
        const allCategories = await axios.get(`${API_URL}/categories/getAllCategories`);
        if (allCategories.status === 200) {
          setCategories(allCategories.data);
        }
      }
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      alert(error.response?.data?.detail || 'No se pudo eliminar la categoría');
    }

    closeModal();
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Eliminar categoría</h3>

        <p className="py-4">¿Estás seguro que deseas eliminar esta categoría?</p>

        {category && (
          <div className="bg-base-200 p-4 rounded-lg">
            <p className="font-semibold">{category.name}</p>
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

export default DeleteCategoryModal;
