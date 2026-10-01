/* =============================================================
   IMPORTADORA KP — PANEL: ARRANQUE, BORRADOR Y PUBLICACIÓN
   Flujo: entrar → cargar datos del repositorio → editar (se
   guarda solo como borrador en este navegador) → Publicar.
   ============================================================= */

const Panel = {
  datos: null,          // { CONFIG, CATALOGO, PROXIMAMENTE } que se está editando
  original: "",         // copia de lo publicado, para saber si hay cambios
  shaDatos: null,       // versión del archivo en GitHub al momento de cargar
  seccion: "inventario",

  /* Llamar después de cualquier cambio */
  cambio() {
    guardarBorrador();
    actualizarEstado();
  },

  hayCambios() {
    return JSON.stringify(this.datos) !== this.original;
  },

  pintar() {
    Inventario.pintar();
    Portada.pintar();
    Negocio.pintar();
    actualizarEstado();
  }
};

const CLAVE_BORRADOR = "kp-admin-borrador";
const $ = id => document.getElementById(id);

/* ---------- Pantallas ---------- */

function mostrar(pantalla, texto) {
  $("pantallaAcceso").hidden = pantalla !== "acceso";
  $("pantallaPanel").hidden = pantalla !== "panel";
  $("pantallaCargando").hidden = pantalla !== "cargando";
  if (texto) $("cargandoTexto").textContent = texto;
}

/* ---------- Acceso ---------- */

$("formAcceso").addEventListener("submit", async e => {
  e.preventDefault();
  const token = $("aToken").value.trim();
  const error = $("aError");
  if (!token) { error.textContent = "Pega tu clave de acceso."; return; }
  error.textContent = "";
  $("aEntrar").disabled = true;
  $("aEntrar").textContent = "Verificando…";
  GitHub.guardarToken(token, $("aRecordar").checked);
  try {
    await GitHub.verificar();
    $("aToken").value = "";
    await cargar();
  } catch (err) {
    GitHub.borrarToken();
    mostrar("acceso");
    error.textContent = err.message;
  } finally {
    $("aEntrar").disabled = false;
    $("aEntrar").textContent = "Entrar";
  }
});

$("salir").addEventListener("click", async () => {
  if (Panel.hayCambios()) {
    const ok = await UI.confirmar({
      titulo: "Tienes cambios sin publicar",
      texto: "Se quedan guardados como borrador en este dispositivo y podrás publicarlos la próxima vez que entres.",
      si: "Salir de todos modos"
    });
    if (!ok) return;
  }
  GitHub.borrarToken();
  location.reload();
});

/* ---------- Cargar datos ---------- */

async function cargar() {
  mostrar("cargando", "Cargando inventario…");
  const { texto, sha } = await GitHub.leerArchivo(ADMIN.archivoDatos);
  Panel.datos = Datos.leer(texto);
  Panel.original = JSON.stringify(Panel.datos);
  Panel.shaDatos = sha;
  await Imagenes.cargarPendientes();
  revisarBorrador();
  mostrar("panel");
  Panel.pintar();
}

/* ---------- Borrador local ---------- */

function guardarBorrador() {
  try {
    if (Panel.hayCambios()) localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ base: Panel.shaDatos, datos: Panel.datos, fecha: Date.now() }));
    else localStorage.removeItem(CLAVE_BORRADOR);
  } catch (e) { /* sin almacenamiento: los cambios viven hasta cerrar la pestaña */ }
}

function revisarBorrador() {
  let b = null;
  try { b = JSON.parse(localStorage.getItem(CLAVE_BORRADOR)); } catch (e) { /* nada */ }
  const caja = $("avisoBorrador");
  if (!b || !b.datos) { caja.hidden = true; return; }

  const fecha = new Date(b.fecha).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" });
  if (b.base === Panel.shaDatos) {
    // mismo punto de partida: se recupera solo
    Panel.datos = b.datos;
    caja.hidden = false;
    caja.innerHTML = `<p>${UI.I.alerta} Recuperamos los cambios que no publicaste (${UI.esc(fecha)}). Revísalos y toca <b>Publicar cambios</b>.</p>`;
    return;
  }
  // el sitio cambió desde que se hizo el borrador (por ejemplo, desde otra computadora)
  caja.hidden = false;
  caja.innerHTML = `
    <p>${UI.I.alerta} Hay un borrador del ${UI.esc(fecha)}, pero el sitio se actualizó después desde otro lugar.</p>
    <div><button class="btn btn--linea btn--chico" id="borradorUsar">Usar mi borrador</button>
    <button class="btn btn--linea btn--chico" id="borradorDescartar">Descartarlo</button></div>`;
  $("borradorUsar").onclick = () => { Panel.datos = b.datos; caja.hidden = true; Panel.cambio(); Panel.pintar(); };
  $("borradorDescartar").onclick = () => { try { localStorage.removeItem(CLAVE_BORRADOR); } catch (e) { /* nada */ } caja.hidden = true; };
}

/* ---------- Estado de cambios ---------- */

function actualizarEstado() {
  const hay = Panel.hayCambios();
  const pill = $("estadoCambios");
  pill.dataset.estado = hay ? "pendiente" : "limpio";
  pill.textContent = hay ? "Cambios sin publicar" : "Todo publicado";
  $("publicar").disabled = !hay;
  $("descartar").hidden = !hay;
}

window.addEventListener("beforeunload", e => {
  if (Panel.datos && Panel.hayCambios()) { e.preventDefault(); e.returnValue = ""; }
});

