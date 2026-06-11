import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/useCartStore';
import { useCheckoutStore } from '../../store/useCheckoutStore';

import Avatar from './Avatar';
import FormUserData from './FormUserData';
import FormUserAddress from './FormUserAddress';
import DeleteAccountModal from './DeleteAccountModal';

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearCheckout = useCheckoutStore((state) => state.clearCheckout);

  const handleDeleteAccount = async () => {
    try {
      const userId = user?.id;

      if (!userId) return;

      const res = await axios.delete(`${API_URL}/user/deleteUser/${userId}`);
      if (res.status === 200) {
        clearCart();
        clearCheckout();
        logout();
      } else {
        console.error('Error al eliminar la cuenta:', res.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar name={user?.username || 'Usuario'} w={60} h={60} />

        <h2 className="text-2xl font-bold text-center">Hola, {user?.username || 'Usuario'} 👋</h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormUserData />

        <FormUserAddress />
      </div>

      {/* DELETE MODAL */}

      <DeleteAccountModal onDelete={handleDeleteAccount} />
    </div>
  );
};

export default Profile;
