/* =============================================================
   IMPORTADORA KP — FUNCIONES COMPARTIDAS
   Encabezado, pie de página, botón de WhatsApp y fichas de
   vehículos. Lo usan todas las páginas.
   ============================================================= */

const ICONOS = {
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.23-4.25 9.48-9.47 9.48zm8.06-17.54A11.33 11.33 0 0 0 12.04.62C5.76.62.65 5.73.65 12.01c0 2.01.52 3.97 1.52 5.69L.55 23.6l6.04-1.58a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.06z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8z"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21.5v-8.2h2.8l.4-3.2h-3.2V8.05c0-.93.26-1.56 1.6-1.56h1.7V3.63A22.6 22.6 0 0 0 14.3 3.5c-2.45 0-4.13 1.5-4.13 4.24v2.36H7.4v3.2h2.77v8.2h3.33z"/></svg>',
  ubicacion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M12 21.5s-7-6.1-7-11.6a7 7 0 0 1 14 0c0 5.5-7 11.6-7 11.6z"/><circle cx="12" cy="9.8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  telefono: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 3.5h3.3l1.6 4.2-2.1 1.3a11 11 0 0 0 5.2 5.2l1.3-2.1 4.2 1.6V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/></svg>',
  reloj: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.3V12l3.2 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  // Silueta de sedán (se usa cuando falta una foto)
  sedan: '<svg viewBox="0 0 120 44" aria-hidden="true"><path fill="currentColor" d="M8 30.5c0-3 1.6-5 4.6-5.6l12.8-2.5 12.9-8.3c2.5-1.6 5.3-2.4 8.2-2.4h21.2c3.4 0 6.6 1.3 9.1 3.6l7.9 7.4 16.2 2.3c4 .6 6.9 3.9 6.9 7.9v3.6c0 1.4-1.1 2.5-2.5 2.5h-6.2a9.6 9.6 0 0 0-18.9 0H39.5a9.6 9.6 0 0 0-18.9 0H10.5C9.1 39 8 37.9 8 36.5v-6zm38.6-15.3l-10.1 7h22.8v-8.1h-9.2c-1.3 0-2.5.4-3.5 1.1zm16.1-1.1v8.1h19.8l-5.6-5.4a8 8 0 0 0-5.6-2.7h-8.6z"/><circle cx="30" cy="39" r="6.6" fill="currentColor"/><circle cx="92.2" cy="39" r="6.6" fill="currentColor"/></svg>'
};

/* ---------- Utilidades ---------- */

function formatoPrecio(v) {
  if (!v || Number(v) <= 0) return "Precio por confirmar";
  return "Q" + Number(v).toLocaleString("es-GT", { maximumFractionDigits: 0 });
}

function formatoKm(km) {
  if (km === "" || km === null || km === undefined) return "";
  return Number(km).toLocaleString("es-GT") + " km";
}

function linkWhatsApp(mensaje) {
  const texto = encodeURIComponent(mensaje || CONFIG.mensajeWhatsApp);
  return `https://wa.me/${CONFIG.whatsapp}?text=${texto}`;
}

function nombreVehiculo(v) {
  return [v.marca, v.modelo, v.version].filter(Boolean).join(" ");
}

function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function todosLosVehiculos() {
  return [
    ...CATALOGO.map(v => ({ ...v, estado: "disponible" })),
    ...PROXIMAMENTE.map(v => ({ ...v, estado: "proximamente" }))
  ];
}

/* Foto con respaldo: si la imagen no carga, se muestra la silueta */
function htmlFoto(src, alt, clase = "") {
  if (!src) return `<div class="foto-vacia ${clase}">${ICONOS.sedan}<span>Fotos pronto</span></div>`;
  return `<img class="${clase}" src="${escapar(src)}" alt="${escapar(alt)}" loading="lazy" onerror="fotoFallida(this)">`;
}

function fotoFallida(img) {
  const caja = document.createElement("div");
  caja.className = "foto-vacia " + img.className;
  caja.innerHTML = ICONOS.sedan + "<span>Fotos pronto</span>";
  img.replaceWith(caja);
}

/* ---------- Ficha de vehículo (se usa en inicio y catálogo) ---------- */

