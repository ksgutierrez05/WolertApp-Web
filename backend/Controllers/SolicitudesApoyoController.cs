
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
    // Flujo:
    // 1. La unidad en campo solicita apoyo.
    // 2. La central destinataria acepta o rechaza.
    // 3. La central asigna una unidad de apoyo.
    //
    // Las transacciones son administradas por OracleProcedimientos.

    [ApiController]
    [Route("api/[controller]")]
    public class SolicitudesApoyoController : ControllerBase
    {
        private const string RolesLectura =
            "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO,CENTRAL_POLICIA,CENTRAL_TRANSITO,POLICIA,AGENTE_TRANSITO";

        private const string RolesSolicitan =
            "POLICIA,AGENTE_TRANSITO";

        private const string RolesCentral =
            "CENTRAL_POLICIA,CENTRAL_TRANSITO";

        private readonly AppDBContext _context;

        public SolicitudesApoyoController(AppDBContext context)
        {
            _context = context;
        }

        // ==========================================
        // PROYECCION A DTO
        // ==========================================

        private static IQueryable<SolicitudApoyoDto> Proyectar(
            IQueryable<SolicitudApoyo> q)
        {
            return q.Select(s => new SolicitudApoyoDto
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
        }

        // ==========================================
        // GET: api/SolicitudesApoyo
        // ==========================================

        [HttpGet]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<IEnumerable<SolicitudApoyoDto>>> GetAll(
            [FromQuery] int? idAlerta,
            [FromQuery] string? estado)
        {
            var q = _context.SolicitudesApoyo
                .AsNoTracking()
                .AsQueryable();

            if (idAlerta.HasValue)
            {
                q = q.Where(s => s.IdAlerta == idAlerta.Value);
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                var estadoNormalizado =
                    estado.Trim().ToUpperInvariant();

                q = q.Where(
                    s => s.Estado == estadoNormalizado
                );
            }

            var resultado = await Proyectar(
                q.OrderByDescending(s => s.FechaSolicitud)
            ).ToListAsync();

            return Ok(resultado);
        }

        // ==========================================
        // GET: api/SolicitudesApoyo/{id}
        // ==========================================

        [HttpGet("{id:int}")]
        [Authorize(Roles = RolesLectura)]
        public async Task<ActionResult<SolicitudApoyoDto>> GetById(
            int id)
        {
            var dto = await Proyectar(
                _context.SolicitudesApoyo
                    .AsNoTracking()
                    .Where(s => s.IdSolicitudApoyo == id)
            ).FirstOrDefaultAsync();

            if (dto == null)
            {
                return NotFound(
                    "La solicitud de apoyo no existe."
                );
            }

            return Ok(dto);
        }

        // ==========================================
        // POST: api/SolicitudesApoyo
        // SOLICITAR APOYO
        // ==========================================

        [HttpPost]
        [Authorize(Roles = RolesSolicitan)]
        public async Task<ActionResult<SolicitudApoyoDto>> Solicitar(
            [FromBody] SolicitudApoyoCrearDto dto)
        {
            // Identificar al usuario autenticado
            var uid = User.IdUsuario();

            if (uid == null)
            {
                return Unauthorized(
                    "No se pudo identificar al usuario autenticado."
                );
            }

            if (dto == null)
            {
                return BadRequest(
                    "Debes enviar los datos de la solicitud."
                );
            }

            // Validar central destinataria
            var destino = dto.CentralDestino?
                .Trim()
                .ToUpperInvariant();

            if (destino != "POLICIA" &&
                destino != "TRANSITO")
            {
                return BadRequest(
                    "La central de destino debe ser POLICIA o TRANSITO."
                );
            }

            // Validar motivo
            var motivo = dto.Motivo?.Trim();

            if (string.IsNullOrWhiteSpace(motivo))
            {
                return BadRequest(
                    "Debes indicar el motivo del apoyo."
                );
            }

            if (motivo.Length > 200)
            {
                return BadRequest(
                    "El motivo no puede superar los 200 caracteres."
                );
            }

            // Parámetro OUT de Oracle
            var salida = new OracleParameter(
                "p_id_solicitud_apoyo",
                OracleDbType.Decimal
            )
            {
                Direction = ParameterDirection.Output
            };

            // Ejecutar procedimiento almacenado
            var error = await OracleProcedimientos.EjecutarAsync(
                _context,
                "PKG_ALERTAS.PR_SOLICITAR_APOYO",
                p =>
                {
                    // Posición 1
                    p.Agregar(
                        "p_id_alerta",
                        OracleDbType.Decimal,
                        Convert.ToDecimal(dto.IdAlerta)
                    );

                    // Posición 2
                    p.Agregar(
                        "p_id_asignacion",
                        OracleDbType.Decimal,
                        Convert.ToDecimal(dto.IdAsignacion)
                    );

                    // Posición 3
                    p.Agregar(
                        "p_central_destino",
                        OracleDbType.Varchar2,
                        destino
                    );

                    // Posición 4
                    p.Agregar(
                        "p_motivo",
                        OracleDbType.Varchar2,
                        motivo
                    );

                    // Posición 5 - OUTPUT
                    p.Add(salida);

                    // Posición 6 - Usuario autenticado
                    p.Agregar(
                        "p_id_usuario_solicitante",
                        OracleDbType.Decimal,
                        Convert.ToDecimal(uid.Value)
                    );
                }
            );

            if (error != null)
            {
                return BadRequest(error);
            }

            // Recuperar ID generado por Oracle
            if (salida.Value == null ||
                salida.Value == DBNull.Value)
            {
                return BadRequest(
                    "Oracle no devolvió el ID de la solicitud."
                );
            }

            int nuevoId;

            if (salida.Value is OracleDecimal numeroOracle)
            {
                if (numeroOracle.IsNull)
                {
                    return BadRequest(
                        "Oracle devolvió un ID nulo."
                    );
                }

                nuevoId = numeroOracle.ToInt32();
            }
            else
            {
                nuevoId = Convert.ToInt32(salida.Value);
            }

            // Consultar la solicitud creada
            var resp = await Proyectar(
                _context.SolicitudesApoyo
                    .AsNoTracking()
                    .Where(s =>
                        s.IdSolicitudApoyo == nuevoId)
            ).FirstOrDefaultAsync();

            if (resp == null)
            {
                return NotFound(
                    "La solicitud fue procesada, pero no se encontró al consultarla."
                );
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = nuevoId },
                resp
            );
        }

        // ==========================================
        // POST: api/SolicitudesApoyo/{id}/responder
        // ACEPTAR O RECHAZAR
        // ==========================================

        [HttpPost("{id:int}/responder")]
        [Authorize(Roles = RolesCentral)]
        public async Task<ActionResult<SolicitudApoyoDto>> Responder(
            int id,
            [FromBody] SolicitudApoyoResponderDto dto)
        {
            var uid = User.IdUsuario();

            if (uid == null)
            {
                return Unauthorized(
                    "No se pudo identificar al usuario autenticado."
                );
            }

            if (dto == null)
            {
                return BadRequest(
                    "Debes enviar la respuesta de la solicitud."
                );
            }

            var existe = await _context.SolicitudesApoyo
                .AnyAsync(s => s.IdSolicitudApoyo == id);

            if (!existe)
            {
                return NotFound(
                    "La solicitud de apoyo no existe."
                );
            }

            var respuesta = dto.Respuesta?
                .Trim()
                .ToUpperInvariant();

            if (respuesta != "ACEPTADA" &&
                respuesta != "RECHAZADA")
            {
                return BadRequest(
                    "La respuesta debe ser ACEPTADA o RECHAZADA."
                );
            }

            var observacion = dto.Observacion?.Trim();

            var error = await OracleProcedimientos.EjecutarAsync(
                _context,
                "PKG_ALERTAS.PR_RESPONDER_SOLICITUD_APOYO",
                p =>
                {
                    p.Agregar(
                        "p_id_solicitud_apoyo",
                        OracleDbType.Int32,
                        id
                    );

                    p.Agregar(
                        "p_id_usuario_central",
                        OracleDbType.Int32,
                        uid.Value
                    );

                    p.Agregar(
                        "p_respuesta",
                        OracleDbType.Varchar2,
                        respuesta
                    );

                    p.Agregar(
                        "p_observacion",
                        OracleDbType.Varchar2,
                        observacion
                    );
                }
            );

            if (error != null)
            {
                return BadRequest(error);
            }

            var resp = await Proyectar(
                _context.SolicitudesApoyo
                    .AsNoTracking()
                    .Where(s => s.IdSolicitudApoyo == id)
            ).FirstAsync();

            return Ok(resp);
        }

        // ==========================================
        // POST: api/SolicitudesApoyo/{id}/asignar-unidad
        // ASIGNAR UNIDAD DE APOYO
        // ==========================================

        [HttpPost("{id:int}/asignar-unidad")]
        [Authorize(Roles = RolesCentral)]
        public async Task<ActionResult<SolicitudApoyoDto>> AsignarUnidad(
            int id)
        {
            var uid = User.IdUsuario();

            if (uid == null)
            {
                return Unauthorized(
                    "No se pudo identificar al usuario autenticado."
                );
            }

            var existe = await _context.SolicitudesApoyo
                .AnyAsync(s => s.IdSolicitudApoyo == id);

            if (!existe)
            {
                return NotFound(
                    "La solicitud de apoyo no existe."
                );
            }

            var error = await OracleProcedimientos.EjecutarAsync(
                _context,
                "PKG_ALERTAS.PR_ASIGNAR_UNIDAD_APOYO",
                p =>
                {
                    p.Agregar(
                        "p_id_solicitud_apoyo",
                        OracleDbType.Int32,
                        id
                    );

                    p.Agregar(
                        "p_id_usuario_central",
                        OracleDbType.Int32,
                        uid.Value
                    );
                }
            );

            if (error != null)
            {
                return BadRequest(error);
            }

            var resp = await Proyectar(
                _context.SolicitudesApoyo
                    .AsNoTracking()
                    .Where(s => s.IdSolicitudApoyo == id)
            ).FirstAsync();

            return Ok(resp);
        }
    }
}
