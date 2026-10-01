/* =============================================================
   IMPORTADORA KP — PANEL: FOTOS
   - Reduce cada foto antes de subirla (carga más rápido el sitio).
   - Guarda las fotos pendientes en el navegador (IndexedDB) para
     no perderlas si se cierra la pestaña antes de publicar.
   ============================================================= */

const Imagenes = (() => {

  /* Lee un archivo del celular/computadora y lo devuelve como JPEG reducido */
  async function preparar(archivo, anchoMax) {
    if (!archivo.type.startsWith("image/")) throw new Error(`"${archivo.name}" no es una imagen.`);
    const bitmap = await cargar(archivo);
    const escala = Math.min(1, anchoMax / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);
    const lienzo = document.createElement("canvas");
    lienzo.width = w; lienzo.height = h;
    const ctx = lienzo.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);   // fondo para PNG con transparencia
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) bitmap.close();
    const dataUrl = lienzo.toDataURL("image/jpeg", ADMIN.calidadJpeg);
    return { dataUrl, ancho: w, alto: h, kb: Math.round(dataUrl.length * 0.75 / 1024) };
  }

  async function cargar(archivo) {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(archivo, { imageOrientation: "from-image" }); } catch (e) { /* respaldo abajo */ }
    }
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => mal(new Error(`No se pudo abrir "${archivo.name}". Prueba con una foto JPG o PNG.`));
      img.src = URL.createObjectURL(archivo);
    });
  }

  function nombreNuevo(carpeta, prefijo) {
    const azar = Math.random().toString(36).slice(2, 7);
    const limpio = String(prefijo || "foto").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `${carpeta}/${limpio || "foto"}-${Date.now().toString(36)}${azar}.jpg`;
  }

  /* ---------- Fotos pendientes (IndexedDB) ---------- */

  let db = null;
  function abrir() {
    if (db) return Promise.resolve(db);
    return new Promise((ok, mal) => {
      let pedido;
      try { pedido = indexedDB.open("kp-admin", 1); } catch (e) { mal(e); return; }
      pedido.onupgradeneeded = () => pedido.result.createObjectStore("fotos");
      pedido.onsuccess = () => { db = pedido.result; ok(db); };
      pedido.onerror = () => mal(pedido.error);
    });
  }
  async function operar(modo, fn) {
    try {
      const base = await abrir();
      return await new Promise((ok, mal) => {
        const tx = base.transaction("fotos", modo);
        const r = fn(tx.objectStore("fotos"));
        tx.oncomplete = () => ok(r && r.result);
        tx.onerror = () => mal(tx.error);
      });
    } catch (e) { return undefined; }   // sin IndexedDB: las fotos viven solo en memoria
  }

  const memoria = new Map();   // ruta → dataUrl (fotos aún no publicadas)

  async function guardarPendiente(ruta, dataUrl) {
    memoria.set(ruta, dataUrl);
    await operar("readwrite", s => s.put(dataUrl, ruta));
  }
  async function quitarPendiente(ruta) {
    memoria.delete(ruta);
    await operar("readwrite", s => s.delete(ruta));
  }
  async function cargarPendientes() {
    const claves = await operar("readonly", s => s.getAllKeys()) || [];
    for (const k of claves) {
      const v = await operar("readonly", s => s.get(k));
      if (v) memoria.set(k, v);
    }
  }
  async function limpiarPendientes() {
    memoria.clear();
    await operar("readwrite", s => s.clear());
  }

  /* URL para mostrar una foto en el panel */
  const recienSubidas = new Set();
  function url(ruta) {
    if (!ruta) return "";
    if (memoria.has(ruta)) return memoria.get(ruta);
    if (recienSubidas.has(ruta)) return GitHub.urlCruda(ruta);
    return ruta;
  }

  return {
    preparar, nombreNuevo, url,
    guardarPendiente, quitarPendiente, cargarPendientes, limpiarPendientes,
    pendientes: () => memoria,
    marcarSubidas: rutas => rutas.forEach(r => recienSubidas.add(r))
  };
})();
