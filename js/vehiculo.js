/* =============================================================
   IMPORTADORA KP — DETALLE DE VEHÍCULO
   Se abre como vehiculo.html?id=toyota-raize-2022
   ============================================================= */

const FLECHA_IZQ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FLECHA_DER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  const v = todosLosVehiculos().find(x => x.id === id);
  const main = document.getElementById("contenido");

  if (!v) {
    main.innerHTML = `
    <div class="contenedor no-encontrado">
      <h1>Este vehículo ya no está publicado</h1>
      <p>Puede que ya se haya vendido o que el enlace esté incompleto. Revisa el catálogo para ver lo que tenemos ahora.</p>
      <a class="btn btn--oro" href="catalogo.html">Ver catálogo</a>
    </div>`;
    return;
  }

  const esProximo = v.estado === "proximamente";
  const nombre = nombreVehiculo(v);
  const nombreCompleto = `${nombre} ${v.anio}`;
  document.title = `${nombreCompleto} | Importadora KP`;
  document.querySelector('meta[name="description"]').content =
    `${nombreCompleto}${Number(v.precio) > 0 ? " por " + formatoPrecio(v.precio) : ""}. ${esProximo ? "Próximo a ingresar" : "Disponible"} en Importadora KP, Guatemala.`;

  // Marca la opción correcta del menú
  document.querySelectorAll(".nav ul a").forEach(a => {
    const href = a.getAttribute("href");
    const coincide = esProximo ? href === "catalogo.html?ver=proximamente" : href === "catalogo.html";
    if (coincide) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  const fotos = [v.foto, ...(v.fotos || [])].filter(Boolean);
  const specs = [
    ["Marca", v.marca],
    ["Modelo", [v.modelo, v.version].filter(Boolean).join(" ")],
    ["Año", v.anio],
    ["Tipo", v.tipo],
    ["Kilometraje", formatoKm(v.km)],
    ["Transmisión", v.transmision],
    ["Combustible", v.combustible],
    ["Motor", v.motor],
    ["Tracción", v.traccion],
    ["Color", v.color],
    esProximo ? ["Llegada estimada", v.llegada] : null
  ].filter(s => s && s[1] !== "" && s[1] !== undefined && s[1] !== null);

  const msjInteres = esProximo
    ? `Hola, me interesa el ${nombreCompleto} que está por ingresar. ¿Cuándo llega y cómo puedo apartarlo?`
    : `Hola, me interesa el ${nombreCompleto} (${formatoPrecio(v.precio)}). ¿Sigue disponible?`;
  const msjVisita = `Hola, quiero agendar una visita al predio para ver el ${nombreCompleto}.`;

  const lista = esProximo ? PROXIMAMENTE : CATALOGO;
  const relacionados = lista.filter(x => x.id !== v.id).slice(0, 3).map(x => ({ ...x, estado: v.estado }));

  main.innerHTML = `
  <div class="contenedor">
    <nav class="migas migas--claro" aria-label="Ruta">
      <a href="index.html">Inicio</a> /
      <a href="${esProximo ? "catalogo.html?ver=proximamente" : "catalogo.html"}">${esProximo ? "Próximamente" : "Disponibles"}</a> /
      <span>${escapar(nombreCompleto)}</span>
    </nav>

    <div class="detalle">
      <div>
        <div class="galeria">
          <div class="galeria__principal" id="galeriaPrincipal">
            ${htmlFoto(fotos[0], nombreCompleto)}
            ${fotos.length > 1 ? `
              <button class="galeria__nav galeria__nav--ant" id="fotoAnt" aria-label="Foto anterior">${FLECHA_IZQ}</button>
              <button class="galeria__nav galeria__nav--sig" id="fotoSig" aria-label="Foto siguiente">${FLECHA_DER}</button>` : ""}
          </div>
          ${fotos.length > 1 ? `
          <div class="galeria__miniaturas" id="miniaturas">
            ${fotos.map((f, i) => `<button class="galeria__miniatura" data-i="${i}" aria-label="Ver foto ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}>${htmlFoto(f, "")}</button>`).join("")}
          </div>` : ""}
        </div>

        ${specs.length ? `
        <section class="fichatecnica" aria-labelledby="tituloFicha">
          <h2 id="tituloFicha">Ficha técnica</h2>
          <dl>${specs.map(([k, val]) => `<div><dt>${k}</dt><dd>${escapar(val)}</dd></div>`).join("")}</dl>
          ${v.descripcion ? `<p class="fichatecnica__texto">${escapar(v.descripcion)}</p>` : ""}
        </section>` : ""}
      </div>

      <aside class="resumen" aria-label="Resumen y contacto">
        <span class="resumen__estado${esProximo ? " resumen__estado--proximo" : ""}">${esProximo ? (v.llegada ? "Llega " + escapar(v.llegada) : "Próximamente") : "Disponible"}</span>
        <p class="resumen__marca">${escapar(v.marca)}${v.tipo ? " / " + escapar(v.tipo) : ""}</p>
        <h1>${escapar([v.modelo, v.version].filter(Boolean).join(" "))} <span>${v.anio}</span></h1>
        <p class="resumen__precio${Number(v.precio) > 0 ? "" : " resumen__precio--pendiente"}">${formatoPrecio(v.precio)}</p>
        <div class="resumen__botones">
          <a class="btn btn--wa" href="${linkWhatsApp(msjInteres)}" target="_blank" rel="noopener">${ICONOS.whatsapp}${esProximo ? "Quiero apartarlo" : "Preguntar por WhatsApp"}</a>
          ${esProximo ? "" : `<a class="btn btn--linea" href="${linkWhatsApp(msjVisita)}" target="_blank" rel="noopener">Agendar visita al predio</a>`}
        </div>
        <p class="resumen__nota">${esProximo
          ? "Este vehículo aún está en camino. Fotos, precio y fecha pueden cambiar antes de su llegada."
          : "Predio en " + escapar(CONFIG.direccion) + "."}</p>
      </aside>
    </div>
  </div>

  ${relacionados.length ? `
  <section class="seccion seccion--blanca" aria-labelledby="tituloRelacionados">
    <div class="contenedor">
      <div class="seccion__cabeza">
        <h2 class="seccion__titulo" id="tituloRelacionados">${esProximo ? "También vienen en camino" : "Otros disponibles"}</h2>
        <a class="enlace-flecha" href="${esProximo ? "catalogo.html?ver=proximamente" : "catalogo.html"}">Ver todos</a>
      </div>
      <div class="rejilla">${relacionados.map(htmlFicha).join("")}</div>
    </div>
  </section>` : ""}`;

  if (fotos.length > 1) activarGaleria(fotos, nombreCompleto);
});

function activarGaleria(fotos, alt) {
  const principal = document.getElementById("galeriaPrincipal");
  const miniaturas = [...document.querySelectorAll(".galeria__miniatura")];
  let actual = 0;

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    const actualEl = principal.querySelector("img, .foto-vacia");
    const nuevo = document.createElement("div");
    nuevo.innerHTML = htmlFoto(fotos[actual], alt);
    actualEl.replaceWith(nuevo.firstElementChild);
    miniaturas.forEach((m, j) => m.toggleAttribute("aria-current", j === actual));
    if (miniaturas[actual]) miniaturas[actual].setAttribute("aria-current", "true");
  }

  miniaturas.forEach(m => m.addEventListener("click", () => mostrar(Number(m.dataset.i))));
  document.getElementById("fotoAnt").addEventListener("click", () => mostrar(actual - 1));
  document.getElementById("fotoSig").addEventListener("click", () => mostrar(actual + 1));

  let inicioX = null;
  principal.addEventListener("touchstart", e => { inicioX = e.touches[0].clientX; }, { passive: true });
  principal.addEventListener("touchend", e => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(dx) > 40) mostrar(actual + (dx < 0 ? 1 : -1));
    inicioX = null;
  });
}
