import { useModalStore } from '../../../store/useModalStore';

const ProductTable = ({ products }) => {
  const openModal = useModalStore((state) => state.openModal);
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
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>

              <td>{product.category}</td>

              <td className="font-semibold">${product.price.toLocaleString()}</td>

              <td>
                <div className="badge badge-neutral">{product.stock}</div>
              </td>

              <td>
                <div className={`badge ${product.isAvailable ? 'badge-success' : 'badge-error'}`}>
                  {product.isAvailable ? 'Sí' : 'No'}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