function htmlFicha(v) {
  const nombre = nombreVehiculo(v);
  const esProximo = v.estado === "proximamente";
  const datos = [formatoKm(v.km), v.transmision, v.combustible].filter(Boolean);
  const mensaje = esProximo
    ? `Hola, me interesa el ${nombre} ${v.anio} que está por ingresar. ¿Me pueden dar más información?`
    : `Hola, me interesa el ${nombre} ${v.anio} (${formatoPrecio(v.precio)}). ¿Sigue disponible?`;

  return `
  <article class="ficha${esProximo ? " ficha--proximo" : ""}">
    <a class="ficha__foto" href="vehiculo.html?id=${encodeURIComponent(v.id)}" aria-label="Ver ${escapar(nombre)} ${v.anio}">
      ${htmlFoto(v.foto, `${nombre} ${v.anio}`)}
      <span class="ficha__estado">${esProximo ? (v.llegada ? "Llega " + escapar(v.llegada) : "Próximamente") : "Disponible"}</span>
    </a>
    <div class="ficha__cuerpo">
      <p class="ficha__marca">${escapar(v.marca)}${v.tipo ? " / " + escapar(v.tipo) : ""}</p>
      <h3 class="ficha__nombre"><a href="vehiculo.html?id=${encodeURIComponent(v.id)}">${escapar([v.modelo, v.version].filter(Boolean).join(" "))} <span>${v.anio}</span></a></h3>
      ${datos.length ? `<ul class="ficha__datos">${datos.map(d => `<li>${escapar(d)}</li>`).join("")}</ul>` : ""}
      <p class="ficha__precio${Number(v.precio) > 0 ? "" : " ficha__precio--pendiente"}">${formatoPrecio(v.precio)}</p>
      <div class="ficha__acciones">
        <a class="btn btn--linea" href="vehiculo.html?id=${encodeURIComponent(v.id)}">Ver detalles</a>
        <a class="btn btn--wa btn--icono" href="${linkWhatsApp(mensaje)}" target="_blank" rel="noopener" aria-label="Preguntar por WhatsApp">${ICONOS.whatsapp}</a>
      </div>
    </div>
  </article>`;
}

/* ---------- Logo ---------- */

function htmlLogo() {
  return `
  <a class="logo" href="index.html" aria-label="${escapar(CONFIG.nombre)}, ir al inicio">
    <img src="${escapar(CONFIG.logo)}" alt="${escapar(CONFIG.nombre)}" onerror="this.parentElement.classList.add('logo--texto'); this.remove();">
    <span class="logo__texto">Importadora <b>KP</b></span>
  </a>`;
}

/* ---------- Redes ---------- */

function htmlRedes(clase = "redes") {
  const items = [
    `<a href="${linkWhatsApp()}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONOS.whatsapp}</a>`,
    CONFIG.instagram ? `<a href="https://www.instagram.com/${escapar(CONFIG.instagram)}/" target="_blank" rel="noopener" aria-label="Instagram">${ICONOS.instagram}</a>` : "",
    CONFIG.facebook ? `<a href="${escapar(CONFIG.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICONOS.facebook}</a>` : ""
  ];
  return `<div class="${clase}">${items.join("")}</div>`;
}

/* ---------- Encabezado ---------- */

