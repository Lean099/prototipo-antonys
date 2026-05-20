import { useAuthStore } from "../../store/authStore";

import Avatar from "./Avatar";
import FormUserData from "./FormUserData";
import FormUserAddress from "./FormUserAddress";
import DeleteAccountModal from "./DeleteAccountModal";

const Profile = () => {

  const user = useAuthStore(
    (state) => state.user
  );

  const handleDeleteAccount = () => {

    console.log("Eliminar cuenta");

    // FUTURO:
    // await deleteUser()

  };

  return (

    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex flex-col items-center gap-4 mb-8">

        <Avatar
          name={user?.username || "Usuario"} w={60} h={60}
        />

        <h2 className="text-2xl font-bold text-center">

          Hola, {user?.username || "Usuario"} 👋

        </h2>

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <FormUserData />

        <FormUserAddress />

      </div>

      {/* DELETE MODAL */}

      <DeleteAccountModal
        onDelete={handleDeleteAccount}
      />

    </div>

  );

};

export default Profile;