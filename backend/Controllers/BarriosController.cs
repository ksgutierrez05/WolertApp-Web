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
	[Authorize(Roles = "Admin")]
	public class BarriosController : ControllerBase
	{
		private readonly AppDBContext _context;

		public BarriosController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Barrios  o  api/Barrios?comunaId=2  (público)
		[AllowAnonymous]
		[HttpGet]
		public async Task<ActionResult<IEnumerable<BarrioDTO>>> GetBarrios([FromQuery] int? comunaId)
		{
			var consulta = _context.Barrios.AsQueryable();

			if (comunaId != null)
			{
				consulta = consulta.Where(b => b.ComunaId == comunaId);
			}

			return await consulta
				.OrderBy(b => b.Nombre)
				.Select(b => new BarrioDTO
				{
					IdBarrio = b.IdBarrio,
					Nombre = b.Nombre,
					ComunaId = b.ComunaId,
					ComunaNombre = b.Comuna.Nombre
				})
				.ToListAsync();
		}

		// GET: api/Barrios/5  (público)
		[AllowAnonymous]
		[HttpGet("{id}")]
		public async Task<ActionResult<BarrioDTO>> GetBarrio(int id)
		{
			var barrio = await _context.Barrios
				.Where(b => b.IdBarrio == id)
				.Select(b => new BarrioDTO
				{
					IdBarrio = b.IdBarrio,
					Nombre = b.Nombre,
					ComunaId = b.ComunaId,
					ComunaNombre = b.Comuna.Nombre
				})
				.FirstOrDefaultAsync();

			if (barrio == null)
			{
				return NotFound();
			}

			return barrio;
		}

		// POST: api/Barrios  (solo Admin)
		[HttpPost]
		public async Task<ActionResult<BarrioDTO>> PostBarrio(BarrioCreateDTO dto)
		{
			var comuna = await _context.Comunas.FindAsync(dto.ComunaId);
			if (comuna == null)
			{
				return BadRequest("La comuna indicada no existe.");
			}

			if (await _context.Barrios.AnyAsync(b => b.Nombre == dto.Nombre && b.ComunaId == dto.ComunaId))
			{
				return Conflict("Ya existe un barrio con ese nombre en esa comuna.");
			}

			var barrio = new Barrio { Nombre = dto.Nombre, ComunaId = dto.ComunaId };
			_context.Barrios.Add(barrio);
			await _context.SaveChangesAsync();

			var creado = new BarrioDTO
			{
				IdBarrio = barrio.IdBarrio,
				Nombre = barrio.Nombre,
				ComunaId = barrio.ComunaId,
				ComunaNombre = comuna.Nombre
			};
			return CreatedAtAction(nameof(GetBarrio), new { id = barrio.IdBarrio }, creado);
		}

		// PUT: api/Barrios/5  (solo Admin)
		[HttpPut("{id}")]
		public async Task<IActionResult> PutBarrio(int id, BarrioCreateDTO dto)
		{
			var barrio = await _context.Barrios.FindAsync(id);
			if (barrio == null)
			{
				return NotFound();
			}

			if (!await _context.Comunas.AnyAsync(c => c.IdComuna == dto.ComunaId))
			{
				return BadRequest("La comuna indicada no existe.");
			}

			// No repetir el nombre dentro de la misma comuna
			if (await _context.Barrios.AnyAsync(b =>
				b.Nombre == dto.Nombre && b.ComunaId == dto.ComunaId && b.IdBarrio != id))
			{
				return Conflict("Ya existe un barrio con ese nombre en la comuna.");
			}

			barrio.Nombre = dto.Nombre;
			barrio.ComunaId = dto.ComunaId;
			await _context.SaveChangesAsync();

			return NoContent();
		}

		// DELETE: api/Barrios/5  (solo Admin)
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteBarrio(int id)
		{
			var barrio = await _context.Barrios.FindAsync(id);
			if (barrio == null)
			{
				return NotFound();
			}

			// No borrar si hay usuarios viviendo en ese barrio
			if (await _context.Usuarios.AnyAsync(u => u.BarrioId == id))
			{
				return Conflict("No se puede eliminar: hay usuarios asociados a este barrio.");
			}

			_context.Barrios.Remove(barrio);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}