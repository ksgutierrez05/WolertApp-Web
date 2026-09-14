const CLAVE_ASIGNADOS = "wolertapp_casos_asignados_pd";

// ---------- Casos sin asignar ----------

const ObtenerAsignados = () => {
  const guardado = localStorage.getItem(CLAVE_ASIGNADOS);
  return guardado ? JSON.parse(guardado) : [];
};

const GuardarAsignados = (idsAsignados) => {
  localStorage.setItem(CLAVE_ASIGNADOS, JSON.stringify(idsAsignados));
};

const ActualizarMensajeVacio = () => {
  const filasVisibles = document.querySelectorAll("#tablaSinAsignar tbody tr:not(.d-none)");
  document.getElementById("mensajeSinAsignarVacio").classList.toggle("d-none", filasVisibles.length > 0);
};

const AplicarAsignados = () => {
  const idsAsignados = ObtenerAsignados();
  idsAsignados.forEach((id) => {
    const fila = document.querySelector(`#tablaSinAsignar tr[data-id="${id}"]`);
    if (fila) fila.classList.add("d-none");
  });
  ActualizarMensajeVacio();
};

const AsignarCaso = (id) => {
  const idsAsignados = ObtenerAsignados();
  if (!idsAsignados.includes(id)) {
    idsAsignados.push(id);
    GuardarAsignados(idsAsignados);
  }

  const fila = document.querySelector(`#tablaSinAsignar tr[data-id="${id}"]`);
  if (fila) {
    fila.classList.add("asignado-pd");
    setTimeout(() => {
      fila.classList.add("d-none");
      ActualizarMensajeVacio();
    }, 200);
  }
};

document.querySelectorAll(".assign-btn-pd").forEach((boton) => {
  boton.addEventListener("click", () => AsignarCaso(boton.dataset.id));
});

AplicarAsignados();

// ---------- Filtro de "Últimos casos de tránsito" ----------

const FiltrarCasosRecientes = (tipo) => {
  const filas = document.querySelectorAll("#tablaCasosRecientes tbody tr");
  let visibles = 0;

  filas.forEach((fila) => {
    const coincide = tipo === "todas" || fila.dataset.tipo === tipo;
    fila.classList.toggle("d-none", !coincide);
    if (coincide) visibles += 1;
  });

  document.getElementById("mensajeCasosVacio").classList.toggle("d-none", visibles > 0);
};

document.querySelectorAll("#tabsCasos .tab-pd").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#tabsCasos .tab-pd").forEach((t) => t.classList.remove("active-pd"));
    tab.classList.add("active-pd");
    FiltrarCasosRecientes(tab.dataset.tipo);
  });
});