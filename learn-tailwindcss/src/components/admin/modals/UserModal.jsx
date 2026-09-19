import { useModalStore } from '../../../store/useModalStore';
import UserForm from '../components/users/UsersForm';

const UserModal = () => {
  const activeModal = useModalStore((state) => state.activeModal);
  const modalData = useModalStore((state) => state.modalData);
  const closeModal = useModalStore((state) => state.closeModal);

  if (activeModal !== 'user') return null;

  const user = modalData?.user;
  const isEditing = Boolean(user);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <button type="button" onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>

        <h3 className="font-bold text-xl mb-6">{isEditing ? 'Editar usuario' : 'Nuevo usuario'}</h3>

        <UserForm key={user?.id ?? 'new'} user={user} onClose={closeModal} />
      </div>

      <div className="modal-backdrop" onClick={closeModal} />
    </dialog>
  );
};

export default UserModal;
