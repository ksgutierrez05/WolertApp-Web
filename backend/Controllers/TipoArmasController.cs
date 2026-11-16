using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WolertApp.DTOs;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TiposArmaController : ControllerBase
    {
        private const string RolesEscritura = "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO";
        private readonly AppDBContext _context;

        public TiposArmaController(AppDBContext context) => _context = context;

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TipoArmaDto>>> GetAll()
        {
            var lista = await _context.TiposArma.AsNoTracking()
                .OrderBy(t => t.IdTipoArma)
                .Select(t => new TipoArmaDto { IdTipoArma = t.IdTipoArma, Nombre = t.Nombre })
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<TipoArmaDto>> GetById(int id)
        {
            var t = await _context.TiposArma.AsNoTracking().FirstOrDefaultAsync(x => x.IdTipoArma == id);
            if (t == null) return NotFound();
            return Ok(new TipoArmaDto { IdTipoArma = t.IdTipoArma, Nombre = t.Nombre });
        }

        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<TipoArmaDto>> Create([FromBody] TipoArmaRequestDto dto)
        {
            var nombre = dto.Nombre.Trim();
            if (nombre.Length == 0) return BadRequest("El nombre es obligatorio.");

            var upper = nombre.ToUpper();
            if (await _context.TiposArma.AnyAsync(t => t.Nombre != null && t.Nombre.ToUpper() == upper))
                return Conflict("Ya existe un tipo de arma con ese nombre.");

            var entidad = new TipoArma { Nombre = nombre };   // el ID lo genera el trigger
            _context.TiposArma.Add(entidad);
            await _context.SaveChangesAsync();

            var resp = new TipoArmaDto { IdTipoArma = entidad.IdTipoArma, Nombre = entidad.Nombre };
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdTipoArma }, resp);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<TipoArmaDto>> Update(int id, [FromBody] TipoArmaRequestDto dto)
        {
            var entidad = await _context.TiposArma.FirstOrDefaultAsync(t => t.IdTipoArma == id);
            if (entidad == null) return NotFound();

            var nombre = dto.Nombre.Trim();
            if (nombre.Length == 0) return BadRequest("El nombre es obligatorio.");

            var upper = nombre.ToUpper();
            if (await _context.TiposArma.AnyAsync(t => t.IdTipoArma != id && t.Nombre != null && t.Nombre.ToUpper() == upper))
                return Conflict("Ya existe un tipo de arma con ese nombre.");

            entidad.Nombre = nombre;
            await _context.SaveChangesAsync();
            return Ok(new TipoArmaDto { IdTipoArma = entidad.IdTipoArma, Nombre = entidad.Nombre });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.TiposArma.FirstOrDefaultAsync(t => t.IdTipoArma == id);
            if (entidad == null) return NotFound();

            try
            {
                _context.TiposArma.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)   // ORA-02292: lo usan alertas o atenciones
            {
                return Conflict("No se puede eliminar: el tipo de arma está en uso por alertas o atenciones.");
            }
        }
    }
}