/* =============================================================
   IMPORTADORA KP — CATÁLOGO
   Pestañas (disponibles / próximos), filtros, búsqueda y orden.
   ============================================================= */

const estado = {
  vista: "disponibles",
  texto: "",
  orden: "destacados",
  marca: new Set(),
  tipo: new Set(),
  transmision: new Set(),
  combustible: new Set(),
  anioDesde: "",
  anioHasta: "",
  precioMin: "",
  precioMax: ""
};

const GRUPOS_CASILLAS = [
  { clave: "marca", titulo: "Marca" },
  { clave: "tipo", titulo: "Tipo de vehículo" },
  { clave: "transmision", titulo: "Transmisión" },
  { clave: "combustible", titulo: "Combustible" }
];

const ICONO_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  estado.vista = params.get("ver") === "proximamente" ? "proximamente" : "disponibles";
  estado.texto = params.get("q") || "";
  document.getElementById("buscar").value = estado.texto;
  document.getElementById("cerrarFiltros").innerHTML = ICONOS.cerrar;
  document.getElementById("cuentaDisponibles").textContent = CATALOGO.length;
  document.getElementById("cuentaProximos").textContent = PROXIMAMENTE.length;

  conectarEventos();
  cambiarVista(estado.vista, false);
});

function datosVista() {
  return estado.vista === "proximamente"
    ? PROXIMAMENTE.map(v => ({ ...v, estado: "proximamente" }))
    : CATALOGO.map(v => ({ ...v, estado: "disponible" }));
}

/* ---------- Vista ---------- */