$("descartar").addEventListener("click", async () => {
  const ok = await UI.confirmar({
    titulo: "¿Descartar los cambios?",
    texto: "Se perderán los cambios que no has publicado y el panel volverá a mostrar lo que está en el sitio ahora.",
    si: "Descartar cambios", peligro: true
  });
  if (!ok) return;
  Panel.datos = JSON.parse(Panel.original);
  $("avisoBorrador").hidden = true;
  Panel.cambio();
  Panel.pintar();
});

/* ---------- Pestañas ---------- */

document.querySelectorAll(".p-pestana").forEach(b => b.addEventListener("click", () => {
  Panel.seccion = b.dataset.seccion;
  document.querySelectorAll(".p-pestana").forEach(x => x.setAttribute("aria-selected", x === b));
  document.querySelectorAll("[data-panel]").forEach(s => { s.hidden = s.dataset.panel !== Panel.seccion; });
  window.scrollTo({ top: 0 });
}));

/* ---------- Publicar ---------- */

function rutasEnUso(d) {
  const r = new Set();
  [...d.CATALOGO, ...d.PROXIMAMENTE].forEach(v => { if (v.foto) r.add(v.foto); (v.fotos || []).forEach(f => f && r.add(f)); });
  (d.CONFIG.portada || []).forEach(p => p.foto && r.add(p.foto));
  return r;
}

function resumenCambios() {
  const antes = JSON.parse(Panel.original);
  const ids = l => new Map(l.map(v => [v.id, JSON.stringify(v)]));
  const a = ids([...antes.CATALOGO, ...antes.PROXIMAMENTE]);
  const b = ids([...Panel.datos.CATALOGO, ...Panel.datos.PROXIMAMENTE]);
  let nuevos = 0, editados = 0, quitados = 0;
  const disponiblesAntes = new Set(antes.CATALOGO.map(v => v.id));
  const disponiblesAhora = new Set(Panel.datos.CATALOGO.map(v => v.id));
  b.forEach((v, id) => {
    if (!a.has(id)) nuevos++;
    else if (a.get(id) !== v || disponiblesAntes.has(id) !== disponiblesAhora.has(id)) editados++;
  });
  a.forEach((_, id) => { if (!b.has(id)) quitados++; });
  const partes = [];
  if (nuevos) partes.push(`${nuevos} nuevo${nuevos > 1 ? "s" : ""}`);
  if (editados) partes.push(`${editados} editado${editados > 1 ? "s" : ""}`);
  if (quitados) partes.push(`${quitados} quitado${quitados > 1 ? "s" : ""}`);
  const otros = JSON.stringify(antes.CONFIG) !== JSON.stringify(Panel.datos.CONFIG);
  const orden = !partes.length && !otros;
  return (partes.length ? "Vehículos: " + partes.join(", ") : "") +
    (otros ? (partes.length ? " · " : "") + "Portada / datos del negocio" : "") +
    (orden ? "Orden del inventario" : "");
}

$("publicar").addEventListener("click", async () => {
  const resumen = resumenCambios();
  const ok = await UI.confirmar({
    titulo: "¿Publicar en el sitio?",
    texto: `${resumen}. Los cambios se verán en importadorakp.com en 1 a 2 minutos.`,
    si: "Publicar"
  });
  if (!ok) return;

  const boton = $("publicar");
  boton.disabled = true;
  boton.textContent = "Publicando…";
  try {
    // ¿Alguien cambió el sitio mientras editabas?
    const actual = await GitHub.leerArchivo(ADMIN.archivoDatos);
    if (actual.sha !== Panel.shaDatos) {
      throw new Error("El sitio se actualizó desde otro lugar mientras editabas. Tus cambios siguen guardados: recarga la página y elige \"Usar mi borrador\".");
    }

    const enUso = rutasEnUso(Panel.datos);
    const archivos = [{ ruta: ADMIN.archivoDatos, texto: Datos.escribir(Panel.datos) }];

    // fotos nuevas que se usan
    const subidas = [];
    Imagenes.pendientes().forEach((dataUrl, ruta) => {
      if (enUso.has(ruta)) { archivos.push({ ruta, base64: dataUrl.split(",")[1] }); subidas.push(ruta); }
    });

    // fotos del panel que ya nadie usa (solo en las carpetas del panel)
    const existentes = [...await GitHub.listarCarpeta(ADMIN.carpetaAutos), ...await GitHub.listarCarpeta(ADMIN.carpetaPortada)];
    const borradas = existentes.filter(r => !enUso.has(r));
    borradas.forEach(ruta => archivos.push({ ruta, borrar: true }));

    const commit = await GitHub.publicar(archivos, `Panel: ${resumen}`);

    await Imagenes.limpiarPendientes();
    Imagenes.marcarSubidas(subidas);
    const nuevo = await GitHub.leerArchivo(ADMIN.archivoDatos, commit.sha);
    Panel.datos = Datos.leer(nuevo.texto);
    Panel.original = JSON.stringify(Panel.datos);
    Panel.shaDatos = nuevo.sha;
    $("avisoBorrador").hidden = true;
    Panel.cambio();
    Panel.pintar();
    UI.aviso("¡Publicado! El sitio se actualiza en 1 a 2 minutos.", "ok", 6500);
  } catch (err) {
    UI.aviso(err.message, "error", 9000);
  } finally {
    boton.textContent = "Publicar cambios";
    actualizarEstado();
  }
});

/* ---------- Inicio ---------- */

(async () => {
  if (!GitHub.leerToken()) { mostrar("acceso"); return; }
  try {
    mostrar("cargando", "Conectando…");
    await GitHub.verificar();
    await cargar();
  } catch (err) {
    if (err.status === 401) GitHub.borrarToken();
    mostrar("acceso");
    $("aError").textContent = err.message;
  }
})();
