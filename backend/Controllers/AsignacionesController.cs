using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using WolertApp.DTOs;
using WolertApp.Helpers;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    // Las asignaciones NO se crean desde la API: las crean los triggers/PKG_ALERTAS (flujo automático y de apoyo).
    // Aquí solo se leen y se mueve su estado (llegada / finalizar) con los procedimientos del paquete.
    [ApiController]
    [Route("api/[controller]")]
    public class AsignacionesController : ControllerBase
    {
        private const string RolesLectura = "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO,CENTRAL_POLICIA,CENTRAL_TRANSITO,POLICIA,AGENTE_TRANSITO";
        private const string RolesCampo = "POLICIA,AGENTE_TRANSITO";
        private readonly AppDBContext _context;

        public AsignacionesController(AppDBContext context) => _context = context;

        private static IQueryable<AsignacionUnidadDto> Proyectar(IQueryable<AsignacionUnidad> q) =>
            q.Select(a => new AsignacionUnidadDto
            {
                IdAsignacion = a.IdAsignacion,
                IdAlerta = a.IdAlerta,
                IdUnidad = a.IdUnidad,
                UnidadNombre = a.Unidad != null ? a.Unidad.Nombre : null,
                IdUnidadTransito = a.IdUnidadTransito,
                Fecha = a.Fecha,
                Observacion = a.Observacion,
                TipoParticipacion = a.TipoParticipacion,
                EstadoAsignacion = a.EstadoAsignacion,
                IdSolicitudApoyo = a.IdSolicitudApoyo
            });

        [HttpGet]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<AsignacionUnidadDto>>> GetAll([FromQuery] int? idAlerta, [FromQuery] string? estado)
        {
            var q = _context.Asignaciones.AsNoTracking().AsQueryable();
            if (idAlerta != null) q = q.Where(a => a.IdAlerta == idAlerta);
            if (!string.IsNullOrWhiteSpace(estado))
            {
                var e = estado.Trim().ToUpper();
                q = q.Where(a => a.EstadoAsignacion == e);
            }
            return Ok(await Proyectar(q.OrderByDescending(a => a.IdAsignacion)).ToListAsync());
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<AsignacionUnidadDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.Asignaciones.AsNoTracking().Where(a => a.IdAsignacion == id)).FirstOrDefaultAsync();
            return dto == null ? NotFound() : Ok(dto);
        }

        [HttpPost("manual")]
        [Authorize(Roles = "ADMIN_TRANSITO,CENTRAL_TRANSITO,ADMIN_POLICIA,CENTRAL_POLICIA")]
        public async Task<ActionResult<AsignacionUnidadDto>> AsignarManual(
            [FromBody] AsignacionManualDTO dto)
        {
            if (dto == null || dto.IdAlerta <= 0 ||
                string.IsNullOrWhiteSpace(dto.NombreUnidad))
            {
                return BadRequest(
                    "Debes indicar la alerta y la unidad."
                );
            }

            if (dto.Observacion?.Length > 180)
            {
                return BadRequest(
                    "La observación no puede superar 180 caracteres."
                );
            }

            var error = await OracleProcedimientos.EjecutarAsync(
                _context,
                "PKG_ALERTAS.PR_INSERTAR_ASIGNACION",
                p =>
                {
                    p.Agregar(
                        "p_id_alerta",
                        OracleDbType.Int32,
                        dto.IdAlerta
                    );

                    p.Agregar(
                        "p_nombre_unidad",
                        OracleDbType.Varchar2,
                        dto.NombreUnidad.Trim()
                    );

                    p.Agregar(
                        "p_observacion",
                        OracleDbType.Varchar2,
                        dto.Observacion
                    );

                    p.Agregar(
                        "p_fecha",
                        OracleDbType.TimeStamp,
                        DateTime.Now
                    );
                }
            );

            if (error != null)
                return BadRequest(error);

            var asignacion = await Proyectar(
                _context.Asignaciones
                    .AsNoTracking()
                    .Where(a => a.IdAlerta == dto.IdAlerta)
                    .OrderByDescending(a => a.IdAsignacion)
            ).FirstOrDefaultAsync();

            return asignacion == null
                ? StatusCode(500,
                    "La operación terminó, pero no se encontró la asignación.")
                : Ok(asignacion);
        }


        // La unidad llegó al lugar (ASIGNADA -> EN_ATENCION). pr_registrar_llegada NO hace COMMIT: lo hace el helper.
        [HttpPost("{id:int}/llegada")]
        [Authorize(Roles = RolesCampo)]
        public Task<ActionResult<AsignacionUnidadDto>> RegistrarLlegada(int id)
            => EjecutarAccion(id, "PKG_ALERTAS.PR_REGISTRAR_LLEGADA");

        // La unidad termina su participación (EN_ATENCION -> FINALIZADA). Requiere atención FINALIZADA registrada.
        [HttpPost("{id:int}/finalizar")]
        [Authorize(Roles = RolesCampo)]
        public Task<ActionResult<AsignacionUnidadDto>> Finalizar(int id)
            => EjecutarAccion(id, "PKG_ALERTAS.PR_FINALIZAR_ASIGNACION");

        private async Task<ActionResult<AsignacionUnidadDto>> EjecutarAccion(int id, string procedimiento)
        {
            var uid = User.IdUsuario();
            if (uid == null) return Unauthorized();
            if (!await _context.Asignaciones.AnyAsync(a => a.IdAsignacion == id)) return NotFound();

            var error = await OracleProcedimientos.EjecutarAsync(_context, procedimiento, p =>
            {
                p.Agregar("p_id_asignacion", OracleDbType.Int32, id);
                p.Agregar("p_id_usuario", OracleDbType.Int32, uid);
            });
            if (error != null) return BadRequest(error);

            var dto = await Proyectar(_context.Asignaciones.AsNoTracking().Where(a => a.IdAsignacion == id)).FirstAsync();
            return Ok(dto);
        }
    }


}