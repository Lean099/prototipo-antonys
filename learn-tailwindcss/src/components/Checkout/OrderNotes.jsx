import { useState } from 'react';
import { useCheckoutStore } from '../../store/useCheckoutStore';

const OrderNotes = ({ cart }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [note, setNote] = useState('');

  const orderNotes = useCheckoutStore((state) => state.orderNotes);
  const addOrderNote = useCheckoutStore((state) => state.addOrderNote);
  const removeOrderNote = useCheckoutStore((state) => state.removeOrderNote);

  const personalizedCount = (productId) => orderNotes.filter((item) => item.productId === productId).length;

  const availableProducts = cart.filter((product) => {
    const personalized = personalizedCount(product.id);

    return personalized < product.quantity;
  });

  const selectedProduct = availableProducts.find((item) => item.id === Number(selectedProductId));

  const handleAddNote = () => {
    if (!selectedProduct) return;

    if (!note.trim()) return;

    addOrderNote({
      productId: selectedProduct.id,
      productName: selectedProduct.title,
      quantity: 1,
      note: note.trim(),
    });

    setNote('');

    const remaining = personalizedCount(selectedProduct.id) + 1 < selectedProduct.quantity;

    if (!remaining) {
      setSelectedProductId('');
    }
  };

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-xl mb-4 shadow-inner">
      <input type="checkbox" defaultChecked={orderNotes.length > 0} />

      <div className="collapse-title flex items-center gap-2 font-bold text-lg">
        <span>
          {orderNotes.length > 0
            ? `Productos personalizados (${orderNotes.length})`
            : 'Personalizar productos (opcional)'}
        </span>

        {orderNotes.length > 0 && <div className="badge badge-primary">{orderNotes.length}</div>}
      </div>

      <div className="collapse-content">
        <div className="alert alert-info mb-4">
          <span className="text-sm">
            Cada observación corresponde a una sola unidad del producto. Si compraste varias unidades, podés
            personalizarlas por separado.
          </span>
        </div>

        <label className="label">
          <span className="label-text font-medium">¿Qué producto querés personalizar?</span>
        </label>

        <select
          className="select select-bordered w-full mb-4"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">Seleccionar producto</option>

          {availableProducts.map((product) => {
            const personalized = personalizedCount(product.id);

            return (
              <option key={product.id} value={product.id}>
                {product.title} ({personalized}/{product.quantity} personalizadas)
              </option>
            );
          })}
        </select>

        <label className="label">
          <span className="label-text font-medium">Observación</span>
        </label>

        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Ej: Sin tomate y poco aderezo"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <p className="text-xs opacity-70 mt-2">Ejemplos: Sin tomate, Sin cebolla, Poco aderezo, Sin verduras.</p>

        <button type="button" className="btn btn-primary mt-4" onClick={handleAddNote}>
          Agregar observación
        </button>

        {orderNotes.length > 0 && (
          <>
            <div className="divider my-4" />

            <h3 className="font-semibold mb-2">Productos personalizados</h3>

            <ul className="space-y-2">
              {orderNotes.map((item, index) => (
                <li key={index} className="flex items-center justify-between bg-base-100 rounded-lg px-3 py-2">
                  <span className="text-sm">
                    ✓ <strong>{item.productName}</strong> — {item.note}
                  </span>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeOrderNote(index)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderNotes;