function cambiarVista(vista, actualizarUrl = true) {
  estado.vista = vista;
  limpiarFiltros(false);

  const esProximo = vista === "proximamente";
  document.getElementById("tabDisponibles").setAttribute("aria-selected", !esProximo);
  document.getElementById("tabProximos").setAttribute("aria-selected", esProximo);
  document.getElementById("tituloCatalogo").textContent = esProximo ? "Próximos a ingresar" : "Vehículos disponibles";
  document.getElementById("bajadaCatalogo").textContent = esProximo
    ? "Vehículos en camino desde Estados Unidos. Puedes apartarlos antes de que lleguen."
    : "Importados de Estados Unidos, revisados y listos para entrega.";
  document.getElementById("migaActual").textContent = esProximo ? "Próximamente" : "Disponibles";
  document.title = (esProximo ? "Próximos a ingresar" : "Vehículos disponibles") + " | Importadora KP";

  document.getElementById("avisoProximos").innerHTML = esProximo && PROXIMAMENTE.length ? `
    <div class="aviso-proximos">
      <p>Estos vehículos todavía no están en el predio. Escríbenos para conocer fecha de llegada, precio y cómo apartarlo.</p>
      <a class="btn btn--wa" href="${linkWhatsApp("Hola, quiero apartar uno de los vehículos que están por ingresar.")}" target="_blank" rel="noopener">${ICONOS.whatsapp}Preguntar</a>
    </div>` : "";

  // Actualiza el menú superior
  document.querySelectorAll(".nav ul a").forEach(a => {
    const href = a.getAttribute("href");
    const coincide = esProximo ? href === "catalogo.html?ver=proximamente" : href === "catalogo.html";
    if (coincide) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  if (actualizarUrl) {
    const url = esProximo ? "catalogo.html?ver=proximamente" : "catalogo.html";
    history.replaceState(null, "", url);
  }

  pintarFiltros();
  pintarResultados();
}

/* ---------- Filtros ---------- */

function contarValores(lista, clave) {
  const cuenta = new Map();
  lista.forEach(v => {
    const valor = (v[clave] || "").toString().trim();
    if (valor) cuenta.set(valor, (cuenta.get(valor) || 0) + 1);
  });
  return [...cuenta.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
}

function pintarFiltros() {
  const lista = datosVista();
  const contenedor = document.getElementById("gruposFiltros");
  let html = "";

  GRUPOS_CASILLAS.forEach(({ clave, titulo }) => {
    const valores = contarValores(lista, clave);
    if (!valores.length) return;
    html += `
    <details class="grupo" open>
      <summary>${titulo}</summary>
      <div class="grupo__cuerpo">
        ${valores.map(([valor, n]) => `
          <label class="opcion">
            <input type="checkbox" data-grupo="${clave}" value="${escapar(valor)}"${estado[clave].has(valor) ? " checked" : ""}>
            <span>${escapar(valor)}</span><span>${n}</span>
          </label>`).join("")}
      </div>
    </details>`;
  });

  const anios = [...new Set(lista.map(v => Number(v.anio)).filter(Boolean))].sort((a, b) => a - b);
  if (anios.length) {
    const opciones = sel => `<option value="">Cualquiera</option>` + anios.map(a => `<option value="${a}"${String(sel) === String(a) ? " selected" : ""}>${a}</option>`).join("");
    html += `
    <details class="grupo" open>
      <summary>Año</summary>
      <div class="grupo__cuerpo rango">
        <label>Desde<select id="anioDesde">${opciones(estado.anioDesde)}</select></label>
        <label>Hasta<select id="anioHasta">${opciones(estado.anioHasta)}</select></label>
      </div>
    </details>`;
  }

  const conPrecio = lista.some(v => Number(v.precio) > 0);
  if (conPrecio) {
    html += `
    <details class="grupo" open>
      <summary>Precio (Q)</summary>
      <div class="grupo__cuerpo rango">
        <label>Mínimo<input id="precioMin" type="number" inputmode="numeric" min="0" step="1000" placeholder="0" value="${estado.precioMin}"></label>
        <label>Máximo<input id="precioMax" type="number" inputmode="numeric" min="0" step="1000" placeholder="Sin límite" value="${estado.precioMax}"></label>
      </div>
    </details>`;
  }

  contenedor.innerHTML = html || `<p class="filtros__vacio">No hay filtros para esta sección todavía.</p>`;
}

function limpiarFiltros(repintar = true) {
  ["marca", "tipo", "transmision", "combustible"].forEach(k => estado[k].clear());
  estado.anioDesde = estado.anioHasta = estado.precioMin = estado.precioMax = "";
  if (repintar) { pintarFiltros(); pintarResultados(); }
}

/* ---------- Resultados ---------- */

function filtrar() {
  const texto = estado.texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let lista = datosVista().filter(v => {
    if (texto) {
      const pajar = [v.marca, v.modelo, v.version, v.anio, v.tipo, v.color].join(" ")
        .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!texto.split(/\s+/).every(p => pajar.includes(p))) return false;
    }
    for (const k of ["marca", "tipo", "transmision", "combustible"]) {
      if (estado[k].size && !estado[k].has((v[k] || "").toString().trim())) return false;
    }
    if (estado.anioDesde && Number(v.anio) < Number(estado.anioDesde)) return false;
    if (estado.anioHasta && Number(v.anio) > Number(estado.anioHasta)) return false;
    const precio = Number(v.precio) || 0;
    if (estado.precioMin && (!precio || precio < Number(estado.precioMin))) return false;
    if (estado.precioMax && (!precio || precio > Number(estado.precioMax))) return false;
    return true;
  });

  const porPrecio = (a, b, dir) => {
    const pa = Number(a.precio) || 0, pb = Number(b.precio) || 0;
    if (!pa && !pb) return 0;
    if (!pa) return 1;   // sin precio al final
    if (!pb) return -1;
    return dir * (pa - pb);
  };

  switch (estado.orden) {
    case "precio-asc": lista.sort((a, b) => porPrecio(a, b, 1)); break;
    case "precio-desc": lista.sort((a, b) => porPrecio(a, b, -1)); break;
    case "anio-desc": lista.sort((a, b) => b.anio - a.anio); break;
    case "anio-asc": lista.sort((a, b) => a.anio - b.anio); break;
  }
  return lista;
}

function filtrosActivos() {
  const chips = [];
  ["marca", "tipo", "transmision", "combustible"].forEach(k =>
    estado[k].forEach(valor => chips.push({ texto: valor, quitar: () => estado[k].delete(valor) }))
  );
  if (estado.anioDesde) chips.push({ texto: `Desde ${estado.anioDesde}`, quitar: () => estado.anioDesde = "" });
  if (estado.anioHasta) chips.push({ texto: `Hasta ${estado.anioHasta}`, quitar: () => estado.anioHasta = "" });
  if (estado.precioMin) chips.push({ texto: `Mín. ${formatoPrecio(estado.precioMin)}`, quitar: () => estado.precioMin = "" });
  if (estado.precioMax) chips.push({ texto: `Máx. ${formatoPrecio(estado.precioMax)}`, quitar: () => estado.precioMax = "" });
  if (estado.texto) chips.push({ texto: `"${estado.texto}"`, quitar: () => { estado.texto = ""; document.getElementById("buscar").value = ""; } });
  return chips;
}

function pintarResultados() {
  const lista = filtrar();
  const total = datosVista().length;
  const rejilla = document.getElementById("rejilla");
  const cuenta = document.getElementById("cuentaResultados");
  const esProximo = estado.vista === "proximamente";

  cuenta.innerHTML = total
    ? `Mostrando <strong>${lista.length}</strong> de ${total} ${total === 1 ? "vehículo" : "vehículos"}`
    : "";

  // Chips de filtros activos
  const chips = filtrosActivos();
  const zonaChips = document.getElementById("chips");
  zonaChips.innerHTML = chips.map((c, i) => `<button class="chip" data-i="${i}" aria-label="Quitar filtro ${escapar(c.texto)}">${escapar(c.texto)}${ICONO_X}</button>`).join("");
  zonaChips.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    chips[Number(b.dataset.i)].quitar();
    pintarFiltros();
    pintarResultados();
  }));

  if (lista.length) {
    rejilla.innerHTML = lista.map(htmlFicha).join("");
    return;
  }

  if (!total) {
    rejilla.innerHTML = esProximo
      ? `<div class="vacio"><h3>Nuevos ingresos en camino</h3><p>Aún no hemos publicado las próximas unidades. Escríbenos y te avisamos en cuanto las confirmemos.</p><a class="btn btn--oro" href="${linkWhatsApp("Hola, quiero que me avisen cuando lleguen nuevos vehículos.")}" target="_blank" rel="noopener">Avísame por WhatsApp</a></div>`
      : `<div class="vacio"><h3>Estamos preparando nuevos vehículos</h3><p>Revisa lo que viene en camino o pídenos el modelo que buscas.</p><a class="btn btn--linea" href="catalogo.html?ver=proximamente">Ver próximos a ingresar</a></div>`;
    return;
  }

  rejilla.innerHTML = `
    <div class="vacio">
      <h3>Ningún vehículo coincide con tu búsqueda</h3>
      <p>Prueba quitando algunos filtros. Si buscas un modelo específico, también podemos traerlo por pedido.</p>
      <div class="vacio__botones">
        <button class="btn btn--linea" type="button" id="vacioLimpiar">Borrar filtros</button>
        <a class="btn btn--oro" href="${linkWhatsApp("Hola, busco un vehículo que no está en su catálogo. ¿Me pueden cotizar un pedido?")}" target="_blank" rel="noopener">Pedir este modelo</a>
      </div>
    </div>`;
  document.getElementById("vacioLimpiar").addEventListener("click", () => {
    estado.texto = ""; document.getElementById("buscar").value = "";
    limpiarFiltros();
  });
}

