using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
	// Alertas reportadas por los usuarios (tabla ALERTAS del diseño)
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
					// AJUSTA "ComunaId" si en tu modelo Barrio se llama distinto
					ComunaId = u.Barrio != null ? (int?)u.Barrio.ComunaId : null
				})
				.FirstOrDefaultAsync();

			return (zona?.BarrioId, zona?.ComunaId);
		}

		// GET: api/Alertas?alcance=todas|barrio|comuna|Mias
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

			else if (alcance != "todas")
			{
				return BadRequest("El alcance debe ser todas, barrio, comuna o mias.");
			}

			var alertas = await consulta
				.OrderByDescending(a => a.Fecha)
				.Take(200)
				.Select(a => new AlertaDTO
				{
					IdAlerta = a.IdAlerta,
					Tipo = a.TipoAlerta.Nombre,
					Prioridad = a.TipoAlerta.Prioridad,
					Estado = a.Estado,
					Descripcion = a.Descripcion,
					ReportadoPor = a.Usuario.PrimerNombre + " " + a.Usuario.PrimerApellido,
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
		[HttpPost]
		public async Task<IActionResult> PostAlerta(AlertaCreateDTO dto)
		{
			var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);
			if (!int.TryParse(idTexto, out var idUsuario)) return Unauthorized();

			if (!await _context.TiposAlerta.AnyAsync(t => t.IdTipoAlerta == dto.TipoAlertaId))
				return BadRequest("El tipo de alerta no existe.");

			var descripcion = dto.Descripcion?.Trim();
			if (descripcion != null && descripcion.Length > 500)
				return BadRequest("La descripción no puede superar 500 caracteres.");

			// Las coordenadas son opcionales, pero van las dos o ninguna
			if ((dto.Latitud == null) != (dto.Longitud == null))
				return BadRequest("Envía latitud y longitud juntas.");
			if (dto.Latitud is < -90 or > 90 || dto.Longitud is < -180 or > 180)
				return BadRequest("Las coordenadas están fuera de rango.");

			var (barrioId, _) = await ZonaDelUsuario();
			if (barrioId == null)
				return BadRequest("Tu cuenta no tiene un barrio asignado.");

			var alerta = new Alerta
			{
				TipoAlertaId = dto.TipoAlertaId,
				UsuarioId = idUsuario,
				BarrioId = barrioId,
				Descripcion = string.IsNullOrEmpty(descripcion) ? null : descripcion,
				Latitud = dto.Latitud == null ? null : Math.Round(dto.Latitud.Value, 6),
				Longitud = dto.Longitud == null ? null : Math.Round(dto.Longitud.Value, 6),
				Estado = "pendiente",
				Fecha = DateTime.UtcNow
			};

			_context.Alertas.Add(alerta);
			await _context.SaveChangesAsync();

			return Ok(new { alerta.IdAlerta });
		}

		// DELETE: api/Alertas/5
		[Authorize(Roles = "Admin")]
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteAlerta(int id)
		{
			var alerta = await _context.Alertas.FindAsync(id);
			if (alerta == null)
			{
				return NotFound();
			}

			_context.Alertas.Remove(alerta);
			await _context.SaveChangesAsync();

			return NoContent();
		}

	}
}	