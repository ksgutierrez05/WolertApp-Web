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
	public class TiposAlertaController : ControllerBase
	{
		private readonly AppDBContext _context;

		private static readonly string[] PrioridadesValidas = { "alta", "media", "baja" };

		public TiposAlertaController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/TiposAlerta  (público: el formulario de reportar lo necesita)
		[HttpGet]
		public async Task<ActionResult<IEnumerable<TipoAlertaDTO>>> GetTipos()
		{
			var tipos = await _context.TiposAlerta
				.AsNoTracking()
				.OrderBy(t => t.Nombre)
				.Select(t => new TipoAlertaDTO
				{
					IdTipoAlerta = t.IdTipoAlerta,
					Nombre = t.Nombre,
					Prioridad = t.Prioridad
				})
				.ToListAsync();

			return Ok(tipos);
		}

		// GET: api/TiposAlerta/5
		[HttpGet("{id}")]
		public async Task<ActionResult<TipoAlertaDTO>> GetTipo(int id)
		{
			var t = await _context.TiposAlerta.AsNoTracking()
				.FirstOrDefaultAsync(x => x.IdTipoAlerta == id);

			if (t == null) return NotFound();

			return Ok(new TipoAlertaDTO
			{
				IdTipoAlerta = t.IdTipoAlerta,
				Nombre = t.Nombre,
				Prioridad = t.Prioridad
			});
		}

		// POST: api/TiposAlerta  (solo Admin)
		[HttpPost]
		[Authorize(Roles = "Admin")]
		public async Task<ActionResult<TipoAlertaDTO>> PostTipo(TipoAlertaCreateDTO dto)
		{
			var error = Validar(dto.Nombre, dto.Prioridad);
			if (error != null) return BadRequest(error);

			var nombre = dto.Nombre.Trim();

			if (await _context.TiposAlerta.AnyAsync(t => t.Nombre == nombre))
				return Conflict("Ya existe un tipo de alerta con ese nombre.");

			var tipo = new TipoAlerta
			{
				Nombre = nombre,
				Prioridad = dto.Prioridad.Trim().ToLower()
			};

			_context.TiposAlerta.Add(tipo);
			await _context.SaveChangesAsync();

			var resultado = new TipoAlertaDTO
			{
				IdTipoAlerta = tipo.IdTipoAlerta,
				Nombre = tipo.Nombre,
				Prioridad = tipo.Prioridad
			};

			return CreatedAtAction(nameof(GetTipo), new { id = tipo.IdTipoAlerta }, resultado);
		}

		// PUT: api/TiposAlerta/5  (solo Admin)
		[HttpPut("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> PutTipo(int id, TipoAlertaCreateDTO dto)
		{
			var error = Validar(dto.Nombre, dto.Prioridad);
			if (error != null) return BadRequest(error);

			var tipo = await _context.TiposAlerta.FindAsync(id);
			if (tipo == null) return NotFound();

			var nombre = dto.Nombre.Trim();

			if (await _context.TiposAlerta.AnyAsync(t => t.Nombre == nombre && t.IdTipoAlerta != id))
				return Conflict("Ya existe un tipo de alerta con ese nombre.");

			tipo.Nombre = nombre;
			tipo.Prioridad = dto.Prioridad.Trim().ToLower();

			await _context.SaveChangesAsync();
			return NoContent();
		}

		// DELETE: api/TiposAlerta/5  (solo Admin)
		[HttpDelete("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> DeleteTipo(int id)
		{
			var tipo = await _context.TiposAlerta.FindAsync(id);
			if (tipo == null) return NotFound();

			// No se puede borrar un tipo que ya tiene alertas reportadas
			if (await _context.Alertas.AnyAsync(a => a.TipoAlertaId == id))
				return Conflict("No se puede eliminar: hay alertas que usan este tipo.");

			_context.TiposAlerta.Remove(tipo);
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