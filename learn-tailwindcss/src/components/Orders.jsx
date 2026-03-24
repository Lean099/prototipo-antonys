import { useState, useRef } from "react";

const Orders = ()=>{
  const [pedidos, setPedidos] = useState([
    { id: 1, productos: ["Pizza", "Coca Cola"], total: 3500, estado: "pendiente" },
    { id: 2, productos: ["Hamburguesa"], total: 4200, estado: "preparando" },
    { id: 3, productos: ["Empanadas"], total: 2000, estado: "entregado" }
  ]);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const modalRef = useRef(null);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "badge-warning";
      case "preparando": return "badge-info";
      case "entregado": return "badge-success";
      case "cancelado": return "badge-error";
      default: return "badge-neutral";
    }
  };

  const abrirModal = (pedido) => {
    setPedidoSeleccionado(pedido);
    modalRef.current.showModal();
  };

  const confirmarCancelacion = () => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoSeleccionado.id
          ? { ...p, estado: "cancelado" }
          : p
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4">

      <h2 className="text-xl font-bold mb-4">Mis pedidos</h2>

      {/* 🖥️ TABLA */}
      <div className="hidden md:block">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.productos.join(", ")}</td>
                <td>${p.total}</td>

                <td>
                  <span className={`badge ${getEstadoColor(p.estado)}`}>
                    {p.estado}
                  </span>
                </td>

                <td>
                  {p.estado === "pendiente" && (
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => abrirModal(p)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE */}
      <div className="md:hidden space-y-4">
        {pedidos.map((p) => (
          <div key={p.id} className="card bg-base-100 shadow p-4">

            <div className="flex justify-between mb-2">
              <span className="font-bold">Pedido #{p.id}</span>
              <span className={`badge ${getEstadoColor(p.estado)}`}>
                {p.estado}
              </span>
            </div>

            <p><strong>Productos:</strong> {p.productos.join(", ")}</p>
            <p><strong>Total:</strong> ${p.total}</p>

            {p.estado === "pendiente" && (
              <button
                className="btn btn-sm btn-error mt-3"
                onClick={() => abrirModal(p)}
              >
                Cancelar pedido
              </button>
            )}

          </div>
        ))}
      </div>

      {/* 🧩 MODAL */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            ¿Cancelar pedido?
          </h3>

          <p className="py-4">
            Pedido #{pedidoSeleccionado?.id}
          </p>

          <div className="modal-action">

            {/* Cancelar */}
            <form method="dialog">
              <button className="btn">Volver</button>
            </form>

            {/* Confirmar */}
            <button
              className="btn btn-error"
              onClick={confirmarCancelacion}
            >
              Confirmar
            </button>

          </div>
        </div>

        {/* click afuera */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
}

export default Orders;