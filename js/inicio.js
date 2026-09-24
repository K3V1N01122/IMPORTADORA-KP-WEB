/* =============================================================
   IMPORTADORA KP — PÁGINA DE INICIO
   ============================================================= */

const DURACION_DIAPOSITIVA = 6000; // milisegundos que dura cada foto (6000 = 6 segundos)

document.addEventListener("DOMContentLoaded", () => {
  pintarPortada();
  pintarCarrusel("pistaDisponibles", CATALOGO.map(v => ({ ...v, estado: "disponible" })), {
    titulo: "Estamos preparando nuevos vehículos",
    texto: "Pronto tendremos unidades disponibles. Mientras tanto, revisa lo que viene en camino o haz tu pedido.",
    boton: `<a class="btn btn--linea" href="catalogo.html?ver=proximamente">Ver próximos</a>`
  });
  pintarCarrusel("pistaProximos", PROXIMAMENTE.map(v => ({ ...v, estado: "proximamente" })), {
    titulo: "Nuevos ingresos en camino",
    texto: "Escríbenos y te avisamos en cuanto confirmemos las próximas unidades.",
    boton: `<a class="btn btn--oro" href="${linkWhatsApp("Hola, quiero que me avisen cuando lleguen nuevos vehículos.")}" target="_blank" rel="noopener">Avísame por WhatsApp</a>`
  });
  pintarContacto();
  document.getElementById("servicioPedido").href = linkWhatsApp("Hola, quiero cotizar un vehículo por pedido.");
  document.getElementById("servicioConsigna").href = linkWhatsApp("Hola, quiero consignar mi vehículo en su predio.");
});

/* ---------- Portada ---------- */

function pintarPortada() {
  const seccion = document.getElementById("portada");
  const pista = document.getElementById("portadaPista");
  const puntos = document.getElementById("portadaPuntos");
  const contador = document.getElementById("portadaContador");
  const diapositivas = CONFIG.portada || [];
  if (!diapositivas.length) { seccion.remove(); return; }

  seccion.style.setProperty("--duracion", DURACION_DIAPOSITIVA + "ms");

  pista.innerHTML = diapositivas.map((d, i) => {
    const Etiqueta = i === 0 ? "h1" : "h2";
    const destino = d.whatsapp
      ? `href="${linkWhatsApp(d.whatsapp)}" target="_blank" rel="noopener"`
      : `href="${escapar(d.link || "catalogo.html")}"`;
    const secundario = i === 0
      ? `<a class="btn btn--cromo" href="catalogo.html?ver=proximamente">Ver próximos a ingresar</a>`
      : `<a class="btn btn--cromo" href="catalogo.html">Ver disponibles</a>`;
    return `
    <div class="diapositiva${i === 0 ? " es-activa" : ""}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${diapositivas.length}"${i === 0 ? "" : ' aria-hidden="true"'}>
      <div class="diapositiva__fondo">${htmlFoto(d.foto, "", "")}</div>
      <div class="contenedor diapositiva__texto">
        <${Etiqueta}>${escapar(d.titulo)}</${Etiqueta}>
        <p>${escapar(d.texto)}</p>
        <div class="diapositiva__botones">
          <a class="btn btn--oro" ${destino}>${escapar(d.boton)}</a>
          ${secundario}
        </div>
      </div>
    </div>`;
  }).join("");

  // La primera foto carga de inmediato
  const primera = pista.querySelector("img");
  if (primera) primera.loading = "eager";

  const controles = seccion.querySelector(".portada__controles");
  if (diapositivas.length < 2) { controles.remove(); return; }

  puntos.innerHTML = diapositivas.map((_, i) =>
    `<button class="portada__punto${i === 0 ? " es-activo" : ""}" aria-label="Ir a la diapositiva ${i + 1}"><span></span></button>`
  ).join("");

  const items = [...pista.querySelectorAll(".diapositiva")];
  const botones = [...puntos.querySelectorAll(".portada__punto")];
  let actual = 0;
  let temporizador = null;

  function ir(n, direccion = 1) {
    const siguiente = (n + items.length) % items.length;
    if (siguiente === actual) return;
    const saliente = items[actual];
    const entrante = items[siguiente];

    // Acomoda las fotos que esperan (sin animación) en el lado correcto
    const enEspera = items.filter(it => it !== saliente);
    enEspera.forEach(it => { it.style.transition = "none"; it.classList.remove("es-saliente", "es-activa"); });
    seccion.classList.toggle("portada--atras", direccion < 0);
    void seccion.offsetWidth;
    enEspera.forEach(it => { it.style.transition = ""; });

    saliente.classList.remove("es-activa");
    saliente.classList.add("es-saliente");
    saliente.setAttribute("aria-hidden", "true");
    entrante.classList.add("es-activa");
    entrante.removeAttribute("aria-hidden");

    botones[actual].classList.remove("es-activo");
    actual = siguiente;
    // reinicia la animación de la barra
    const b = botones[actual];
    b.classList.remove("es-activo"); void b.offsetWidth; b.classList.add("es-activo");
    contador.textContent = `${actual + 1} / ${items.length}`;
    programar();
  }

  function programar() {
    clearTimeout(temporizador);
    if (seccion.classList.contains("en-pausa")) return;
    temporizador = setTimeout(() => ir(actual + 1), DURACION_DIAPOSITIVA);
  }

  function pausar(p) {
    seccion.classList.toggle("en-pausa", p);
    if (p) clearTimeout(temporizador); else programar();
  }

  botones.forEach((b, i) => b.addEventListener("click", () => ir(i, i < actual ? -1 : 1)));
  document.getElementById("portadaAnterior").addEventListener("click", () => ir(actual - 1, -1));
  document.getElementById("portadaSiguiente").addEventListener("click", () => ir(actual + 1));
  // Solo se pausa mientras alguien usa el teclado dentro de la portada
  seccion.addEventListener("focusin", e => { if (e.target.matches(":focus-visible")) pausar(true); });
  seccion.addEventListener("focusout", () => pausar(false));

  // Deslizar con el dedo en celular
  let inicioX = null;
  pista.addEventListener("touchstart", e => { inicioX = e.touches[0].clientX; }, { passive: true });
  pista.addEventListener("touchend", e => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(dx) > 50) ir(actual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    inicioX = null;
  });

  contador.textContent = `1 / ${items.length}`;
  programar();
}

