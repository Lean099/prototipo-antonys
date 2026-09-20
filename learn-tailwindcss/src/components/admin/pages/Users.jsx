import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useModalStore } from '../../../store/useModalStore';
import axios from 'axios';

const Users = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  // Filtros
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(false);

  const openModal = useModalStore((state) => state.openModal);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/user/getAllUsers`, {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          role: role || undefined,
          is_active: isActive !== '' ? isActive : undefined,
          sort_order: sortOrder,
        },
      });

      setUsers(res.data.items);
      setTotalPages(res.data.total_pages);
      setTotalUsers(res.data.total);
    } catch (error) {
      console.error('Error fetching users:', error);

      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuarios cuando cambian
  // la página, búsqueda o filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, search, role, isActive, sortOrder]);

  // Cuando cambia la búsqueda,
  // volvemos a la primera página
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Cuando cambia el rol,
  // volvemos a la primera página
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  // Cuando cambia el estado,
  // volvemos a la primera página
  const handleActiveChange = (e) => {
    setIsActive(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  // Generar botones de paginación
  const getPaginationPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    // Cerca del principio
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    // Cerca del final
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // En el medio
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const paginationPages = getPaginationPages();

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>

          <p className="text-sm text-base-content/60 mt-1">
            {totalUsers} usuario{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            openModal('user', {
              onSuccess: fetchUsers,
            })
          }
        >
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
          onChange={handleSearchChange}
          placeholder="Buscar por usuario, email o teléfono..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filtro por rol */}
        <select value={role} onChange={handleRoleChange} className="select select-bordered w-full sm:w-auto">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="employee">Empleado</option>
          <option value="customer">Cliente</option>
        </select>

        {/* Filtro por disponibilidad */}
        <select value={isActive} onChange={handleActiveChange} className="select select-bordered w-full sm:w-auto">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Filtro por orden */}
        <select value={sortOrder} onChange={handleSortChange} className="select select-bordered w-full sm:w-auto">
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-base-100 rounded-box border">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Disponibilidad</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  <span className="loading loading-spinner loading-md"></span>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  {/* Usuario */}
                  <td className="font-medium">{user.username}</td>

                  {/* Email */}
                  <td>{user.email}</td>

                  {/* Teléfono */}
                  <td>{user.phone || '-'}</td>

                  {/* Rol */}
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
                      {user.role === 'admin' ? 'Administrador' : user.role === 'employee' ? 'Empleado' : 'Cliente'}
                    </span>
                  </td>

                  {/* Disponibilidad */}
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          openModal('user', {
                            user,
                            onSuccess: fetchUsers,
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
                <td colSpan="6" className="text-center py-10">
                  <p className="text-base-content/60">No se encontraron usuarios.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-wrap justify-center items-center gap-2">
        {/* Anterior */}
        <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>

        {/* Números */}
        {paginationPages.map((pageNumber, index) =>
          pageNumber === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-base-content/60">
              ...
            </span>
          ) : (
            <button
              key={pageNumber}
              className={`btn btn-sm ${page === pageNumber ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ),
        )}

        {/* Siguiente */}
        <button className="btn btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Users;
