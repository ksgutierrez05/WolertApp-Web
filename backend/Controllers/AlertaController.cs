using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AlertasController : ControllerBase
	{
		// AJUSTA el nombre al de tu DbContext y su namespace (using) si es distinto
		private readonly AppDBContext _context;

		private static readonly string[] PrioridadesValidas = { "alta", "media", "baja" };

		public AlertasController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/alertas
		[HttpGet]
		public async Task<ActionResult<IEnumerable<AlertaDTO>>> GetAlertas()
		{
			var alertas = await _context.Alertas
				.AsNoTracking()
				.OrderBy(a => a.nombre)
				.Select(a => new AlertaDTO
				{
					idTipoAlerta = a.idTipoAlerta,
					nombre = a.nombre,
					prioridad = a.prioridad
				})
				.ToListAsync();

			return Ok(alertas);
		}

		// GET: api/alertas/5
		[HttpGet("{id}")]
		public async Task<ActionResult<AlertaDTO>> GetAlerta(int id)
		{
			var a = await _context.Alertas.AsNoTracking()
				.FirstOrDefaultAsync(x => x.idTipoAlerta == id);

			if (a == null) return NotFound();

			return Ok(new AlertaDTO
			{
				idTipoAlerta = a.idTipoAlerta,
				nombre = a.nombre,
				prioridad = a.prioridad
			});
		}

		// POST: api/alertas  (solo Admin)
		[HttpPost]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<AlertaDTO>> PostAlerta(AlertaCreateDTO dto)
		{
			var error = Validar(dto.nombre, dto.prioridad);
			if (error != null) return BadRequest(error);

			var nombre = dto.nombre.Trim();

			if (await _context.Alertas.AnyAsync(a => a.nombre == nombre))
				return Conflict("Ya existe un tipo de alerta con ese nombre.");

			var alerta = new Alerta
			{
				nombre = nombre,
				prioridad = dto.prioridad.Trim().ToLower()
			};

			_context.Alertas.Add(alerta);
			await _context.SaveChangesAsync();

			var resultado = new AlertaDTO
			{
				idTipoAlerta = alerta.idTipoAlerta,
				nombre = alerta.nombre,
				prioridad = alerta.prioridad
			};

			return CreatedAtAction(nameof(GetAlerta), new { id = alerta.idTipoAlerta }, resultado);
		}

		// PUT: api/alertas/5  (solo Admin)
		[HttpPut("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> PutAlerta(int id, AlertaCreateDTO dto)
		{
			var error = Validar(dto.nombre, dto.prioridad);
			if (error != null) return BadRequest(error);

			var alerta = await _context.Alertas.FindAsync(id);
			if (alerta == null) return NotFound();

			var nombre = dto.nombre.Trim();

			if (await _context.Alertas.AnyAsync(a => a.nombre == nombre && a.idTipoAlerta != id))
				return Conflict("Ya existe un tipo de alerta con ese nombre.");

			alerta.nombre = nombre;
			alerta.prioridad = dto.prioridad.Trim().ToLower();

			await _context.SaveChangesAsync();
			return NoContent();
		}

		// DELETE: api/alertas/5  (solo Admin)
		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteAlerta(int id)
		{
			var alerta = await _context.Alertas.FindAsync(id);
			if (alerta == null) return NotFound();

			_context.Alertas.Remove(alerta);
			await _context.SaveChangesAsync();
			return NoContent();
		}

		private static string? Validar(string? nombre, string? prioridad)
		{
			if (string.IsNullOrWhiteSpace(nombre))
				return "El nombre es obligatorio.";
			if (nombre.Trim().Length > 50)
				return "El nombre no puede superar 50 caracteres.";
			if (string.IsNullOrWhiteSpace(prioridad) ||
				!PrioridadesValidas.Contains(prioridad.Trim().ToLower()))
				return "La prioridad debe ser: alta, media o baja.";
			return null;
		}
	}
}