function pintarEncabezado() {
  const destino = document.getElementById("encabezado");
  if (!destino) return;
  const pagina = document.body.dataset.pagina;

  const enlaces = [
    { href: "index.html", texto: "Inicio", id: "inicio" },
    { href: "catalogo.html", texto: "Disponibles", id: "catalogo" },
    { href: "catalogo.html?ver=proximamente", texto: "Próximamente", id: "proximamente" },
    { href: "index.html#servicios", texto: "Servicios", id: "servicios" },
    { href: "index.html#contacto", texto: "Contacto", id: "contacto" }
  ];

  const vistaActual = new URLSearchParams(location.search).get("ver");
  const activo = pagina === "catalogo" ? (vistaActual === "proximamente" ? "proximamente" : "catalogo") : pagina;

  destino.innerHTML = `
  <div class="franja">
    <div class="contenedor franja__fila">
      <a class="franja__dato" href="${linkWhatsApp()}" target="_blank" rel="noopener">${ICONOS.telefono}<span>${escapar(CONFIG.telefonoVisible)}</span></a>
      <a class="franja__dato franja__dato--dir" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapa)}" target="_blank" rel="noopener">${ICONOS.ubicacion}<span>Km 10.8 Ruta al Atlántico, Zona 18</span></a>
      ${htmlRedes("redes redes--franja")}
    </div>
  </div>
  <div class="barra">
    <div class="contenedor barra__fila">
      ${htmlLogo()}
      <nav class="nav" id="nav" aria-label="Principal">
        <ul>
          ${enlaces.map(e => `<li><a href="${e.href}"${e.id === activo ? ' aria-current="page"' : ""}>${e.texto}</a></li>`).join("")}
        </ul>
        <a class="btn btn--oro nav__cta" href="${linkWhatsApp()}" target="_blank" rel="noopener">${ICONOS.whatsapp}Escríbenos</a>
      </nav>
      <button class="barra__menu" id="botonMenu" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">${ICONOS.menu}</button>
    </div>
  </div>`;

  const boton = document.getElementById("botonMenu");
  const nav = document.getElementById("nav");
  boton.addEventListener("click", () => {
    const abierto = nav.classList.toggle("nav--abierto");
    boton.setAttribute("aria-expanded", abierto);
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    boton.innerHTML = abierto ? ICONOS.cerrar : ICONOS.menu;
    document.body.classList.toggle("sin-scroll", abierto);
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    if (nav.classList.contains("nav--abierto")) boton.click();
  }));
}

/* ---------- Pie de página ---------- */

function pintarPie() {
  const destino = document.getElementById("pie");
  if (!destino) return;
  const anio = new Date().getFullYear();
  destino.innerHTML = `
  <div class="contenedor pie__rejilla">
    <div class="pie__marca">
      ${htmlLogo()}
      <p>Importamos, reparamos y vendemos vehículos de Estados Unidos. También traemos autos por pedido y recibimos vehículos a consignación.</p>
      ${htmlRedes("redes redes--pie")}
    </div>
    <div>
      <h2 class="pie__titulo">Vehículos</h2>
      <ul class="pie__lista">
        <li><a href="catalogo.html">Disponibles</a></li>
        <li><a href="catalogo.html?ver=proximamente">Próximos a ingresar</a></li>
        <li><a href="${linkWhatsApp("Hola, quiero cotizar un vehículo por pedido.")}" target="_blank" rel="noopener">Pedidos a la medida</a></li>
        <li><a href="${linkWhatsApp("Hola, quiero consignar mi vehículo en su predio.")}" target="_blank" rel="noopener">Consignar mi vehículo</a></li>
      </ul>
    </div>
    <div>
      <h2 class="pie__titulo">Visítanos</h2>
      <ul class="pie__lista pie__lista--iconos">
        <li>${ICONOS.ubicacion}<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapa)}" target="_blank" rel="noopener">${escapar(CONFIG.direccion)}</a></li>
        <li>${ICONOS.telefono}<a href="${linkWhatsApp()}" target="_blank" rel="noopener">${escapar(CONFIG.telefonoVisible)}</a></li>
        ${CONFIG.horario ? `<li>${ICONOS.reloj}<span>${escapar(CONFIG.horario)}</span></li>` : ""}
      </ul>
    </div>
  </div>
  <div class="contenedor pie__legal">
    <p>© ${anio} ${escapar(CONFIG.nombre)}. Guatemala.</p>
    <p>Las fotos, precios y disponibilidad pueden cambiar sin previo aviso.</p>
  </div>`;
}

/* ---------- Botón flotante de WhatsApp ---------- */

function pintarBotonFlotante() {
  const a = document.createElement("a");
  a.className = "wa-flotante";
  a.href = linkWhatsApp();
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Escríbenos por WhatsApp");
  a.innerHTML = ICONOS.whatsapp;
  document.body.appendChild(a);
}

document.addEventListener("DOMContentLoaded", () => {
  pintarEncabezado();
  pintarPie();
  pintarBotonFlotante();
});
