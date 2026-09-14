// ============================================================
// UNIDAD.JS — Central de Radio
// Pantalla de consulta de disponibilidad operativa
// ============================================================


// ==================== DATOS DE EJEMPLO ====================

const PATRULLEROS_EJEMPLO_UNIDAD = [
    {
        id: 'P-001',
        nombre: 'Patrullero 01',
        unidad: 'CAI Norte',
        estado: 'disponible',
        atencionActualId: null,
        ultimaActualizacion: '18:40'
    },
    {
        id: 'P-002',
        nombre: 'Patrullero 02',
        unidad: 'CAI Centro',
        estado: 'en_camino',
        atencionActualId: 'WL-2026-00119',
        ultimaActualizacion: '18:38'
    },
    {
        id: 'P-003',
        nombre: 'Patrullero 03',
        unidad: 'CAI Sur',
        estado: 'en_sitio',
        atencionActualId: 'WL-2026-00121',
        ultimaActualizacion: '18:34'
    },
    {
        id: 'P-004',
        nombre: 'Patrullero 04',
        unidad: 'CAI Norte',
        estado: 'fuera_servicio',
        atencionActualId: null,
        ultimaActualizacion: '17:05'
    },
    {
        id: 'P-005',
        nombre: 'Patrullero 05',
        unidad: 'CAI Centro',
        estado: 'disponible',
        atencionActualId: null,
        ultimaActualizacion: '18:41'
    },
    {
        id: 'P-006',
        nombre: 'Patrullero 06',
        unidad: 'CAI Sur',
        estado: 'ocupado',
        atencionActualId: null,
        ultimaActualizacion: '18:20'
    },
    {
        id: 'P-007',
        nombre: 'Patrullero 07',
        unidad: 'CAI Occidente',
        estado: 'disponible',
        atencionActualId: null,
        ultimaActualizacion: '18:42'
    }
];


// ==================== PROVEEDOR DE DATOS ====================

function obtenerPatrullerosUnidad() {
    return Promise.resolve(PATRULLEROS_EJEMPLO_UNIDAD);
}


// ==================== ESTADO ====================

let PATRULLEROS_UNIDAD = [];

const estadoUnidad = {
    filtroTexto: '',
    filtroUnidad: 'todas',
    filtroEstado: 'todos'
};

let modalDetallePatrullero = null;


// ==================== UTILIDADES ====================

const ETIQUETAS_ESTADO = {
    disponible: 'Disponible',
    en_camino: 'En camino',
    en_sitio: 'En el sitio',
    ocupado: 'Ocupado',
    fuera_servicio: 'Fuera de servicio'
};


function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}


function iniciales(nombre) {
    return nombre
        ?.split(' ')
        .filter(Boolean)
        .slice(-1)[0]
        ?.slice(0, 2)
        .toUpperCase() || '--';
}


function pillEstado(estado) {
    return `
        <span class="unidad-estado-pill unidad-estado-${estado}">
            ${ETIQUETAS_ESTADO[estado] || estado}
        </span>
    `;
}


// ==================== KPIs ====================

function renderKpisUnidad() {

    const contenedor = document.getElementById('kpisUnidad');

    if (!contenedor) return;

    const total = PATRULLEROS_UNIDAD.length;

    const disponibles =
        PATRULLEROS_UNIDAD.filter(
            p => p.estado === 'disponible'
        ).length;

    const enOperacion =
        PATRULLEROS_UNIDAD.filter(
            p =>
                p.estado === 'en_camino' ||
                p.estado === 'en_sitio'
        ).length;

    const fueraServicio =
        PATRULLEROS_UNIDAD.filter(
            p => p.estado === 'fuera_servicio'
        ).length;


    const tarjetas = [
        {
            valor: total,
            label: 'Total de patrulleros',
            clase: 'kpi-blue-dash',
            icono: 'bi-people'
        },
        {
            valor: disponibles,
            label: 'Disponibles ahora',
            clase: 'kpi-green-dash',
            icono: 'bi-check-circle'
        },
        {
            valor: enOperacion,
            label: 'En operación',
            clase: 'kpi-amber-dash',
            icono: 'bi-signpost-split'
        },
        {
            valor: fueraServicio,
            label: 'Fuera de servicio',
            clase: 'kpi-red-dash',
            icono: 'bi-slash-circle'
        }
    ];


    contenedor.innerHTML = tarjetas.map(t => `
        <div class="col-6 col-lg-3">

            <div class="kpi-dash ${t.clase}">

                <i class="bi ${t.icono} kpi-icon-dash"></i>

                <div class="kpi-num-dash">
                    ${t.valor}
                </div>

                <div class="kpi-label-dash">
                    ${t.label}
                </div>

            </div>

        </div>
    `).join('');
}


// ==================== FILTRO DE UNIDADES ====================

function poblarFiltroUnidades() {

    const select = document.getElementById('filtroUnidad');

    if (!select) return;

    const unidades = [
        ...new Set(
            PATRULLEROS_UNIDAD.map(p => p.unidad)
        )
    ].sort();


    select.innerHTML =
        '<option value="todas">Todas las unidades</option>' +
        unidades.map(unidad => `
            <option value="${escaparHtml(unidad)}">
                ${escaparHtml(unidad)}
            </option>
        `).join('');
}


// ==================== FILTRADO ====================

