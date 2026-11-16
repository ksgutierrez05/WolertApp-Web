using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using System.Data;

using WolertApp.DTOs;
using WolertApp.Helpers;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    // Flujo: unidad en campo SOLICITA -> central destino RESPONDE (ACEPTADA/RECHAZADA) -> central ASIGNA unidad de apoyo.
    // Ninguno de los tres procedimientos hace COMMIT; lo hace el helper.
    [ApiController]
    [Route("api/[controller]")]
    public class SolicitudesApoyoController : ControllerBase
    {
        private const string RolesLectura = "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO,CENTRAL_POLICIA,CENTRAL_TRANSITO,POLICIA,AGENTE_TRANSITO";
        private const string RolesSolicitan = "POLICIA,AGENTE_TRANSITO";
        private const string RolesCentral = "CENTRAL_POLICIA,CENTRAL_TRANSITO";   // el procedimiento valida que el usuario sea de central (rol 8 o 9)
        private readonly AppDBContext _context;

        public SolicitudesApoyoController(AppDBContext context) => _context = context;

        private static IQueryable<SolicitudApoyoDto> Proyectar(IQueryable<SolicitudApoyo> q) =>
            q.Select(s => new SolicitudApoyoDto
            {
                IdSolicitudApoyo = s.IdSolicitudApoyo,
                IdAlerta = s.IdAlerta,
                IdAsignacionSolicitante = s.IdAsignacionSolicitante,
                CentralOrigen = s.CentralOrigen,
                CentralDestino = s.CentralDestino,
                Motivo = s.Motivo,
                Estado = s.Estado,
                FechaSolicitud = s.FechaSolicitud,
                FechaRespuesta = s.FechaRespuesta,
                Observacion = s.Observacion
            });

        [HttpGet]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<SolicitudApoyoDto>>> GetAll([FromQuery] int? idAlerta, [FromQuery] string? estado)
        {
            var q = _context.SolicitudesApoyo.AsNoTracking().AsQueryable();
            if (idAlerta != null) q = q.Where(s => s.IdAlerta == idAlerta);
            if (!string.IsNullOrWhiteSpace(estado))
            {
                var e = estado.Trim().ToUpper();
                q = q.Where(s => s.Estado == e);
            }
            return Ok(await Proyectar(q.OrderByDescending(s => s.FechaSolicitud)).ToListAsync());
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<SolicitudApoyoDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.SolicitudesApoyo.AsNoTracking().Where(s => s.IdSolicitudApoyo == id)).FirstOrDefaultAsync();
            return dto == null ? NotFound() : Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = RolesSolicitan)]
        public async Task<ActionResult<SolicitudApoyoDto>> Solicitar([FromBody] SolicitudApoyoCrearDto dto)
        {
            var destino = dto.CentralDestino.Trim().ToUpper();
            if (destino != "POLICIA" && destino != "TRANSITO") return BadRequest("La central de destino debe ser POLICIA o TRANSITO.");
            var motivo = dto.Motivo.Trim();
            if (motivo.Length == 0) return BadRequest("Debes indicar el motivo del apoyo.");

            var salida = new OracleParameter("p_id_solicitud_apoyo", OracleDbType.Decimal) { Direction = ParameterDirection.Output };
            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_SOLICITAR_APOYO", p =>
            {
                p.Agregar("p_id_alerta", OracleDbType.Int32, dto.IdAlerta);
                p.Agregar("p_id_asignacion", OracleDbType.Int32, dto.IdAsignacion);
                p.Agregar("p_central_destino", OracleDbType.Varchar2, destino);
                p.Agregar("p_motivo", OracleDbType.Varchar2, motivo);
                p.Add(salida);
            });
            if (error != null) return BadRequest(error);

            var nuevoId = ((OracleDecimal)salida.Value).ToInt32();
            var resp = await Proyectar(_context.SolicitudesApoyo.AsNoTracking().Where(s => s.IdSolicitudApoyo == nuevoId)).FirstAsync();
            return CreatedAtAction(nameof(GetById), new { id = nuevoId }, resp);
        }

        [HttpPost("{id:int}/responder")]
        [Authorize(Roles = RolesCentral)]
        public async Task<ActionResult<SolicitudApoyoDto>> Responder(int id, [FromBody] SolicitudApoyoResponderDto dto)
        {
            var uid = User.IdUsuario();
            if (uid == null) return Unauthorized();
            if (!await _context.SolicitudesApoyo.AnyAsync(s => s.IdSolicitudApoyo == id)) return NotFound();

            var respuesta = dto.Respuesta.Trim().ToUpper();
            if (respuesta != "ACEPTADA" && respuesta != "RECHAZADA") return BadRequest("La respuesta debe ser ACEPTADA o RECHAZADA.");

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_RESPONDER_SOLICITUD_APOYO", p =>
            {
                p.Agregar("p_id_solicitud_apoyo", OracleDbType.Int32, id);
                p.Agregar("p_id_usuario_central", OracleDbType.Int32, uid);
                p.Agregar("p_respuesta", OracleDbType.Varchar2, respuesta);
                p.Agregar("p_observacion", OracleDbType.Varchar2, dto.Observacion?.Trim());
            });
            if (error != null) return BadRequest(error);

            var resp = await Proyectar(_context.SolicitudesApoyo.AsNoTracking().Where(s => s.IdSolicitudApoyo == id)).FirstAsync();
            return Ok(resp);
        }

        // Asigna la unidad de apoyo (solo si la solicitud fue ACEPTADA). Esto crea la nueva fila en ASIGNACIONES_UNIDAD.
        [HttpPost("{id:int}/asignar-unidad")]
        [Authorize(Roles = RolesCentral)]
        public async Task<ActionResult<SolicitudApoyoDto>> AsignarUnidad(int id)
        {
            var uid = User.IdUsuario();
            if (uid == null) return Unauthorized();
            if (!await _context.SolicitudesApoyo.AnyAsync(s => s.IdSolicitudApoyo == id)) return NotFound();

            var error = await OracleProcedimientos.EjecutarAsync(_context, "PKG_ALERTAS.PR_ASIGNAR_UNIDAD_APOYO", p =>
            {
                p.Agregar("p_id_solicitud_apoyo", OracleDbType.Int32, id);
                p.Agregar("p_id_usuario_central", OracleDbType.Int32, uid);
            });
            if (error != null) return BadRequest(error);

            var resp = await Proyectar(_context.SolicitudesApoyo.AsNoTracking().Where(s => s.IdSolicitudApoyo == id)).FirstAsync();
            return Ok(resp);
        }
    }
}