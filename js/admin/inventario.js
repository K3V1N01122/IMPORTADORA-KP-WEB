/* =============================================================
   IMPORTADORA KP — PANEL: INVENTARIO
   Lista de vehículos (disponibles y próximos) y editor con fotos.
   ============================================================= */

const Inventario = (() => {
  let vista = "disponibles";   // "disponibles" | "proximamente"
  let busqueda = "";

  const lista = () => vista === "disponibles" ? Panel.datos.CATALOGO : Panel.datos.PROXIMAMENTE;
  const listaDe = estado => estado === "disponibles" ? Panel.datos.CATALOGO : Panel.datos.PROXIMAMENTE;

  const TRANSMISIONES = ["", "Automática", "Manual", "CVT"];
  const COMBUSTIBLES = ["", "Gasolina", "Diésel", "Híbrido", "Eléctrico"];
  const TRACCIONES = ["", "4x2", "4x4", "AWD", "FWD", "RWD"];
  const TIPOS = ["SUV", "Sedán", "Hatchback", "Pickup", "Camioneta", "Coupé", "Van", "Deportivo"];

  /* ---------- Lista ---------- */

  function pintar() {
    const sec = document.getElementById("secInventario");
    const d = Panel.datos;
    const todos = [...d.CATALOGO, ...d.PROXIMAMENTE];
    const sinFoto = todos.filter(v => !v.foto).length;
    const sinPrecio = d.CATALOGO.filter(v => !(Number(v.precio) > 0)).length;

    const q = busqueda.trim().toLowerCase();
    const items = lista()
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => !q || [v.marca, v.modelo, v.version, v.anio, v.tipo].join(" ").toLowerCase().includes(q));

    sec.innerHTML = `
      <div class="p-resumen">
        <div class="p-dato"><b>${d.CATALOGO.length}</b><span>Disponibles</span></div>
        <div class="p-dato"><b>${d.PROXIMAMENTE.length}</b><span>Próximamente</span></div>
        <div class="p-dato${sinFoto ? " p-dato--alerta" : ""}"><b>${sinFoto}</b><span>Sin foto</span></div>
        <div class="p-dato${sinPrecio ? " p-dato--alerta" : ""}"><b>${sinPrecio}</b><span>Disponibles sin precio</span></div>
      </div>

      <div class="p-herramientas">
        <div class="p-segmento" role="group" aria-label="Tipo de inventario">
          <button type="button" data-vista="disponibles" aria-pressed="${vista === "disponibles"}">Disponibles <span>${d.CATALOGO.length}</span></button>
          <button type="button" data-vista="proximamente" aria-pressed="${vista === "proximamente"}">Próximamente <span>${d.PROXIMAMENTE.length}</span></button>
        </div>
        <div class="busqueda p-busqueda">
          ${UI.I.buscar}
          <label class="solo-lectores" for="pBuscar">Buscar vehículo</label>
          <input id="pBuscar" type="search" placeholder="Buscar marca, modelo o año" value="${UI.esc(busqueda)}" autocomplete="off">
        </div>
        <button class="btn btn--oro" type="button" id="agregar">${UI.I.mas}Agregar vehículo</button>
      </div>

      <p class="p-ayuda">El orden de esta lista es el orden en que aparecen en el sitio. Usa las flechas para mover un vehículo arriba o abajo.</p>

      <ul class="p-lista" id="pLista">
        ${items.length ? items.map(({ v, i }) => fila(v, i, lista().length)).join("") : `
          <li class="vacio">
            <img class="vacio__logo" src="img/marca/logo-kp-640.png" alt="" width="640" height="311">
            <h3>${q ? "No hay vehículos con esa búsqueda" : vista === "disponibles" ? "No hay vehículos disponibles" : "No hay vehículos en camino"}</h3>
            <p>${q ? "Prueba con otra palabra." : "Toca \"Agregar vehículo\" para subir el primero."}</p>
          </li>`}
      </ul>`;

    sec.querySelectorAll("[data-vista]").forEach(b => b.addEventListener("click", () => { vista = b.dataset.vista; pintar(); }));
    const buscar = sec.querySelector("#pBuscar");
    buscar.addEventListener("input", () => {
      busqueda = buscar.value;
      const pos = buscar.selectionStart;
      pintar();
      const nuevo = document.getElementById("pBuscar");
      nuevo.focus(); nuevo.setSelectionRange(pos, pos);
    });
    sec.querySelector("#agregar").addEventListener("click", () => abrirEditor(null));
    sec.querySelector("#pLista").addEventListener("click", accionFila);
  }

  function fila(v, i, total) {
    const esProximo = vista === "proximamente";
    const avisos = [];
    if (!v.foto) avisos.push("Sin foto");
    if (!esProximo && !(Number(v.precio) > 0)) avisos.push("Sin precio");
    const datos = [v.km !== "" && v.km !== undefined ? Number(v.km).toLocaleString("es-GT") + " km" : "", v.transmision, v.combustible].filter(Boolean);
    const nFotos = (v.foto ? 1 : 0) + (v.fotos || []).length;
    return `
    <li class="p-fila" data-i="${i}">
      <button class="p-fila__foto" data-accion="editar" aria-label="Editar ${UI.esc(v.marca)} ${UI.esc(v.modelo)}">
        ${UI.foto(v.foto, "")}
        ${nFotos > 1 ? `<span class="p-fila__nfotos">${UI.I.camara}${nFotos}</span>` : ""}
      </button>
      <div class="p-fila__info">
        <p class="ficha__marca">${UI.esc(v.marca)}${v.tipo ? " / " + UI.esc(v.tipo) : ""}</p>
        <h3>${UI.esc([v.modelo, v.version].filter(Boolean).join(" ")) || "Sin nombre"} <span>${UI.esc(v.anio)}</span></h3>
        <p class="p-fila__precio${Number(v.precio) > 0 ? "" : " p-fila__precio--pendiente"}">${UI.precio(v.precio)}${esProximo && v.llegada ? ` <small>· Llega ${UI.esc(v.llegada)}</small>` : ""}</p>
        ${datos.length ? `<p class="p-fila__datos">${datos.map(UI.esc).join(" · ")}</p>` : ""}
        ${avisos.length ? `<p class="p-fila__avisos">${avisos.map(a => `<span>${UI.I.alerta}${a}</span>`).join("")}</p>` : ""}
      </div>
      <div class="p-fila__acciones">
        <div class="p-fila__orden">
          <button class="p-icono" data-accion="subir" aria-label="Mover arriba" ${i === 0 ? "disabled" : ""}>${UI.I.arriba}</button>
          <button class="p-icono" data-accion="bajar" aria-label="Mover abajo" ${i === total - 1 ? "disabled" : ""}>${UI.I.abajo}</button>
        </div>
        <button class="btn btn--linea btn--chico" data-accion="editar">${UI.I.lapiz}Editar</button>
        <button class="btn btn--linea btn--chico" data-accion="mover">${UI.I.mover}${esProximo ? "Ya llegó" : "A próximos"}</button>
        <a class="p-icono" href="vehiculo.html?id=${encodeURIComponent(v.id)}" target="_blank" rel="noopener" aria-label="Ver en el sitio" title="Ver en el sitio">${UI.I.ojo}</a>
        <button class="p-icono p-icono--peligro" data-accion="quitar" aria-label="Quitar del sitio" title="Vendido / quitar">${UI.I.basura}</button>
      </div>
    </li>`;
  }

  async function accionFila(e) {
    const b = e.target.closest("[data-accion]");
    if (!b) return;
    const i = Number(b.closest(".p-fila").dataset.i);
    const l = lista();
    const v = l[i];
    const nombre = `${v.marca} ${v.modelo} ${v.anio}`.trim();

    switch (b.dataset.accion) {
      case "editar": abrirEditor(i); return;
      case "subir": [l[i - 1], l[i]] = [l[i], l[i - 1]]; break;
      case "bajar": [l[i + 1], l[i]] = [l[i], l[i + 1]]; break;
      case "mover": {
        const destino = vista === "disponibles" ? Panel.datos.PROXIMAMENTE : Panel.datos.CATALOGO;
        l.splice(i, 1);
        if (vista === "proximamente") v.llegada = "";
        destino.unshift(v);
        UI.aviso(vista === "disponibles" ? `${nombre} pasó a Próximamente.` : `${nombre} ahora está Disponible. Revisa que tenga precio.`);
        break;
      }
      case "quitar": {
        const ok = await UI.confirmar({
          titulo: `¿Quitar ${nombre}?`,
          texto: "Úsalo cuando el vehículo se venda. Desaparece del sitio al publicar y sus fotos se borran del repositorio.",
          si: "Quitar del sitio", peligro: true
        });
        if (!ok) return;
        l.splice(i, 1);
        UI.aviso(`${nombre} se quitará al publicar.`);
        break;
      }
    }
    Panel.cambio();
    pintar();
  }

  /* ---------- Editor ---------- */

  let edicion = null;   // { v, indice, estado, estadoOriginal }

  function abrirEditor(indice) {
    const nuevo = indice === null;
    const base = nuevo ? Datos.normalizar({ tipo: "SUV", anio: new Date().getFullYear() - 5 }) : lista()[indice];
    edicion = {
      v: JSON.parse(JSON.stringify(base)),
      indice, nuevo,
      estado: vista,
      estadoOriginal: vista
    };
    pintarEditor();
    document.getElementById("editor").showModal();
  }

  function opciones(valores, actual) {
    const lista = valores.includes(actual) || !actual ? valores : [...valores, actual];
    return lista.map(o => `<option value="${UI.esc(o)}"${o === actual ? " selected" : ""}>${o ? UI.esc(o) : "—"}</option>`).join("");
  }

  function campo(id, etiqueta, valor, extra = "") {
    return `<div class="campo"><label for="e_${id}">${etiqueta}</label><input id="e_${id}" name="${id}" value="${UI.esc(valor)}" ${extra}></div>`;
  }

  function pintarEditor() {
    const { v, nuevo, estado } = edicion;
    const d = document.getElementById("editor");
    const tipos = [...new Set([...TIPOS, ...[...Panel.datos.CATALOGO, ...Panel.datos.PROXIMAMENTE].map(x => x.tipo).filter(Boolean)])];
    const marcas = [...new Set([...Panel.datos.CATALOGO, ...Panel.datos.PROXIMAMENTE].map(x => x.marca).filter(Boolean))];

    d.innerHTML = `
    <form class="hoja__form" id="formEditor" novalidate>
      <header class="hoja__cabeza">
        <h2 id="editorTitulo">${nuevo ? "Agregar vehículo" : "Editar vehículo"}</h2>
        <button type="button" class="p-icono" id="eCerrar" aria-label="Cerrar sin guardar">${UI.I.cerrar}</button>
      </header>

      <div class="hoja__cuerpo">
        <fieldset class="p-grupo">
          <legend>Estado</legend>
          <div class="p-segmento p-segmento--bloque" role="radiogroup">
            <label><input type="radio" name="estado" value="disponibles" ${estado === "disponibles" ? "checked" : ""}><span>Disponible en el predio</span></label>
            <label><input type="radio" name="estado" value="proximamente" ${estado === "proximamente" ? "checked" : ""}><span>Próximamente (en camino)</span></label>
          </div>
        </fieldset>

        <fieldset class="p-grupo">
          <legend>Fotos</legend>
          <p class="p-ayuda">La primera foto es la principal (la que se ve en el catálogo). Puedes subir varias a la vez; se reducen solas para que el sitio cargue rápido.</p>
          <div class="p-fotos" id="eFotos"></div>
          <label class="p-subir" id="eSubir">
            <input type="file" id="eArchivos" accept="image/*" multiple>
            ${UI.I.camara}<span><b>Subir fotos</b><small>Toca para elegir o arrastra aquí</small></span>
          </label>
          <p class="p-progreso" id="eProgreso" hidden></p>
        </fieldset>

        <fieldset class="p-grupo">
          <legend>Datos principales</legend>
          <div class="p-rejilla">
            ${campo("marca", "Marca *", v.marca, `list="listaMarcas" required autocomplete="off"`)}
            ${campo("modelo", "Modelo *", v.modelo, `required autocomplete="off"`)}
            ${campo("version", "Versión", v.version, `placeholder="Ej. GT, Touring, LX"`)}
            ${campo("anio", "Año *", v.anio, `type="number" inputmode="numeric" min="1950" max="${new Date().getFullYear() + 1}" required`)}
            <div class="campo"><label for="e_precio">Precio (Q)</label>
              <input id="e_precio" name="precio" inputmode="numeric" value="${Number(v.precio) > 0 ? Number(v.precio).toLocaleString("es-GT") : ""}" placeholder="Vacío = Precio por confirmar">
            </div>
            <div class="campo"><label for="e_tipo">Tipo</label>
              <select id="e_tipo" name="tipo">${opciones(tipos, v.tipo)}</select>
            </div>
            <div class="campo campo--llegada" ${estado === "proximamente" ? "" : "hidden"}>
              <label for="e_llegada">Llegada estimada</label>
              <input id="e_llegada" name="llegada" value="${UI.esc(v.llegada || "")}" placeholder="Ej. en noviembre">
            </div>
          </div>
          <datalist id="listaMarcas">${marcas.map(m => `<option value="${UI.esc(m)}">`).join("")}</datalist>
        </fieldset>

        <fieldset class="p-grupo">
          <legend>Detalles <small>(opcional: lo que dejes vacío no se muestra)</small></legend>
          <div class="p-rejilla">
            ${campo("km", "Kilometraje", v.km === "" ? "" : Number(v.km).toLocaleString("es-GT"), `inputmode="numeric" placeholder="Ej. 85,000"`)}
            <div class="campo"><label for="e_transmision">Transmisión</label><select id="e_transmision" name="transmision">${opciones(TRANSMISIONES, v.transmision)}</select></div>
            <div class="campo"><label for="e_combustible">Combustible</label><select id="e_combustible" name="combustible">${opciones(COMBUSTIBLES, v.combustible)}</select></div>
            ${campo("motor", "Motor", v.motor, `placeholder="Ej. 2.5L 4 cilindros"`)}
            <div class="campo"><label for="e_traccion">Tracción</label><select id="e_traccion" name="traccion">${opciones(TRACCIONES, v.traccion)}</select></div>
            ${campo("color", "Color", v.color)}
          </div>
          <div class="campo">
            <label for="e_descripcion">Descripción</label>
            <textarea id="e_descripcion" name="descripcion" rows="5" placeholder="Equipamiento, estado, detalles importantes…">${UI.esc(v.descripcion)}</textarea>
          </div>
        </fieldset>
        <p class="campo__error" id="eError" role="alert"></p>
      </div>

      <footer class="hoja__pie">
        <button type="button" class="btn btn--linea" id="eCancelar">Cancelar</button>
        <button type="submit" class="btn btn--oro">${nuevo ? "Agregar al inventario" : "Guardar cambios"}</button>
      </footer>
    </form>`;

    pintarFotos();

    const form = d.querySelector("#formEditor");
    form.querySelectorAll('input[name="estado"]').forEach(r => r.addEventListener("change", () => {
      edicion.estado = r.value;
      form.querySelector(".campo--llegada").hidden = r.value !== "proximamente";
    }));
    ["e_precio", "e_km"].forEach(id => {
      const inp = form.querySelector("#" + id);
      inp.addEventListener("input", () => {
        const n = inp.value.replace(/[^\d]/g, "");
        inp.value = n ? Number(n).toLocaleString("es-GT") : "";
      });
    });
    form.querySelector("#eCerrar").addEventListener("click", cerrarEditor);
    form.querySelector("#eCancelar").addEventListener("click", cerrarEditor);
    form.addEventListener("submit", guardarEditor);

    const archivos = form.querySelector("#eArchivos");
    archivos.addEventListener("change", () => { subirFotos([...archivos.files]); archivos.value = ""; });
    const zona = form.querySelector("#eSubir");
    ["dragenter", "dragover"].forEach(t => zona.addEventListener(t, e => { e.preventDefault(); zona.classList.add("p-subir--encima"); }));
    ["dragleave", "drop"].forEach(t => zona.addEventListener(t, e => { e.preventDefault(); zona.classList.remove("p-subir--encima"); }));
    zona.addEventListener("drop", e => subirFotos([...e.dataTransfer.files]));
  }

  function fotosDe(v) { return [v.foto, ...(v.fotos || [])].filter(Boolean); }
  function ponerFotos(v, arr) { v.foto = arr[0] || ""; v.fotos = arr.slice(1); }

  function pintarFotos() {
    const caja = document.getElementById("eFotos");
    const fotos = fotosDe(edicion.v);
    caja.innerHTML = fotos.map((f, i) => `
      <div class="p-foto" data-i="${i}">
        ${UI.foto(f, "")}
        ${i === 0 ? `<span class="p-foto__principal">Principal</span>` : ""}
        <div class="p-foto__acciones">
          ${i > 0 ? `<button type="button" class="p-icono" data-f="principal" aria-label="Hacer principal" title="Hacer principal">${UI.I.estrella}</button>` : ""}
          <button type="button" class="p-icono" data-f="izq" aria-label="Mover antes" ${i === 0 ? "disabled" : ""}>${UI.I.izq}</button>
          <button type="button" class="p-icono" data-f="der" aria-label="Mover después" ${i === fotos.length - 1 ? "disabled" : ""}>${UI.I.der}</button>
          <button type="button" class="p-icono p-icono--peligro" data-f="quitar" aria-label="Quitar foto">${UI.I.basura}</button>
        </div>
      </div>`).join("");
    caja.onclick = e => {
      const b = e.target.closest("[data-f]");
      if (!b) return;
      const i = Number(b.closest(".p-foto").dataset.i);
      const arr = fotosDe(edicion.v);
      if (b.dataset.f === "principal") arr.unshift(arr.splice(i, 1)[0]);
      if (b.dataset.f === "izq") [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      if (b.dataset.f === "der") [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      if (b.dataset.f === "quitar") arr.splice(i, 1);
      ponerFotos(edicion.v, arr);
      pintarFotos();
    };
  }

  async function subirFotos(archivos) {
    if (!archivos.length) return;
    const prog = document.getElementById("eProgreso");
    prog.hidden = false;
    const form = document.getElementById("formEditor");
    const prefijo = [form.marca.value, form.modelo.value, form.anio.value].filter(Boolean).join("-") || "auto";
    let hechas = 0;
    for (const a of archivos) {
      prog.textContent = `Preparando foto ${hechas + 1} de ${archivos.length}…`;
      try {
        const img = await Imagenes.preparar(a, ADMIN.anchoFotoAuto);
        const ruta = Imagenes.nombreNuevo(ADMIN.carpetaAutos, prefijo);
        await Imagenes.guardarPendiente(ruta, img.dataUrl);
        ponerFotos(edicion.v, [...fotosDe(edicion.v), ruta]);
        hechas++;
        pintarFotos();
      } catch (err) {
        UI.aviso(err.message, "error");
      }
    }
    prog.textContent = `${hechas} foto${hechas === 1 ? "" : "s"} lista${hechas === 1 ? "" : "s"}. Se suben al sitio cuando toques "Publicar cambios".`;
  }

  function cerrarEditor() {
    document.getElementById("editor").close();
    edicion = null;
  }

  function guardarEditor(e) {
    e.preventDefault();
    const f = e.target;
    const v = edicion.v;
    const err = document.getElementById("eError");
    const faltan = [];
    if (!f.marca.value.trim()) faltan.push("marca");
    if (!f.modelo.value.trim()) faltan.push("modelo");
    if (!f.anio.value.trim()) faltan.push("año");
    if (faltan.length) {
      err.textContent = "Falta llenar: " + faltan.join(", ") + ".";
      const primero = { marca: f.marca, modelo: f.modelo, "año": f.anio }[faltan[0]];
      if (primero) primero.focus();
      return;
    }
    ["marca", "modelo", "version", "tipo", "transmision", "combustible", "motor", "traccion", "color", "descripcion"]
      .forEach(c => { v[c] = f[c].value.trim(); });
    v.anio = Number(f.anio.value) || "";
    v.precio = Number(f.precio.value.replace(/[^\d]/g, "")) || 0;
    v.km = f.km.value.replace(/[^\d]/g, "") ? Number(f.km.value.replace(/[^\d]/g, "")) : "";
    v.llegada = edicion.estado === "proximamente" ? f.llegada.value.trim() : "";

    const todos = [...Panel.datos.CATALOGO, ...Panel.datos.PROXIMAMENTE];
    if (edicion.nuevo) v.id = Datos.crearId(v, todos.map(x => x.id));

    const origen = listaDe(edicion.estadoOriginal);
    const destino = listaDe(edicion.estado);
    const nombre = `${v.marca} ${v.modelo} ${v.anio}`;
    if (edicion.nuevo) {
      destino.unshift(v);
      UI.aviso(`${nombre} agregado. Toca "Publicar cambios" para que aparezca en el sitio.`);
    } else if (origen === destino) {
      origen[edicion.indice] = v;
      UI.aviso(`${nombre} actualizado.`);
    } else {
      origen.splice(edicion.indice, 1);
      destino.unshift(v);
      UI.aviso(`${nombre} actualizado y movido a ${edicion.estado === "disponibles" ? "Disponibles" : "Próximamente"}.`);
    }
    vista = edicion.estado;
    cerrarEditor();
    Panel.cambio();
    pintar();
  }

  // cerrar con Esc descarta lo escrito en el formulario (igual que "Cancelar")
  document.getElementById("editor").addEventListener("cancel", () => { edicion = null; });

  return { pintar };
})();
