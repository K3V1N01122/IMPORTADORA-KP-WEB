/* =============================================================
   IMPORTADORA KP — PANEL: LEER Y ESCRIBIR data/vehiculos.js
   El panel lee el archivo, lo edita en memoria y lo vuelve a
   escribir con el mismo formato que usa el sitio público.
   ============================================================= */

const Datos = (() => {

  const CAMPOS_VEHICULO = [
    "id", "marca", "modelo", "version", "anio", "precio", "km",
    "transmision", "combustible", "motor", "traccion", "color", "tipo",
    "foto", "fotos", "llegada", "descripcion"
  ];

  /* Convierte el texto del archivo en { CONFIG, CATALOGO, PROXIMAMENTE } */
  function leer(texto) {
    const fn = new Function(`${texto}\n;return { CONFIG, CATALOGO, PROXIMAMENTE: typeof PROXIMAMENTE === "undefined" ? [] : PROXIMAMENTE };`);
    const d = fn();
    return {
      CONFIG: d.CONFIG || {},
      CATALOGO: (d.CATALOGO || []).map(normalizar),
      PROXIMAMENTE: (d.PROXIMAMENTE || []).map(normalizar)
    };
  }

  function normalizar(v) {
    const n = {};
    CAMPOS_VEHICULO.forEach(c => { n[c] = v[c] ?? (c === "fotos" ? [] : ""); });
    // conserva campos extra que se hayan agregado a mano
    Object.keys(v).forEach(c => { if (!(c in n)) n[c] = v[c]; });
    if (!Array.isArray(n.fotos)) n.fotos = [];
    return n;
  }

  /* Objeto → texto JS legible (sin comillas en los nombres de campo) */
  function aJS(valor) {
    return JSON.stringify(valor, null, 2).replace(/^(\s*)"([A-Za-z_]\w*)":/gm, "$1$2:");
  }

  function limpiarVehiculo(v, esProximo) {
    const s = {};
    CAMPOS_VEHICULO.forEach(c => {
      if (c === "llegada" && !esProximo) return;
      let val = v[c];
      if (c === "anio") val = Number(val) || "";
      if (c === "precio") val = Number(String(val).replace(/[^\d]/g, "")) || 0;
      if (c === "km") val = val === "" || val === null ? "" : (Number(String(val).replace(/[^\d]/g, "")) || "");
      if (c === "fotos") val = (val || []).filter(Boolean);
      s[c] = val ?? "";
    });
    Object.keys(v).forEach(c => { if (!(c in s) && !CAMPOS_VEHICULO.includes(c) && !c.startsWith("_")) s[c] = v[c]; });
    return s;
  }

  /* Genera el archivo completo */
  function escribir({ CONFIG, CATALOGO, PROXIMAMENTE }) {
    const fecha = new Date().toLocaleString("es-GT", { dateStyle: "long", timeStyle: "short" });
    return `/* =============================================================
   IMPORTADORA KP — DATOS DEL SITIO
   Este archivo lo actualiza el panel administrativo (admin.html).
   Última actualización desde el panel: ${fecha}

   También se puede editar a mano. Recuerda:
   - GitHub Pages distingue mayúsculas y minúsculas en los nombres
     de fotos (raize.jpg ≠ Raize.jpg).
   - precio y km: solo números, sin comas. precio 0 = "Precio por confirmar".
   - Cualquier campo vacío "" simplemente no se muestra.
   ============================================================= */

const CONFIG = ${aJS(CONFIG)};

/* -------------------------------------------------------------
   VEHÍCULOS DISPONIBLES (en el predio, entrega inmediata)
   ------------------------------------------------------------- */
const CATALOGO = ${aJS(CATALOGO.map(v => limpiarVehiculo(v, false)))};

/* -------------------------------------------------------------
   PRÓXIMAMENTE (en camino desde Estados Unidos)
   llegada → texto libre, ej. "en noviembre"
   ------------------------------------------------------------- */
const PROXIMAMENTE = ${aJS(PROXIMAMENTE.map(v => limpiarVehiculo(v, true)))};
`;
  }

  /* id corto y único a partir de marca, modelo y año */
  function crearId(v, existentes) {
    const base = [v.marca, v.modelo, v.anio].filter(Boolean).join("-")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vehiculo";
    let id = base, n = 2;
    while (existentes.includes(id)) id = `${base}-${n++}`;
    return id;
  }

  return { leer, escribir, crearId, normalizar };
})();
