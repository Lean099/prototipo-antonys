import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { fakeUsers } from '../data/fakeUsers';
import { useModalStore } from '../../../store/useModalStore';

const Users = () => {
  const [search, setSearch] = useState('');

  const openModal = useModalStore((state) => state.openModal);

  const filteredUsers = fakeUsers.filter((user) => {
    const searchTerm = search.toLowerCase();

    return user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Usuarios</h1>

        <button className="btn btn-primary" onClick={() => openModal('user')}>
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por usuario o email..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-base-100 rounded-box border">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.username}</td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`badge ${
                        user.role === 'admin'
                          ? 'badge-primary'
                          : user.role === 'employee'
                            ? 'badge-warning'
                            : 'badge-neutral'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          openModal('user', {
                            user,
                          })
                        }
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-10">
                  <p className="text-base-content/60">No se encontraron usuarios.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
