import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
//import { fakeCategories } from '../data/fakeCategories';
import { useModalStore } from '../../../store/useModalStore';
import { useMenuStore } from '../../../store/useMenuStore';

const Categories = () => {
  const [search, setSearch] = useState('');

  const openModal = useModalStore((state) => state.openModal);
  const categories = useMenuStore((state) => state.categories);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Categorías</h1>

        <button className="btn btn-primary" onClick={() => openModal('category')}>
          <Plus size={18} />
          Nueva categoría
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Lista */}
      <div className="overflow-x-auto bg-base-100 rounded-box border">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Disponibilidad</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="font-medium">{category.name}</td>

                  <td>
                    {category.is_active ? (
                      <span className="badge badge-success">Disponible</span>
                    ) : (
                      <span className="badge badge-error">No disponible</span>
                    )}
                  </td>

                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          openModal('category', {
                            category,
                          })
                        }
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-error"
                        onClick={() =>
                          openModal('deleteCategory', {
                            category,
                          })
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-10">
                  <p className="text-base-content/60">No se encontraron categorías.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