function obtenerPatrullerosFiltrados() {

    const texto =
        estadoUnidad.filtroTexto
            .trim()
            .toLowerCase();


    return PATRULLEROS_UNIDAD.filter(p => {

        const coincideUnidad =
            estadoUnidad.filtroUnidad === 'todas' ||
            p.unidad === estadoUnidad.filtroUnidad;


        const coincideEstado =
            estadoUnidad.filtroEstado === 'todos' ||
            p.estado === estadoUnidad.filtroEstado;


        const coincideTexto =
            !texto ||
            `${p.id} ${p.nombre} ${p.unidad}`
                .toLowerCase()
                .includes(texto);


        return coincideUnidad &&
               coincideEstado &&
               coincideTexto;
    });
}


// ==================== TABLA ====================

function crearFilaPatrullero(p) {

    const atencion = p.atencionActualId
        ? `
            <span class="unidad-atencion-link">
                #${escaparHtml(p.atencionActualId)}
            </span>
        `
        : `
            <span class="unidad-atencion-vacia">
                —
            </span>
        `;


    return `
        <tr>

            <td>

                <div class="unidad-patrullero-cel">

                    <div class="unidad-avatar">
                        ${iniciales(p.nombre)}
                    </div>

                    <div>

                        <div class="unidad-nombre">
                            ${escaparHtml(p.nombre)}
                        </div>

                        <div class="unidad-id">
                            ${escaparHtml(p.id)}
                        </div>

                    </div>

                </div>

            </td>

            <td>
                ${escaparHtml(p.unidad)}
            </td>

            <td>
                ${pillEstado(p.estado)}
            </td>

            <td>
                ${atencion}
            </td>

            <td class="text-end">

                <button
                    type="button"
                    class="unidad-btn-detalle"
                    data-detalle="${p.id}"
                    aria-label="Ver detalle"
                >
                    <i class="bi bi-eye"></i>
                </button>

            </td>

        </tr>
    `;
}


function renderTablaUnidad() {

    const cuerpo =
        document.getElementById('cuerpoTablaPatrulleros');

    const vacio =
        document.getElementById('unidadEmpty');

    if (!cuerpo || !vacio) return;


    const filtrados =
        obtenerPatrullerosFiltrados();


    cuerpo.innerHTML =
        filtrados.map(crearFilaPatrullero).join('');


    vacio.classList.toggle(
        'd-none',
        filtrados.length > 0
    );


    document
        .querySelectorAll('[data-detalle]')
        .forEach(boton => {

            boton.addEventListener('click', () => {

                abrirDetallePatrullero(
                    boton.dataset.detalle
                );

            });

        });
}


// ==================== MODAL ====================

function abrirDetallePatrullero(id) {

    const patrullero =
        PATRULLEROS_UNIDAD.find(
            p => p.id === id
        );

    if (!patrullero || !modalDetallePatrullero) return;


    const atencion =
        patrullero.atencionActualId
            ? `Caso #${escaparHtml(patrullero.atencionActualId)}`
            : 'Sin atención asignada';


    const contenido =
        document.getElementById('modalDetalleBody');

    if (!contenido) return;


    contenido.innerHTML = `

        <div class="d-flex align-items-center gap-3 mb-3">

            <div class="unidad-avatar unidad-avatar-grande">
                ${iniciales(patrullero.nombre)}
            </div>

            <div>

                <div class="unidad-nombre unidad-nombre-grande">
                    ${escaparHtml(patrullero.nombre)}
                </div>

                <div class="unidad-id">
                    ${escaparHtml(patrullero.id)}
                </div>

            </div>

        </div>


        <div class="unidad-detalle-fila">

            <span class="unidad-detalle-label">
                Unidad / CAI
            </span>

            <span>
                ${escaparHtml(patrullero.unidad)}
            </span>

        </div>


        <div class="unidad-detalle-fila">

            <span class="unidad-detalle-label">
                Estado
            </span>

            ${pillEstado(patrullero.estado)}

        </div>


        <div class="unidad-detalle-fila">

            <span class="unidad-detalle-label">
                Atención actual
            </span>

            <span>
                ${atencion}
            </span>

        </div>


        <div class="unidad-detalle-fila">

            <span class="unidad-detalle-label">
                Última actualización
            </span>

            <span>
                ${escaparHtml(patrullero.ultimaActualizacion || '—')}
            </span>

        </div>
    `;


    modalDetallePatrullero.show();
}


// ==================== EVENTOS ====================

function configurarFiltros() {

    const buscar =
        document.getElementById('buscarPatrullero');

    const unidad =
        document.getElementById('filtroUnidad');

    const estado =
        document.getElementById('filtroEstado');


    buscar?.addEventListener('input', e => {

        estadoUnidad.filtroTexto = e.target.value;

        renderTablaUnidad();

    });


    unidad?.addEventListener('change', e => {

        estadoUnidad.filtroUnidad = e.target.value;

        renderTablaUnidad();

    });


    estado?.addEventListener('change', e => {

        estadoUnidad.filtroEstado = e.target.value;

        renderTablaUnidad();

    });
}


// ==================== INICIO ====================

async function iniciarUnidad() {

    try {

        PATRULLEROS_UNIDAD =
            await obtenerPatrullerosUnidad();

    } catch (error) {

        console.error(
            'Error al cargar patrulleros:',
            error
        );

        PATRULLEROS_UNIDAD = [];

    }


    const modal =
        document.getElementById(
            'modalDetallePatrullero'
        );


    if (
        modal &&
        typeof bootstrap !== 'undefined'
    ) {
        modalDetallePatrullero =
            new bootstrap.Modal(modal);
    }


    poblarFiltroUnidades();
    configurarFiltros();
    renderKpisUnidad();
    renderTablaUnidad();
}


document.addEventListener(
    'DOMContentLoaded',
    iniciarUnidad
);