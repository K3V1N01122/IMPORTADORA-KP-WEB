/* =============================================================
   IMPORTADORA KP — PANEL: PORTADA
   Las fotos grandes del inicio (slider), con su título y botón.
   ============================================================= */

const Portada = (() => {

  const DESTINOS = [
    ["catalogo.html", "Catálogo: disponibles"],
    ["catalogo.html?ver=proximamente", "Catálogo: próximamente"],
    ["index.html#servicios", "Servicios"],
    ["index.html#contacto", "Contacto"]
  ];

  const lista = () => (Panel.datos.CONFIG.portada = Panel.datos.CONFIG.portada || []);

  function pintar() {
    const sec = document.getElementById("secPortada");
    const l = lista();
    sec.innerHTML = `
      <div class="p-seccion-cabeza">
        <div>
          <h2>Portada del inicio</h2>
          <p class="p-ayuda">Las fotos grandes que se van pasando al abrir el sitio. Usa fotos horizontales (más anchas que altas). El orden de aquí es el orden en que salen.</p>
        </div>
        <button class="btn btn--oro" type="button" id="pAgregar">${UI.I.mas}Agregar diapositiva</button>
      </div>
      <div class="p-diapos">
        ${l.length ? l.map(tarjeta).join("") : `<div class="vacio"><img class="vacio__logo" src="img/marca/logo-kp-640.png" alt=""><h3>Sin diapositivas</h3><p>Sin diapositivas, el inicio empieza directo en los servicios.</p></div>`}
      </div>`;

    sec.querySelector("#pAgregar").addEventListener("click", () => {
      l.push({ foto: "", titulo: "Nuevo título", texto: "", boton: "Ver disponibles", link: "catalogo.html" });
      Panel.cambio(); pintar();
      sec.querySelector(".p-diapo:last-child input")?.focus();
    });
    sec.querySelectorAll(".p-diapo").forEach(conectar);
  }

  function tarjeta(p, i) {
    const tipo = p.whatsapp !== undefined ? "whatsapp" : "link";
    const total = lista().length;
    return `
    <article class="p-diapo" data-i="${i}">
      <div class="p-diapo__foto">
        ${UI.foto(p.foto, "")}
        <label class="btn btn--cromo btn--chico p-diapo__cambiar">
          <input type="file" accept="image/*" data-campo="archivo" hidden>${UI.I.camara}${p.foto ? "Cambiar foto" : "Subir foto"}
        </label>
        <span class="p-diapo__num">${i + 1} / ${total}</span>
      </div>
      <div class="p-diapo__campos">
        <div class="campo"><label>Título</label><input data-campo="titulo" value="${UI.esc(p.titulo)}"></div>
        <div class="campo"><label>Texto</label><textarea data-campo="texto" rows="2">${UI.esc(p.texto)}</textarea></div>
        <div class="p-rejilla">
          <div class="campo"><label>Texto del botón</label><input data-campo="boton" value="${UI.esc(p.boton)}"></div>
          <div class="campo"><label>El botón abre</label>
            <select data-campo="tipo">
              <option value="link"${tipo === "link" ? " selected" : ""}>Una página del sitio</option>
              <option value="whatsapp"${tipo === "whatsapp" ? " selected" : ""}>WhatsApp con mensaje</option>
            </select>
          </div>
        </div>
        <div class="campo" ${tipo === "link" ? "" : "hidden"} data-si="link"><label>Página</label>
          <select data-campo="link">${DESTINOS.map(([v, t]) => `<option value="${v}"${p.link === v ? " selected" : ""}>${t}</option>`).join("")}
            ${p.link && !DESTINOS.some(d => d[0] === p.link) ? `<option value="${UI.esc(p.link)}" selected>${UI.esc(p.link)}</option>` : ""}
          </select>
        </div>
        <div class="campo" ${tipo === "whatsapp" ? "" : "hidden"} data-si="whatsapp"><label>Mensaje de WhatsApp</label>
          <input data-campo="whatsapp" value="${UI.esc(p.whatsapp || "")}" placeholder="Hola, quiero…">
        </div>
        <label class="opcion">
          <input type="checkbox" data-campo="logo" ${p.logo === false ? "" : "checked"}>
          <span>Mostrar el logo sobre la foto <small>(apágalo si la foto ya trae el logo impreso)</small></span>
        </label>
        <div class="p-diapo__acciones">
          <button type="button" class="p-icono" data-accion="subir" aria-label="Mover antes" ${i === 0 ? "disabled" : ""}>${UI.I.arriba}</button>
          <button type="button" class="p-icono" data-accion="bajar" aria-label="Mover después" ${i === total - 1 ? "disabled" : ""}>${UI.I.abajo}</button>
          <button type="button" class="btn btn--linea btn--chico p-peligro" data-accion="quitar">${UI.I.basura}Quitar</button>
        </div>
      </div>
    </article>`;
  }

  function conectar(el) {
    const i = Number(el.dataset.i);
    const p = lista()[i];

    el.addEventListener("input", e => {
      const c = e.target.dataset.campo;
      if (["titulo", "texto", "boton", "whatsapp"].includes(c)) { p[c] = e.target.value; Panel.cambio(); }
    });
    el.addEventListener("change", async e => {
      const c = e.target.dataset.campo;
      if (c === "link") { p.link = e.target.value; }
      if (c === "logo") { if (e.target.checked) delete p.logo; else p.logo = false; }
      if (c === "tipo") {
        if (e.target.value === "whatsapp") { delete p.link; p.whatsapp = p.whatsapp || "Hola, vi su página web y quiero más información."; }
        else { delete p.whatsapp; p.link = p.link || "catalogo.html"; }
        Panel.cambio(); pintar(); return;
      }
      if (c === "archivo" && e.target.files[0]) {
        try {
          UI.aviso("Preparando foto…");
          const img = await Imagenes.preparar(e.target.files[0], ADMIN.anchoFotoPortada);
          if (img.ancho < img.alto) UI.aviso("Esta foto es vertical; en la portada se verá recortada. Mejor usa una horizontal.", "error", 7000);
          const ruta = Imagenes.nombreNuevo(ADMIN.carpetaPortada, "portada");
          await Imagenes.guardarPendiente(ruta, img.dataUrl);
          p.foto = ruta;
          delete p.logo;   // foto nueva: se vuelve a mostrar el logo (apágalo si la foto ya lo trae)
          Panel.cambio(); pintar();
        } catch (err) { UI.aviso(err.message, "error"); }
        return;
      }
      Panel.cambio();
    });
    el.addEventListener("click", async e => {
      const b = e.target.closest("[data-accion]");
      if (!b) return;
      const l = lista();
      if (b.dataset.accion === "subir") [l[i - 1], l[i]] = [l[i], l[i - 1]];
      if (b.dataset.accion === "bajar") [l[i + 1], l[i]] = [l[i], l[i + 1]];
      if (b.dataset.accion === "quitar") {
        const ok = await UI.confirmar({ titulo: "¿Quitar esta diapositiva?", texto: p.titulo, si: "Quitar", peligro: true });
        if (!ok) return;
        l.splice(i, 1);
      }
      Panel.cambio(); pintar();
    });
  }

  return { pintar };
})();
