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
    public class SemaforosController : ControllerBase
    {
        private const string RolesEscritura = "ADMIN,ADMIN_TRANSITO";
        private readonly AppDBContext _context;

        public SemaforosController(AppDBContext context) => _context = context;

        private static SemaforoDto ToDto(Semaforo s) => new()
        {
            IdSemaforo = s.IdSemaforo,
            Codigo = s.Codigo,
            Direccion = s.Direccion,
            Tipo = s.Tipo,
            Estado = s.Estado,
            IdBarrio = s.IdBarrio,
            BarrioNombre = s.Barrio != null ? s.Barrio.Nombre : null,
            Latitud = s.Latitud,
            Longitud = s.Longitud,
            Observacion = s.Observacion
        };

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SemaforoDto>>> GetAll()
        {
            var lista = await _context.Semaforos.AsNoTracking()
                .Include(s => s.Barrio)
                .OrderBy(s => s.IdSemaforo)
                .Select(s => new SemaforoDto
                {
                    IdSemaforo = s.IdSemaforo,
                    Codigo = s.Codigo,
                    Direccion = s.Direccion,
                    Tipo = s.Tipo,
                    Estado = s.Estado,
                    IdBarrio = s.IdBarrio,
                    BarrioNombre = s.Barrio != null ? s.Barrio.Nombre : null,
                    Latitud = s.Latitud,
                    Longitud = s.Longitud,
                    Observacion = s.Observacion
                })
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<SemaforoDto>> GetById(int id)
        {
            var s = await _context.Semaforos.AsNoTracking()
                .Include(x => x.Barrio)
                .FirstOrDefaultAsync(x => x.IdSemaforo == id);
            return s == null ? NotFound() : Ok(ToDto(s));
        }

        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<SemaforoDto>> Create([FromBody] SemaforoRequestDto dto)
        {
            var codigo = dto.Codigo.Trim().ToUpper();
            var tipo = dto.Tipo.Trim().ToUpper();
            var estado = dto.Estado.Trim().ToUpper();
            if (codigo.Length == 0 || tipo.Length == 0 || estado.Length == 0)
                return BadRequest("Código, tipo y estado son obligatorios.");

            if (await _context.Semaforos.AnyAsync(s => s.Codigo != null && s.Codigo.ToUpper() == codigo))
                return Conflict("Ya existe un semáforo con ese código.");

            if (await _context.Barrios.FindAsync(dto.IdBarrio) == null)
                return BadRequest("El barrio indicado no existe.");

            var entidad = new Semaforo
            {
                Codigo = codigo,
                Direccion = dto.Direccion?.Trim(),
                Tipo = tipo,
                Estado = estado,
                IdBarrio = dto.IdBarrio,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                Observacion = dto.Observacion?.Trim()
                // IdSemaforo lo genera el trigger TRG_ID_SEMAFOROS
            };
            _context.Semaforos.Add(entidad);
            await _context.SaveChangesAsync();

            await _context.Entry(entidad).Reference(x => x.Barrio).LoadAsync();
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdSemaforo }, ToDto(entidad));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<SemaforoDto>> Update(int id, [FromBody] SemaforoRequestDto dto)
        {
            var entidad = await _context.Semaforos.FirstOrDefaultAsync(s => s.IdSemaforo == id);
            if (entidad == null) return NotFound();

            var codigo = dto.Codigo.Trim().ToUpper();
            if (await _context.Semaforos.AnyAsync(s => s.IdSemaforo != id && s.Codigo != null && s.Codigo.ToUpper() == codigo))
                return Conflict("Ya existe otro semáforo con ese código.");

            if (await _context.Barrios.FindAsync(dto.IdBarrio) == null)
                return BadRequest("El barrio indicado no existe.");

            entidad.Codigo = codigo;
            entidad.Direccion = dto.Direccion?.Trim();
            entidad.Tipo = dto.Tipo.Trim().ToUpper();
            entidad.Estado = dto.Estado.Trim().ToUpper();
            entidad.IdBarrio = dto.IdBarrio;
            entidad.Latitud = dto.Latitud;
            entidad.Longitud = dto.Longitud;
            entidad.Observacion = dto.Observacion?.Trim();
            await _context.SaveChangesAsync();

            await _context.Entry(entidad).Reference(s => s.Barrio).LoadAsync();
            return Ok(ToDto(entidad));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.Semaforos.FirstOrDefaultAsync(s => s.IdSemaforo == id);
            if (entidad == null) return NotFound();

            try
            {
                _context.Semaforos.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)   // ORA-02292: hay alertas asociadas al semáforo
            {
                return Conflict("No se puede eliminar: el semáforo tiene alertas asociadas.");
            }
        }
    }
}