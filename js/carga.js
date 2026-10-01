/* =============================================================
   IMPORTADORA KP — PANTALLA DE CARGA
   Muestra el logo mientras cargan las fotos grandes de la portada.
   Solo aparece la primera vez por visita y nunca más de 2.5 s.
   ============================================================= */

(function () {
  let yaVisto = false;
  try { yaVisto = sessionStorage.getItem("kp-carga") === "1"; } catch (e) { /* sin almacenamiento: se muestra igual */ }
  if (yaVisto) return;

  const capa = document.createElement("div");
  capa.className = "carga";
  capa.setAttribute("role", "status");
  capa.setAttribute("aria-label", "Cargando Importadora KP");
  capa.innerHTML = `
    <div class="carga__caja">
      <img src="${CONFIG.logoGrande || CONFIG.logo}" alt="${CONFIG.nombre}">
      <div class="carga__barra"><span></span></div>
    </div>`;
  document.body.appendChild(capa);

  const inicio = Date.now();
  let cerrada = false;
  function cerrar() {
    if (cerrada) return;
    cerrada = true;
    // deja ver el logo al menos 0.9 s para que no parpadee
    const espera = Math.max(0, 900 - (Date.now() - inicio));
    setTimeout(() => {
      capa.classList.add("carga--fuera");
      setTimeout(() => capa.remove(), 700);
    }, espera);
    try { sessionStorage.setItem("kp-carga", "1"); } catch (e) { /* nada */ }
  }

  window.addEventListener("load", cerrar);
  setTimeout(cerrar, 2500);
})();
