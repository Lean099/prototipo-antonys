const Contact = ()=>{
  const telefono = "+5438651234567"; // formato internacional SIN espacios
  const mensaje = "Hola, quisiera consultar por sus servicios";

  const horarios = [
    { dia: "Lunes", horario: "21:00 - 1:00"},
    { dia: "Martes", horario: "Cerrado"},
    { dia: "Miércoles", horario: "Cerrado"},
    { dia: "Jueves", horario: "21:00 - 1:00"},
    { dia: "Viernes", horario: "21:00 - 1:00"},
    { dia: "Sábado", horario: "21:00 - 1:00"},
    { dia: "Domingo", horario: "21:00 - 1:00"}
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* INFO */}
        <div className="space-y-6">

          <h2 className="text-2xl font-bold">Contacto</h2>

          {/* Dirección */}
          <p><strong>Dirección:</strong> Diego de Villarroel 1819</p>

          {/* Teléfono + botones */}
          <div className="space-y-2">
            <p><strong>Teléfono:</strong> +54 3865 1234567</p>

            <div className="flex gap-2 flex-wrap">

              {/* Llamar */}
              <a
                href={`tel:${telefono}`}
                className="btn btn-sm btn-primary"
              >
                📞 Llamar
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-success"
              >
                💬 WhatsApp
              </a>

            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="font-semibold mb-2">Horarios</h3>

            <div className="space-y-1">
              {horarios.map((h, i) => (
                <div key={i} className="flex justify-between border-b pb-1">
                  <span>{h.dia}</span>
                  <span className={h.horario === "Cerrado" ? "text-red-500" : "text-green-600"}>
                    {h.horario}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nota */}
          <p className="text-sm text-gray-500">
            Nota: Los horarios pueden variar en feriados. Llamanos para confirmar.
          </p>

        </div>

        {/* MAPA */}
        <div className="space-y-3">

          <div className="w-full h-[400px] rounded-xl overflow-hidden shadow">
            <iframe
              title="Ubicación del negocio"
              src="https://www.google.com/maps?q=-27.438862,-65.615019&z=17&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>

          {/* Botón abrir maps */}
          <a
            href="https://www.google.com/maps?q=-27.438862,-65.615019"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline w-full"
          >
            📍 Abrir en Google Maps
          </a>

        </div>

      </div>

    </div>
  );
}

export default Contact;