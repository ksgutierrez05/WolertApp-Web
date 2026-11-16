using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;

using WolertApp.DTOs;
using WolertApp.Helpers;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AtencionesAlertaController : ControllerBase
    {
        private const string RolesLectura = "ADMIN,ADMIN_POLICIA,CENTRAL_POLICIA,POLICIA";
        private const string RolesEscritura = "ADMIN,ADMIN_POLICIA,CENTRAL_POLICIA,POLICIA";
        private const string RolesBorrar = "ADMIN,ADMIN_POLICIA";
        private readonly AppDBContext _context;

        public AtencionesAlertaController(AppDBContext context) => _context = context;

        private static IQueryable<AtencionAlertaDto> Proyectar(IQueryable<AtencionAlerta> q) =>
            q.Select(a => new AtencionAlertaDto
            {
                IdAtencion = a.IdAtencion,
                IdAlerta = a.IdAlerta,
                IdUnidad = a.IdUnidad,
                UnidadNombre = a.Unidad != null ? a.Unidad.Nombre : null,
                FechaAtencion = a.FechaAtencion,
                EstadoFinal = a.EstadoFinal,
                Descripcion = a.Descripcion,
                IdTipoArma = a.IdTipoArma,
                TipoArmaNombre = a.TipoArma != null ? a.TipoArma.Nombre : null,
                IdMedioTransporte = a.IdMedioTransporte,
                MedioTransporteNombre = a.MedioTransporte != null ? a.MedioTransporte.Nombre : null,
                Observacion = a.Observacion,
                IdPolicia = a.IdPolicia,
                UsuarioRegistra = a.UsuarioRegistra,
                IdAsignacion = a.IdAsignacion
            });

        private static string? NormalizarEstado(string estado)
        {
            var e = estado.Trim().ToUpper();
            return e == "EN_PROCESO" || e == "FINALIZADA" ? e : null;
        }

        [HttpGet]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<AtencionAlertaDto>>> GetAll()
            => Ok(await Proyectar(_context.AtencionesAlerta.AsNoTracking().OrderByDescending(a => a.FechaAtencion)).ToListAsync());

        [HttpGet("alerta/{idAlerta:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<AtencionAlertaDto>>> GetPorAlerta(int idAlerta)
            => Ok(await Proyectar(_context.AtencionesAlerta.AsNoTracking()
                    .Where(a => a.IdAlerta == idAlerta).OrderByDescending(a => a.FechaAtencion)).ToListAsync());

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<AtencionAlertaDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.AtencionesAlerta.AsNoTracking().Where(a => a.IdAtencion == id)).FirstOrDefaultAsync();
            return dto == null ? NotFound() : Ok(dto);
        }

        // CREAR: PKG_ALERTAS.PR_INSERTAR_ATENCION (recibe NOMBRES, no IDs, y no hace COMMIT -> transacción en el helper).
        // Exige una única asignación policial EN_ATENCION para esa alerta y unidad.
        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AtencionAlertaDto>> Create([FromBody] AtencionAlertaCrearDto dto)
        {
            var estado = NormalizarEstado(dto.EstadoFinal);
            if (estado == null) return BadRequest("El estado debe ser EN_PROCESO o FINALIZADA.");

            var unidad = await _context.Unidades.FindAsync(dto.IdUnidad);
            if (unidad == null || string.IsNullOrWhiteSpace(unidad.Nombre)) return BadRequest("La unidad policial no existe.");

            string? arma = null, medio = null;
            if (dto.IdTipoArma != null)
            {
                arma = (await _context.TiposArma.FindAsync(dto.IdTipoArma))?.Nombre;
                if (arma == null) return BadRequest("El tipo de arma no existe.");
            }
            if (dto.IdMedioTransporte != null)
            {
                medio = (await _context.MediosTransporte.FindAsync(dto.IdMedioTransporte))?.Nombre;
                if (medio == null) return BadRequest("El medio de transporte no existe.");
            }

            // Si registra un policía, el policía es él mismo; si registra una central/admin, se usa el del body.
            int? idPolicia = User.IsInRole("POLICIA") ? User.IdUsuario() : dto.IdPolicia;

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_INSERTAR_ATENCION", p =>
            {
                p.Agregar("p_id_alerta", OracleDbType.Int32, dto.IdAlerta);
                p.Agregar("p_nombre_unidad", OracleDbType.Varchar2, unidad.Nombre);
                p.Agregar("p_estado_final", OracleDbType.Varchar2, estado);
                p.Agregar("p_descripcion", OracleDbType.Varchar2, dto.Descripcion?.Trim());
                p.Agregar("p_tipo_arma", OracleDbType.Varchar2, arma);
                p.Agregar("p_medio_transporte", OracleDbType.Varchar2, medio);
                p.Agregar("p_observacion", OracleDbType.Varchar2, dto.Observacion?.Trim());
                p.Agregar("p_id_policia", OracleDbType.Int32, idPolicia);
            });
            if (error != null) return BadRequest(error);

            var creada = await Proyectar(_context.AtencionesAlerta.AsNoTracking()
                    .Where(a => a.IdAlerta == dto.IdAlerta && a.IdUnidad == dto.IdUnidad)
                    .OrderByDescending(a => a.IdAtencion)).FirstOrDefaultAsync();
            if (creada == null) return StatusCode(500, "La atención se registró pero no se pudo leer de vuelta.");
            return CreatedAtAction(nameof(GetById), new { id = creada.IdAtencion }, creada);
        }

        // ACTUALIZAR: PKG_ALERTAS.PR_ACTUALIZAR_ATENCION (no deja modificar una atención ya FINALIZADA).
        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AtencionAlertaDto>> Update(int id, [FromBody] AtencionAlertaActualizarDto dto)
        {
            if (!await _context.AtencionesAlerta.AnyAsync(a => a.IdAtencion == id)) return NotFound();

            var estado = NormalizarEstado(dto.EstadoFinal);
            if (estado == null) return BadRequest("El estado debe ser EN_PROCESO o FINALIZADA.");

            string? arma = null, medio = null;
            if (dto.IdTipoArma != null)
            {
                arma = (await _context.TiposArma.FindAsync(dto.IdTipoArma))?.Nombre;
                if (arma == null) return BadRequest("El tipo de arma no existe.");
            }
            if (dto.IdMedioTransporte != null)
            {
                medio = (await _context.MediosTransporte.FindAsync(dto.IdMedioTransporte))?.Nombre;
                if (medio == null) return BadRequest("El medio de transporte no existe.");
            }

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_ACTUALIZAR_ATENCION", p =>
            {
                p.Agregar("p_id_atencion", OracleDbType.Int32, id);
                p.Agregar("p_estado_final", OracleDbType.Varchar2, estado);
                p.Agregar("p_descripcion", OracleDbType.Varchar2, dto.Descripcion?.Trim());
                p.Agregar("p_tipo_arma", OracleDbType.Varchar2, arma);
                p.Agregar("p_medio_transporte", OracleDbType.Varchar2, medio);
                p.Agregar("p_observacion", OracleDbType.Varchar2, dto.Observacion?.Trim());
            });
            if (error != null) return BadRequest(error);

            var resp = await Proyectar(_context.AtencionesAlerta.AsNoTracking().Where(a => a.IdAtencion == id)).FirstAsync();
            return Ok(resp);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesBorrar)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.AtencionesAlerta.FirstOrDefaultAsync(a => a.IdAtencion == id);
            if (entidad == null) return NotFound();
            try
            {
                _context.AtencionesAlerta.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException) { return Conflict("No se puede eliminar la atención porque está en uso."); }
        }
    }
}