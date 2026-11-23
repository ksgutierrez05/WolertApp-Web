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
    public class MediosTransporteController : ControllerBase
    {
        private const string RolesEscritura = "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO";
        private readonly AppDBContext _context;

        public MediosTransporteController(AppDBContext context) => _context = context;

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedioTransporteDto>>> GetAll()
        {
            var lista = await _context.MediosTransporte.AsNoTracking()
                .OrderBy(t => t.IdMedioTransporte)
                .Select(t => new MedioTransporteDto { IdMedioTransporte = t.IdMedioTransporte, Nombre = t.Nombre })
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<MedioTransporteDto>> GetById(int id)
        {
            var t = await _context.MediosTransporte.AsNoTracking().FirstOrDefaultAsync(x => x.IdMedioTransporte == id);
            if (t == null) return NotFound();
            return Ok(new MedioTransporteDto { IdMedioTransporte = t.IdMedioTransporte, Nombre = t.Nombre });
        }

        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<MedioTransporteDto>> Create([FromBody] MedioTransporteRequestDto dto)
        {
            var nombre = dto.Nombre.Trim();
            if (nombre.Length == 0) return BadRequest("El nombre es obligatorio.");

            var upper = nombre.ToUpper();
            if (await _context.MediosTransporte.AnyAsync(t => t.Nombre != null && t.Nombre.ToUpper() == upper))
                return Conflict("Ya existe un medio de transporte con ese nombre.");

            var entidad = new MedioTransporte { Nombre = nombre };   // el ID lo genera el trigger
            _context.MediosTransporte.Add(entidad);
            await _context.SaveChangesAsync();

            var resp = new MedioTransporteDto { IdMedioTransporte = entidad.IdMedioTransporte, Nombre = entidad.Nombre };
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdMedioTransporte }, resp);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<MedioTransporteDto>> Update(int id, [FromBody] MedioTransporteRequestDto dto)
        {
            var entidad = await _context.MediosTransporte.FirstOrDefaultAsync(t => t.IdMedioTransporte == id);
            if (entidad == null) return NotFound();

            var nombre = dto.Nombre.Trim();
            if (nombre.Length == 0) return BadRequest("El nombre es obligatorio.");

            var upper = nombre.ToUpper();
            if (await _context.MediosTransporte.AnyAsync(t => t.IdMedioTransporte != id && t.Nombre != null && t.Nombre.ToUpper() == upper))
                return Conflict("Ya existe un medio de transporte con ese nombre.");

            entidad.Nombre = nombre;
            await _context.SaveChangesAsync();
            return Ok(new MedioTransporteDto { IdMedioTransporte = entidad.IdMedioTransporte, Nombre = entidad.Nombre });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.MediosTransporte.FirstOrDefaultAsync(t => t.IdMedioTransporte == id);
            if (entidad == null) return NotFound();

            try
            {
                _context.MediosTransporte.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)   // ORA-02292: lo usan alertas o atenciones
            {
                return Conflict("No se puede eliminar: el medio de transporte está en uso por alertas o atenciones.");
            }
        }
    }
}