/* ---------- Eventos ---------- */

function conectarEventos() {
  document.getElementById("tabDisponibles").addEventListener("click", () => cambiarVista("disponibles"));
  document.getElementById("tabProximos").addEventListener("click", () => cambiarVista("proximamente"));

  // Flechas del teclado entre pestañas
  document.querySelector(".pestanas").addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const otra = estado.vista === "disponibles" ? "proximamente" : "disponibles";
    cambiarVista(otra);
    document.getElementById(otra === "proximamente" ? "tabProximos" : "tabDisponibles").focus();
  });

  let espera;
  document.getElementById("buscar").addEventListener("input", e => {
    clearTimeout(espera);
    espera = setTimeout(() => { estado.texto = e.target.value.trim(); pintarResultados(); }, 180);
  });

  document.getElementById("ordenar").addEventListener("change", e => { estado.orden = e.target.value; pintarResultados(); });

  const grupos = document.getElementById("gruposFiltros");
  grupos.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.grupo) {
      t.checked ? estado[t.dataset.grupo].add(t.value) : estado[t.dataset.grupo].delete(t.value);
    } else if (t.id in estado) {
      estado[t.id] = t.value;
    }
    pintarResultados();
  });
  grupos.addEventListener("input", e => {
    if (e.target.id === "precioMin" || e.target.id === "precioMax") {
      clearTimeout(espera);
      espera = setTimeout(() => { estado[e.target.id] = e.target.value; pintarResultados(); }, 300);
    }
  });

  document.getElementById("limpiarFiltros").addEventListener("click", () => limpiarFiltros());

  // Panel de filtros en celular
  const panel = document.getElementById("filtros");
  const fondo = document.getElementById("fondoFiltros");
  const abrir = document.getElementById("abrirFiltros");
  const cerrarPanel = () => {
    panel.classList.remove("filtros--abierto");
    fondo.classList.remove("fondo-filtros--visible");
    document.body.classList.remove("sin-scroll");
    abrir.setAttribute("aria-expanded", "false");
  };
  abrir.addEventListener("click", () => {
    panel.classList.add("filtros--abierto");
    fondo.classList.add("fondo-filtros--visible");
    document.body.classList.add("sin-scroll");
    abrir.setAttribute("aria-expanded", "true");
    panel.querySelector("button, input, select")?.focus();
  });
  document.getElementById("cerrarFiltros").addEventListener("click", cerrarPanel);
  document.getElementById("verResultados").addEventListener("click", () => { cerrarPanel(); abrir.focus(); });
  fondo.addEventListener("click", cerrarPanel);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("filtros--abierto")) cerrarPanel(); });
}
