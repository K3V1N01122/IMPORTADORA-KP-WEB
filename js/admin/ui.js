/* =============================================================
   IMPORTADORA KP — PANEL: PIEZAS DE INTERFAZ COMPARTIDAS
   ============================================================= */

const UI = (() => {

  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const I = {
    mas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    lapiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    basura: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arriba: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    abajo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    izq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    der: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    camara: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mover: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ojo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    buscar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  /* Foto del panel: si aún no está en el sitio publicado, se busca en GitHub */
  function foto(ruta, alt = "", clase = "") {
    if (!ruta) return `<div class="p-foto-vacia ${clase}"><img src="img/marca/logo-kp-640.png" alt=""><span>Sin foto</span></div>`;
    const src = Imagenes.url(ruta);
    const respaldo = src.startsWith("data:") || src.startsWith("http") ? "" :
      `onerror="if(!this.dataset.r){this.dataset.r=1;this.src='${esc(GitHub.urlCruda(ruta))}'}"`;
    return `<img class="${clase}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" ${respaldo}>`;
  }

  function aviso(texto, tipo = "ok", ms = 4200) {
    const caja = document.getElementById("avisos");
    const el = document.createElement("div");
    el.className = "aviso aviso--" + tipo;
    el.textContent = texto;
    caja.appendChild(el);
    setTimeout(() => { el.classList.add("aviso--fuera"); setTimeout(() => el.remove(), 400); }, ms);
  }

  function confirmar({ titulo, texto, si = "Aceptar", no = "Cancelar", peligro = false }) {
    const d = document.getElementById("confirmar");
    document.getElementById("confirmarTitulo").textContent = titulo;
    document.getElementById("confirmarTexto").textContent = texto || "";
    const bSi = document.getElementById("confirmarSi");
    bSi.textContent = si;
    bSi.className = "btn " + (peligro ? "btn--peligro" : "btn--oro");
    document.getElementById("confirmarNo").textContent = no;
    d.returnValue = "";
    d.showModal();
    return new Promise(ok => d.addEventListener("close", () => ok(d.returnValue === "si"), { once: true }));
  }

  function precio(v) {
    return Number(v) > 0 ? "Q" + Number(v).toLocaleString("es-GT") : "Precio por confirmar";
  }

  return { esc, I, foto, aviso, confirmar, precio };
})();
