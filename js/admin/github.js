/* =============================================================
   IMPORTADORA KP — PANEL: CONEXIÓN CON GITHUB
   El sitio no tiene servidor: el panel guarda los cambios
   directamente en el repositorio usando un token personal.
   Todo se publica en un solo "commit" (fotos + datos juntos).
   ============================================================= */

const GitHub = (() => {
  const API = "https://api.github.com";
  const CLAVE = "kp-admin-token";
  let token = null;

  function leerToken() {
    try { token = localStorage.getItem(CLAVE) || sessionStorage.getItem(CLAVE); } catch (e) { /* nada */ }
    return token;
  }

  function guardarToken(t, recordar) {
    token = t;
    try {
      localStorage.removeItem(CLAVE); sessionStorage.removeItem(CLAVE);
      (recordar ? localStorage : sessionStorage).setItem(CLAVE, t);
    } catch (e) { /* si el navegador no deja guardar, dura solo mientras la pestaña esté abierta */ }
  }

  function borrarToken() {
    token = null;
    try { localStorage.removeItem(CLAVE); sessionStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
  }

  async function pedir(ruta, opciones = {}) {
    const r = await fetch(API + ruta, {
      ...opciones,
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opciones.body ? { "Content-Type": "application/json" } : {})
      }
    });
    if (!r.ok) {
      let detalle = "";
      try { detalle = (await r.json()).message || ""; } catch (e) { /* nada */ }
      const err = new Error(mensajeError(r.status, detalle));
      err.status = r.status;
      throw err;
    }
    return r.status === 204 ? null : r.json();
  }

  function mensajeError(status, detalle) {
    if (status === 401) return "El token no es válido o ya venció. Crea uno nuevo e inicia sesión otra vez.";
    if (status === 403) return "El token no tiene permiso para escribir en el repositorio (revisa \"Contents: Read and write\").";
    if (status === 404) return "No se encontró el repositorio. Revisa que el token tenga acceso a " + ADMIN.repo + ".";
    if (status === 409 || status === 422) return "El repositorio cambió mientras editabas. Recarga el panel e inténtalo de nuevo. (" + detalle + ")";
    return "Error de GitHub (" + status + "): " + detalle;
  }

  const repo = () => `/repos/${ADMIN.usuario}/${ADMIN.repo}`;

  /* Comprueba que el token sirve y puede escribir */
  async function verificar() {
    const info = await pedir(repo());
    if (!info.permissions || !info.permissions.push) {
      throw new Error("El token puede leer pero no escribir. Dale el permiso \"Contents: Read and write\".");
    }
    return info;
  }

  /* Lee un archivo de texto del repositorio (versión más reciente) */
  async function leerArchivo(ruta, ref = ADMIN.rama) {
    const res = await pedir(`${repo()}/contents/${ruta.split("/").map(encodeURIComponent).join("/")}?ref=${ref}&t=${Date.now()}`);
    const binario = atob(res.content.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binario, c => c.charCodeAt(0));
    return { texto: new TextDecoder("utf-8").decode(bytes), sha: res.sha };
  }

  /* Lista los archivos de una carpeta (vacío si no existe) */
  async function listarCarpeta(ruta) {
    try {
      const res = await pedir(`${repo()}/contents/${ruta}?ref=${ADMIN.rama}`);
      return Array.isArray(res) ? res.filter(f => f.type === "file").map(f => f.path) : [];
    } catch (e) {
      if (e.status === 404) return [];
      throw e;
    }
  }

  /* Publica varios cambios en un solo commit.
     archivos: [{ ruta, texto }] o [{ ruta, base64 }] o [{ ruta, borrar: true }] */
  async function publicar(archivos, mensaje) {
    const ref = await pedir(`${repo()}/git/ref/heads/${ADMIN.rama}`);
    const commitBase = await pedir(`${repo()}/git/commits/${ref.object.sha}`);

    const arbol = [];
    for (const a of archivos) {
      if (a.borrar) { arbol.push({ path: a.ruta, mode: "100644", type: "blob", sha: null }); continue; }
      const blob = await pedir(`${repo()}/git/blobs`, {
        method: "POST",
        body: JSON.stringify(a.base64 !== undefined
          ? { content: a.base64, encoding: "base64" }
          : { content: a.texto, encoding: "utf-8" })
      });
      arbol.push({ path: a.ruta, mode: "100644", type: "blob", sha: blob.sha });
    }

    const nuevoArbol = await pedir(`${repo()}/git/trees`, {
      method: "POST", body: JSON.stringify({ base_tree: commitBase.tree.sha, tree: arbol })
    });
    const nuevoCommit = await pedir(`${repo()}/git/commits`, {
      method: "POST", body: JSON.stringify({ message: mensaje, tree: nuevoArbol.sha, parents: [ref.object.sha] })
    });
    await pedir(`${repo()}/git/refs/heads/${ADMIN.rama}`, {
      method: "PATCH", body: JSON.stringify({ sha: nuevoCommit.sha })
    });
    return nuevoCommit;
  }

  /* Dirección directa a un archivo recién subido (antes de que GitHub Pages lo publique) */
  function urlCruda(ruta) {
    return `https://raw.githubusercontent.com/${ADMIN.usuario}/${ADMIN.repo}/${ADMIN.rama}/${ruta.split("/").map(encodeURIComponent).join("/")}`;
  }

  return { leerToken, guardarToken, borrarToken, verificar, leerArchivo, listarCarpeta, publicar, urlCruda };
})();