/* ---------- Carruseles de fichas ---------- */

function pintarCarrusel(idPista, vehiculos, vacio) {
  const pista = document.getElementById(idPista);
  const flechas = document.querySelector(`[data-carrusel="${idPista}"]`);

  if (!vehiculos.length) {
    pista.classList.remove("carrusel__pista");
    pista.innerHTML = `<div class="vacio"><h3>${vacio.titulo}</h3><p>${vacio.texto}</p>${vacio.boton}</div>`;
    flechas.remove();
    return;
  }

  pista.innerHTML = vehiculos.map(htmlFicha).join("");

  flechas.innerHTML = `
    <button class="carrusel__flecha" data-dir="-1" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button class="carrusel__flecha" data-dir="1" aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;

  const [anterior, siguiente] = flechas.querySelectorAll("button");

  function actualizar() {
    const max = pista.scrollWidth - pista.clientWidth - 2;
    anterior.disabled = pista.scrollLeft <= 2;
    siguiente.disabled = pista.scrollLeft >= max;
    flechas.hidden = max <= 0;
  }

  flechas.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const ficha = pista.firstElementChild;
    const paso = ficha.getBoundingClientRect().width + 20;
    pista.scrollBy({ left: paso * Number(b.dataset.dir), behavior: "smooth" });
  });
  pista.addEventListener("scroll", actualizar, { passive: true });
  window.addEventListener("resize", actualizar);
  actualizar();
}

/* ---------- Contacto ---------- */

function pintarContacto() {
  const lista = document.getElementById("contactoLista");
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapa)}`;

  const filas = [
    { icono: ICONOS.whatsapp, rotulo: "WhatsApp", html: `<a href="${linkWhatsApp()}" target="_blank" rel="noopener">${escapar(CONFIG.telefonoVisible)}</a>` },
    { icono: ICONOS.ubicacion, rotulo: "Predio", html: `<a href="${mapsLink}" target="_blank" rel="noopener">${escapar(CONFIG.direccion)}</a>` },
    CONFIG.horario ? { icono: ICONOS.reloj, rotulo: "Horario", html: `<span>${escapar(CONFIG.horario)}</span>` } : null,
    CONFIG.instagram ? { icono: ICONOS.instagram, rotulo: "Instagram", html: `<a href="https://www.instagram.com/${escapar(CONFIG.instagram)}/" target="_blank" rel="noopener">@${escapar(CONFIG.instagram)}</a>` } : null,
    CONFIG.facebook ? { icono: ICONOS.facebook, rotulo: "Facebook", html: `<a href="${escapar(CONFIG.facebook)}" target="_blank" rel="noopener">${escapar(CONFIG.nombre)}</a>` } : null
  ].filter(Boolean);

  lista.innerHTML = filas.map(f =>
    `<li><span class="contacto__icono">${f.icono}</span><div><strong>${f.rotulo}</strong>${f.html}</div></li>`
  ).join("");

  document.getElementById("contactoMapa").innerHTML =
    `<iframe title="Mapa de ubicación de ${escapar(CONFIG.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapa)}&output=embed"></iframe>`;

  // Opciones del formulario
  const select = document.getElementById("fInteres");
  const opciones = [
    "Información general",
    ...CATALOGO.map(v => `${nombreVehiculo(v)} ${v.anio}`),
    ...PROXIMAMENTE.map(v => `${nombreVehiculo(v)} ${v.anio} (próximamente)`),
    "Pedir un vehículo por pedido",
    "Consignar mi vehículo"
  ];
  select.innerHTML = opciones.map(o => `<option>${escapar(o)}</option>`).join("");

  const form = document.getElementById("formContacto");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const error = document.getElementById("eNombre");
    if (!nombre) {
      error.textContent = "Escribe tu nombre para poder atenderte.";
      form.nombre.focus();
      return;
    }
    error.textContent = "";
    const partes = [
      `Hola, soy ${nombre}.`,
      `Me interesa: ${form.interes.value}.`,
      form.mensaje.value.trim(),
      form.telefono.value.trim() ? `Mi teléfono: ${form.telefono.value.trim()}` : ""
    ].filter(Boolean);
    window.open(linkWhatsApp(partes.join("\n")), "_blank", "noopener");
  });
}