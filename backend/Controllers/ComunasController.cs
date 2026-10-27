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
	public class ComunasController : ControllerBase
	{
		private readonly AppDBContext _context;

		public ComunasController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Comunas  (público: el registro necesita la lista)
		[AllowAnonymous]
		[HttpGet]
		public async Task<ActionResult<IEnumerable<ComunaDTO>>> GetComunas()
		{
			return await _context.Comunas
				.OrderBy(c => c.Nombre)
				.Select(c => new ComunaDTO
				{
					IdComuna = c.IdComuna,
					Nombre = c.Nombre,
					TotalBarrios = c.Barrios.Count()
				})
				.ToListAsync();
		}

		// GET: api/Comunas/5  (público)
		[AllowAnonymous]
		[HttpGet("{id}")]
		public async Task<ActionResult<ComunaDTO>> GetComuna(int id)
		{
			var comuna = await _context.Comunas
				.Where(c => c.IdComuna == id)
				.Select(c => new ComunaDTO
				{
					IdComuna = c.IdComuna,
					Nombre = c.Nombre,
					TotalBarrios = c.Barrios.Count()
				})
				.FirstOrDefaultAsync();

			if (comuna == null)
			{
				return NotFound();
			}

			return comuna;
		}

		// POST: api/Comunas  (solo Admin)
		[HttpPost]
		public async Task<ActionResult<ComunaDTO>> PostComuna(ComunaCreateDTO dto)
		{
			if (await _context.Comunas.AnyAsync(c => c.Nombre == dto.Nombre))
			{
				return Conflict("Ya existe una comuna con ese nombre.");
			}

			var comuna = new Comuna { Nombre = dto.Nombre };
			_context.Comunas.Add(comuna);
			await _context.SaveChangesAsync();

			var creada = new ComunaDTO
			{
				IdComuna = comuna.IdComuna,
				Nombre = comuna.Nombre,
				TotalBarrios = 0
			};
			return CreatedAtAction(nameof(GetComuna), new { id = comuna.IdComuna }, creada);
		}

		// PUT: api/Comunas/5  (solo Admin)
		[HttpPut("{id}")]
		public async Task<IActionResult> PutComuna(int id, ComunaCreateDTO dto)
		{
			var comuna = await _context.Comunas.FindAsync(id);
			if (comuna == null)
			{
				return NotFound();
			}

			// El nombre no puede repetirse en otra comuna
			if (await _context.Comunas.AnyAsync(c => c.Nombre == dto.Nombre && c.IdComuna != id))
			{
				return Conflict("Ya existe una comuna con ese nombre.");
			}

			comuna.Nombre = dto.Nombre;
			await _context.SaveChangesAsync();

			return NoContent();
		}

		// DELETE: api/Comunas/5  (solo Admin)
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteComuna(int id)
		{
			var comuna = await _context.Comunas.FindAsync(id);
			if (comuna == null)
			{
				return NotFound();
			}

			// No borrar si todavía tiene barrios
			if (await _context.Barrios.AnyAsync(b => b.ComunaId == id))
			{
				return Conflict("No se puede eliminar: la comuna tiene barrios asociados.");
			}

			_context.Comunas.Remove(comuna);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}