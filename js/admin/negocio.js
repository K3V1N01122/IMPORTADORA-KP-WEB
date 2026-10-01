/* =============================================================
   IMPORTADORA KP — PANEL: DATOS DEL NEGOCIO
   Teléfono, redes, dirección y horario que usa todo el sitio.
   El logo y los colores de marca NO se editan aquí a propósito.
   ============================================================= */

const Negocio = (() => {

  const CAMPOS = [
    { c: "nombre", t: "Nombre del negocio" },
    { c: "lema", t: "Lema", ayuda: "Aparece en la franja superior del sitio." },
    { c: "whatsapp", t: "WhatsApp (solo números, con 502)", ayuda: "Ej. 50230368005. Es el número al que llegan todos los mensajes.", tipo: "tel" },
    { c: "telefonoVisible", t: "Teléfono como se muestra", ayuda: "Ej. +502 3036-8005" },
    { c: "mensajeWhatsApp", t: "Mensaje inicial de WhatsApp", ayuda: "El texto que aparece escrito cuando alguien toca un botón de WhatsApp general." },
    { c: "instagram", t: "Instagram (sin @)" },
    { c: "facebook", t: "Enlace de Facebook", tipo: "url" },
    { c: "direccion", t: "Dirección del predio", area: true },
    { c: "mapa", t: "Ubicación para el mapa", ayuda: "Coordenadas de Google Maps (ej. 14.652216, -90.429672) o una dirección." },
    { c: "horario", t: "Horario", ayuda: "Déjalo vacío si no quieres mostrarlo." }
  ];

  function pintar() {
    const sec = document.getElementById("secNegocio");
    const cfg = Panel.datos.CONFIG;
    sec.innerHTML = `
      <div class="p-seccion-cabeza">
        <div>
          <h2>Datos del negocio</h2>
          <p class="p-ayuda">Se usan en el encabezado, el pie de página, los botones de WhatsApp y la sección de contacto.</p>
        </div>
      </div>
      <form class="p-tarjeta p-negocio" id="formNegocio" novalidate>
        ${CAMPOS.map(f => `
          <div class="campo">
            <label for="n_${f.c}">${f.t}</label>
            ${f.area
              ? `<textarea id="n_${f.c}" data-c="${f.c}" rows="2">${UI.esc(cfg[f.c] || "")}</textarea>`
              : `<input id="n_${f.c}" data-c="${f.c}" type="${f.tipo || "text"}" value="${UI.esc(cfg[f.c] || "")}">`}
            ${f.ayuda ? `<small class="campo__ayuda">${f.ayuda}</small>` : ""}
          </div>`).join("")}
        <div class="p-negocio__prueba">
          <a class="btn btn--wa" id="probarWa" target="_blank" rel="noopener">Probar enlace de WhatsApp</a>
        </div>
      </form>`;

    const form = sec.querySelector("#formNegocio");
    const probar = sec.querySelector("#probarWa");
    const actualizarPrueba = () => {
      probar.href = `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(cfg.mensajeWhatsApp || "")}`;
    };
    actualizarPrueba();
    form.addEventListener("input", e => {
      const c = e.target.dataset.c;
      if (!c) return;
      let val = e.target.value;
      if (c === "whatsapp") val = val.replace(/\D/g, "");
      if (c === "instagram") val = val.replace(/^@/, "").trim();
      cfg[c] = val;
      actualizarPrueba();
      Panel.cambio();
    });
  }

  return { pintar };
})();
