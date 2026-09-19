import { useModalStore } from '../../../store/useModalStore';
import { useMenuStore } from '../../../store/useMenuStore';

const ProductTable = ({ products }) => {
  const openModal = useModalStore((state) => state.openModal);
  const categories = useMenuStore((state) => state.categories);
  return (
    <div className="overflow-x-auto bg-base-100 rounded-box border">
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Disponible</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>

                <td>{categories.find((cat) => cat.id === product.category_id)?.name || product.category_id}</td>

                <td className="font-semibold">${product.price.toLocaleString()}</td>

                <td>
                  <div className="badge badge-neutral">{product.stock}</div>
                </td>

                <td>
                  <div className={`badge ${product.is_available ? 'badge-success' : 'badge-error'}`}>
                    {product.is_available ? 'Sí' : 'No'}
                  </div>
                </td>

                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() =>
                        openModal('product', {
                          product,
                        })
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-error"
                      onClick={() =>
                        openModal('deleteProduct', {
                          product,
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
              <td colSpan="6" className="text-center py-10">
                <p className="text-base-content/60">No se encontraron productos.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
