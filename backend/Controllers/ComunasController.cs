using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ComunasController : ControllerBase
	{
		private readonly AppDBContext _context;

		public ComunasController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Comunas
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

		// GET: api/Comunas/5
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

		// POST: api/Comunas
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
	}
}