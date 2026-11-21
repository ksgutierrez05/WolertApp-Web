using System.Data;
using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using WolertApp.Helpers;

namespace backend.Controllers
{
    // Alertas reportadas por los usuarios (tabla ALERTAS)
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AlertasController : ControllerBase
    {
        private readonly AppDBContext _context;

        public AlertasController(AppDBContext context)
        {
            _context = context;
        }

        // Barrio y comuna del usuario que hace la petición (salen del token + la base de datos)
        private async Task<(int? barrioId, int? comunaId)> ZonaDelUsuario()
        {
            var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idTexto, out var id)) return (null, null);

            var zona = await _context.Usuarios
                .Where(u => u.IdUsuario == id)
                .Select(u => new
                {
                    u.BarrioId,
                    ComunaId = u.Barrio != null ? (int?)u.Barrio.ComunaId : null
                })
                .FirstOrDefaultAsync();

            return (zona?.BarrioId, zona?.ComunaId);
        }

        // GET: api/Alertas?alcance=todas|barrio|comuna
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AlertaDTO>>> GetAlertas([FromQuery] string alcance = "todas")
        {
			alcance = (alcance ?? "todas").Trim().ToLowerInvariant();

			var (barrioId, comunaId) = await ZonaDelUsuario();

            var consulta = _context.Alertas.AsNoTracking().AsQueryable();

            if (alcance == "barrio")
            {
                if (barrioId == null) return Ok(new List<AlertaDTO>());
                consulta = consulta.Where(a => a.BarrioId == barrioId);
            }
            else if (alcance == "comuna")
            {
                if (comunaId == null) return Ok(new List<AlertaDTO>());
                consulta = consulta.Where(a => a.Barrio != null && a.Barrio.ComunaId == comunaId);
            }
			else if (alcance == "mias")
			{
				var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
				if (!int.TryParse(idTexto, out var idUsuario)) return Unauthorized();
				consulta = consulta.Where(a => a.UsuarioId == idUsuario);
			}

			var alertas = await consulta
                .OrderByDescending(a => a.Fecha)
                .Take(200)
                .Select(a => new AlertaDTO
                {
                    IdAlerta = a.IdAlerta,
                    Tipo = a.TipoAlerta != null ? a.TipoAlerta.Nombre : null,
                    Prioridad = a.TipoAlerta != null ? a.TipoAlerta.Prioridad : null,
                    Estado = a.Estado,
                    Descripcion = a.Descripcion,
                    ReportadoPor = a.Usuario != null
                        ? ((a.Usuario.PrimerNombre ?? "") + " " + (a.Usuario.PrimerApellido ?? "")).Trim()
                        : null,
                    BarrioNombre = a.Barrio != null ? a.Barrio.Nombre : null,
                    Latitud = a.Latitud,
                    Longitud = a.Longitud,
                    Fecha = a.Fecha
                })
                .ToListAsync();

            return Ok(alertas);
        }

        // GET: api/Alertas/resumen  (números para los KPI del ciudadano)
        [HttpGet("resumen")]
        public async Task<IActionResult> Resumen()
        {
            var (barrioId, comunaId) = await ZonaDelUsuario();

            var total = await _context.Alertas.CountAsync();
            var enBarrio = barrioId == null ? 0
                : await _context.Alertas.CountAsync(a => a.BarrioId == barrioId);
            var enComuna = comunaId == null ? 0
                : await _context.Alertas.CountAsync(a => a.Barrio != null && a.Barrio.ComunaId == comunaId);

            return Ok(new { total, comuna = enComuna, barrio = enBarrio });
        }

        // POST: api/Alertas  (cualquier usuario con sesión reporta en SU barrio)
        // Se inserta con PKG_ALERTAS.PR_INSERTAR_ALERTA, no con EF
        [HttpPost]
        public async Task<IActionResult> PostAlerta(AlertaCreateDTO dto)
        {
            var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idTexto, out var idUsuario)) return Unauthorized();

            var tipoNombre = await _context.TiposAlerta
                .Where(t => t.IdTipoAlerta == dto.TipoAlertaId)
                .Select(t => t.Nombre)
                .FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(tipoNombre))
                return BadRequest("El tipo de alerta no existe.");

            // Las coordenadas son opcionales, pero van las dos o ninguna
            if ((dto.Latitud == null) != (dto.Longitud == null))
                return BadRequest("Envía latitud y longitud juntas.");

            var usuario = await _context.Usuarios
                .Where(u => u.IdUsuario == idUsuario)
                .Select(u => new
                {
                    u.Username,
                    BarrioNombre = u.Barrio != null ? u.Barrio.Nombre : null
                })
                .FirstOrDefaultAsync();
            if (usuario == null || string.IsNullOrEmpty(usuario.Username)) return Unauthorized();
            if (string.IsNullOrEmpty(usuario.BarrioNombre))
                return BadRequest("Tu cuenta no tiene un barrio asignado.");

            var descripcion = dto.Descripcion?.Trim();
            if (string.IsNullOrEmpty(descripcion)) descripcion = null;

            try
            {
                var idAlerta = await InsertarAlertaAsync(
                    usuario.Username,
                    tipoNombre,
                    usuario.BarrioNombre,
                    descripcion,
                    dto.Latitud == null ? null : Math.Round(dto.Latitud.Value, 6),
                    dto.Longitud == null ? null : Math.Round(dto.Longitud.Value, 6),
                    dto.SemaforoId);

                return Ok(new { IdAlerta = idAlerta });
            }
            catch (OracleException ex) when (ex.Number >= 20701 && ex.Number <= 20708)
            {
                // Errores de negocio del procedimiento (usuario, tipo, barrio, semáforo...)
                return BadRequest(MensajeDelProcedimiento(ex));
            }
        }

        // DELETE: api/Alertas/5
        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlerta(int id)
        {
            var alerta = await _context.Alertas.FindAsync(id);
            if (alerta == null)
            {
                return NotFound();
            }

            try
            {
                _context.Alertas.Remove(alerta);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // ORA-02292: la alerta tiene asignaciones, atenciones o notificaciones
                return Conflict("No se puede eliminar: la alerta tiene registros asociados.");
            }

            return NoContent();
        }

        // Llama al procedimiento del paquete. El procedimiento hace su propio COMMIT,
        // así que no se abre transacción aquí.
        private async Task<int> InsertarAlertaAsync(
            string username, string tipoAlerta, string nombreBarrio, string? descripcion,
            decimal? latitud, decimal? longitud, int? semaforoId)
        {
            var conexion = (OracleConnection)_context.Database.GetDbConnection();
            var abrir = conexion.State != ConnectionState.Open;
            if (abrir)
            {
                await conexion.OpenAsync();
            }

            try
            {
                using var cmd = conexion.CreateCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "PKG_ALERTAS.PR_INSERTAR_ALERTA";
                cmd.BindByName = true;

                cmd.Parameters.Add("p_username", OracleDbType.Varchar2).Value = username;
                cmd.Parameters.Add("p_tipo_alerta", OracleDbType.Varchar2).Value = tipoAlerta;
                cmd.Parameters.Add("p_nombre_barrio", OracleDbType.Varchar2).Value = nombreBarrio;
                cmd.Parameters.Add("p_tipo_arma", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_medio_transporte", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_etapa", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_sector", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_manzana", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_casa", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_calle", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_carrera", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_referencia", OracleDbType.Varchar2).Value = DBNull.Value;
                cmd.Parameters.Add("p_latitud", OracleDbType.Decimal).Value = (object?)latitud ?? DBNull.Value;
                cmd.Parameters.Add("p_longitud", OracleDbType.Decimal).Value = (object?)longitud ?? DBNull.Value;
                cmd.Parameters.Add("p_descripcion", OracleDbType.Varchar2).Value = (object?)descripcion ?? DBNull.Value;
                var salida = cmd.Parameters.Add("p_id_alerta", OracleDbType.Decimal, ParameterDirection.Output);
                cmd.Parameters.Add("p_id_semaforo", OracleDbType.Decimal).Value = (object?)semaforoId ?? DBNull.Value;

                await cmd.ExecuteNonQueryAsync();

                return int.Parse(salida.Value.ToString()!);
            }
            finally
            {
                if (abrir)
                {
                    await conexion.CloseAsync();
                }
            }
        }

        // "ORA-20703: Barrio no encontrado\nORA-06512: ..." -> "Barrio no encontrado"
        private static string MensajeDelProcedimiento(OracleException ex)
        {
            var primera = ex.Message.Split('\n')[0];
            var i = primera.IndexOf(": ", StringComparison.Ordinal);
            return i >= 0 ? primera[(i + 2)..].Trim() : primera.Trim();
        }

        // POST: api/Alertas/122/cerrar
        // Cierre de alertas por Central Policía o Central Tránsito

        [HttpPost("{id:int}/cerrar")]
        [Authorize(Roles = "CENTRAL_POLICIA,CENTRAL_TRANSITO")]
        public async Task<IActionResult> CerrarAlerta(
            int id,
            [FromBody] CerrarAlertaRequest? solicitud)
        {
            var idTexto = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (!int.TryParse(idTexto, out var idUsuarioCentral))
            {
                return Unauthorized(
                    "No se pudo identificar al usuario de la Central.");
            }

            if (solicitud == null ||
                string.IsNullOrWhiteSpace(solicitud.EstadoFinal))
            {
                return BadRequest("Debes indicar el estado final.");
            }

            var estadoFinal = solicitud.EstadoFinal
                .Trim()
                .ToUpperInvariant();

            if (estadoFinal != "RESUELTA" &&
                estadoFinal != "CANCELADA")
            {
                return BadRequest(
                    "El estado debe ser RESUELTA o CANCELADA.");
            }

            // Ejecutar el procedimiento existente en Oracle
            var conexion = (OracleConnection)
                _context.Database.GetDbConnection();

            var abrir = conexion.State != ConnectionState.Open;

            if (abrir)
                await conexion.OpenAsync();

            try
            {
                using var cmd = conexion.CreateCommand();

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "PKG_ALERTAS.PR_CERRAR_ALERTA";
                cmd.BindByName = true;

                cmd.Parameters.Add(
                    "p_id_alerta",
                    OracleDbType.Int32).Value = id;

                cmd.Parameters.Add(
                    "p_id_usuario_central",
                    OracleDbType.Int32).Value = idUsuarioCentral;

                cmd.Parameters.Add(
                    "p_estado_final",
                    OracleDbType.Varchar2).Value = estadoFinal;

                await cmd.ExecuteNonQueryAsync();

                return Ok(new
                {
                    idAlerta = id,
                    estado = estadoFinal,
                    mensaje = "La alerta fue cerrada correctamente."
                });
            }
            catch (OracleException ex)
            {
                return BadRequest(new
                {
                    mensaje = ex.Message.Split('\n')[0]
                });
            }
            finally
            {
                if (abrir)
                    await conexion.CloseAsync();
            }
        }

        // DTO para recibir el estado final
        public sealed class CerrarAlertaRequest
        {
            public string? EstadoFinal { get; set; }
        }













    }


}