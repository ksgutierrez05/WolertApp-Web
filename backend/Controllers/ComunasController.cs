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
    [Authorize(Roles = "ADMIN")]
    public class ComunasController : ControllerBase
    {
        private readonly AppDBContext _context;

        public ComunasController(AppDBContext context)
        {
            _context = context;
        }

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

            if (comuna == null) return NotFound();
            return comuna;
        }

        [HttpPost]
        public async Task<ActionResult<ComunaDTO>> PostComuna(ComunaCreateDTO dto)
        {
            var nombre = dto.Nombre.Trim().ToUpper();

            if (await _context.Comunas.AnyAsync(c => c.Nombre.ToUpper() == nombre))
                return Conflict("Ya existe una comuna con ese nombre.");

            var comuna = new Comuna { Nombre = nombre };
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

        [HttpPut("{id}")]
        public async Task<IActionResult> PutComuna(int id, ComunaCreateDTO dto)
        {
            var comuna = await _context.Comunas.FindAsync(id);
            if (comuna == null) return NotFound();

            var nombre = dto.Nombre.Trim().ToUpper();

            if (await _context.Comunas.AnyAsync(c => c.Nombre.ToUpper() == nombre && c.IdComuna != id))
                return Conflict("Ya existe una comuna con ese nombre.");

            comuna.Nombre = nombre;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComuna(int id)
        {
            var comuna = await _context.Comunas.FindAsync(id);
            if (comuna == null) return NotFound();

            if (await _context.Barrios.AnyAsync(b => b.ComunaId == id))
                return Conflict("No se puede eliminar: la comuna tiene barrios asociados.");

            try
            {
                _context.Comunas.Remove(comuna);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict("No se puede eliminar: la comuna está en uso (suscripciones).");
            }

            return NoContent();
        }
    }
}