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
    public class AtencionesTransitoController : ControllerBase
    {
        private const string RolesLectura = "ADMIN,ADMIN_TRANSITO,CENTRAL_TRANSITO,AGENTE_TRANSITO";
        private const string RolesEscritura = "ADMIN,ADMIN_TRANSITO,CENTRAL_TRANSITO,AGENTE_TRANSITO";
        private const string RolesBorrar = "ADMIN,ADMIN_TRANSITO";
        private readonly AppDBContext _context;

        public AtencionesTransitoController(AppDBContext context) => _context = context;

        private static IQueryable<AtencionTransitoDto> Proyectar(IQueryable<AtencionTransito> q) =>
            q.Select(a => new AtencionTransitoDto
            {
                IdAtencionTransito = a.IdAtencionTransito,
                IdAlerta = a.IdAlerta,
                IdUnidadTransito = a.IdUnidadTransito,
                IdAgenteTransito = a.IdAgenteTransito,
                FechaAtencion = a.FechaAtencion,
                EstadoFinal = a.EstadoFinal,
                Descripcion = a.Descripcion,
                Observacion = a.Observacion,
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
        public async Task<ActionResult<IEnumerable<AtencionTransitoDto>>> GetAll()
            => Ok(await Proyectar(_context.AtencionesTransito.AsNoTracking().OrderByDescending(a => a.FechaAtencion)).ToListAsync());

        [HttpGet("alerta/{idAlerta:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<AtencionTransitoDto>>> GetPorAlerta(int idAlerta)
            => Ok(await Proyectar(_context.AtencionesTransito.AsNoTracking()
                    .Where(a => a.IdAlerta == idAlerta).OrderByDescending(a => a.FechaAtencion)).ToListAsync());

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<AtencionTransitoDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.AtencionesTransito.AsNoTracking().Where(a => a.IdAtencionTransito == id)).FirstOrDefaultAsync();
            return dto == null ? NotFound() : Ok(dto);
        }

        // CREAR: PKG_ALERTAS.PR_INSERTAR_ATENCION_TRANSITO (sin COMMIT -> transacción en el helper).
        // Exige una asignación de tránsito EN_ATENCION y que el agente pertenezca a la unidad.
        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AtencionTransitoDto>> Create([FromBody] AtencionTransitoRequestDto dto)
        {
            var estado = NormalizarEstado(dto.EstadoFinal);
            if (estado == null) return BadRequest("El estado debe ser EN_PROCESO o FINALIZADA.");

            int? idAgente = User.IsInRole("AGENTE_TRANSITO") ? User.IdUsuario() : dto.IdAgenteTransito;
            if (idAgente == null) return BadRequest("Debes indicar el agente de tránsito (idAgenteTransito).");

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_INSERTAR_ATENCION_TRANSITO", p =>
            {
                p.Agregar("p_id_alerta", OracleDbType.Int32, dto.IdAlerta);
                p.Agregar("p_id_unidad_transito", OracleDbType.Int32, dto.IdUnidadTransito);
                p.Agregar("p_id_agente_transito", OracleDbType.Int32, idAgente);
                p.Agregar("p_fecha_atencion", OracleDbType.TimeStamp, dto.FechaAtencion);
                p.Agregar("p_estado_final", OracleDbType.Varchar2, estado);
                p.Agregar("p_descripcion", OracleDbType.Varchar2, dto.Descripcion?.Trim());
                p.Agregar("p_observacion", OracleDbType.Varchar2, dto.Observacion?.Trim());
            });
            if (error != null) return BadRequest(error);

            var creada = await Proyectar(_context.AtencionesTransito.AsNoTracking()
                    .Where(a => a.IdAlerta == dto.IdAlerta && a.IdUnidadTransito == dto.IdUnidadTransito)
                    .OrderByDescending(a => a.IdAtencionTransito)).FirstOrDefaultAsync();
            if (creada == null) return StatusCode(500, "La atención se registró pero no se pudo leer de vuelta.");
            return CreatedAtAction(nameof(GetById), new { id = creada.IdAtencionTransito }, creada);
        }

        // ACTUALIZAR: PKG_ALERTAS.PR_ACTUALIZAR_ATENCION_TRANSITO
        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AtencionTransitoDto>> Update(int id, [FromBody] AtencionTransitoRequestDto dto)
        {
            var actual = await _context.AtencionesTransito.AsNoTracking().FirstOrDefaultAsync(a => a.IdAtencionTransito == id);
            if (actual == null) return NotFound();

            var estado = NormalizarEstado(dto.EstadoFinal);
            if (estado == null) return BadRequest("El estado debe ser EN_PROCESO o FINALIZADA.");

            int? idAgente = User.IsInRole("AGENTE_TRANSITO") ? User.IdUsuario() : (dto.IdAgenteTransito ?? actual.IdAgenteTransito);

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_ACTUALIZAR_ATENCION_TRANSITO", p =>
            {
                p.Agregar("p_id_atencion_transito", OracleDbType.Int32, id);
                p.Agregar("p_id_alerta", OracleDbType.Int32, dto.IdAlerta);
                p.Agregar("p_id_unidad_transito", OracleDbType.Int32, dto.IdUnidadTransito);
                p.Agregar("p_id_agente_transito", OracleDbType.Int32, idAgente);
                p.Agregar("p_fecha_atencion", OracleDbType.TimeStamp, dto.FechaAtencion ?? actual.FechaAtencion);
                p.Agregar("p_estado_final", OracleDbType.Varchar2, estado);
                p.Agregar("p_descripcion", OracleDbType.Varchar2, dto.Descripcion?.Trim());
                p.Agregar("p_observacion", OracleDbType.Varchar2, dto.Observacion?.Trim());
            });
            if (error != null) return BadRequest(error);

            var resp = await Proyectar(_context.AtencionesTransito.AsNoTracking().Where(a => a.IdAtencionTransito == id)).FirstAsync();
            return Ok(resp);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesBorrar)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.AtencionesTransito.FirstOrDefaultAsync(a => a.IdAtencionTransito == id);
            if (entidad == null) return NotFound();
            try
            {
                _context.AtencionesTransito.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException) { return Conflict("No se puede eliminar la atención de tránsito porque está en uso."); }
        }
    }
}
namespace backend.Controllers
{
    public class AtencionesTransitoController
    {
    }
}
