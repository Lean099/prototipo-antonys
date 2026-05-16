import { useBackendStatusStore } from "../store/useBackendStatusStore"

const BackendAlert = () => {

  const {
    status,
    visible,
    closeAlert,
  } = useBackendStatusStore()

  if (!visible) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-lg">

      {/* CHECKING */}

      {status === "checking" && (
        <div className="alert alert-info shadow-lg">

          <span className="loading loading-spinner loading-sm"></span>

          <div>
            <h3 className="font-bold">
              Verificando conexión
            </h3>

            <div className="text-xs">
              Comprobando estado del backend...
            </div>
          </div>

        </div>
      )}

      {/* OFFLINE */}

      {status === "offline" && (
        <div className="alert alert-warning shadow-lg flex items-center justify-between">

          <div className="flex items-center gap-3">

            <span className="loading loading-spinner loading-md"></span>

            <div>
              <h3 className="font-bold">
                Conexión con el servidor no disponible
              </h3>

              <div className="text-xs">
                El backend puede estar iniciándose,
                reiniciándose o despertando en Render.
                La aplicación intentará reconectarse
                automáticamente. Esto puede tardar entre 30 y 60 segundos.
              </div>
            </div>

          </div>

          <button
            className="btn btn-circle btn-xs"
            onClick={closeAlert}
          >
            ✕
          </button>

        </div>
      )}

      {/* ONLINE */}

      {status === "online" && (
        <div className="alert alert-success shadow-lg flex justify-between items-center">

          <div>
            <h3 className="font-bold">
              Servidor conectado
            </h3>

            <div className="text-xs">
              La aplicación está funcionando correctamente.
            </div>
          </div>

          <button
            className="btn btn-circle btn-xs"
            onClick={closeAlert}
          >
            ✕
          </button>

        </div>
      )}

    </div>
  )
}

export default BackendAlert