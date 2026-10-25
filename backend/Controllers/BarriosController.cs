using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class BarriosController : ControllerBase
	{
		private readonly AppDBContext _context;

		public BarriosController(AppDBContext context)
		{
			_context = context;
		}

		// GET: api/Barrios  o  api/Barrios?comunaId=2
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

		// GET: api/Barrios/5
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

		// POST: api/Barrios
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
	}
}