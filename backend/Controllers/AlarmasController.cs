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
    public class AlarmasController : ControllerBase
    {
        private const string RolesEscritura = "ADMIN,ADMIN_POLICIA";
        private readonly AppDBContext _context;

        public AlarmasController(AppDBContext context) => _context = context;

        private static AlarmaDto ToDto(Alarma a) => new()
        {
            IdAlarma = a.IdAlarma,
            Nombre = a.Nombre,
            IdBarrio = a.IdBarrio,
            BarrioNombre = a.Barrio != null ? a.Barrio.Nombre : null,
            Latitud = a.Latitud,
            Longitud = a.Longitud,
            RadioCobertura = a.RadioCobertura,
            Estado = a.Estado,
            FechaActivacion = a.FechaActivacion
        };

        private static string? NormalizarEstado(string? estado)
        {
            var e = string.IsNullOrWhiteSpace(estado) ? "INACTIVA" : estado.Trim().ToUpper();
            return e == "ACTIVA" || e == "INACTIVA" ? e : null;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AlarmaDto>>> GetAll()
        {
            var lista = await _context.Alarmas.AsNoTracking()
                .Include(a => a.Barrio)
                .OrderBy(a => a.IdAlarma)
                .Select(a => new AlarmaDto
                {
                    IdAlarma = a.IdAlarma,
                    Nombre = a.Nombre,
                    IdBarrio = a.IdBarrio,
                    BarrioNombre = a.Barrio != null ? a.Barrio.Nombre : null,
                    Latitud = a.Latitud,
                    Longitud = a.Longitud,
                    RadioCobertura = a.RadioCobertura,
                    Estado = a.Estado,
                    FechaActivacion = a.FechaActivacion
                })
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<ActionResult<AlarmaDto>> GetById(int id)
        {
            var a = await _context.Alarmas.AsNoTracking()
                .Include(x => x.Barrio)
                .FirstOrDefaultAsync(x => x.IdAlarma == id);
            return a == null ? NotFound() : Ok(ToDto(a));
        }

        [HttpPost]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AlarmaDto>> Create([FromBody] AlarmaRequestDto dto)
        {
            var estado = NormalizarEstado(dto.Estado);
            if (estado == null) return BadRequest("El estado debe ser ACTIVA o INACTIVA.");

            var nombre = dto.Nombre.Trim().ToUpper();
            if (nombre.Length == 0) return BadRequest("El nombre es obligatorio.");

            if (await _context.Barrios.FindAsync(dto.IdBarrio) == null)
                return BadRequest("El barrio indicado no existe.");

            if (await _context.Alarmas.AnyAsync(a => a.Nombre != null && a.Nombre.ToUpper() == nombre))
                return Conflict("Ya existe una alarma con ese nombre.");

            var entidad = new Alarma
            {
                Nombre = nombre,
                IdBarrio = dto.IdBarrio,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                RadioCobertura = dto.RadioCobertura,
                Estado = estado
                // IdAlarma y FechaActivacion los pone la base (trigger)
            };
            _context.Alarmas.Add(entidad);
            await _context.SaveChangesAsync();

            await _context.Entry(entidad).Reference(a => a.Barrio).LoadAsync();
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdAlarma }, ToDto(entidad));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<ActionResult<AlarmaDto>> Update(int id, [FromBody] AlarmaRequestDto dto)
        {
            var entidad = await _context.Alarmas.FirstOrDefaultAsync(a => a.IdAlarma == id);
            if (entidad == null) return NotFound();

            var estado = NormalizarEstado(dto.Estado ?? entidad.Estado);
            if (estado == null) return BadRequest("El estado debe ser ACTIVA o INACTIVA.");

            var nombre = dto.Nombre.Trim().ToUpper();
            if (await _context.Alarmas.AnyAsync(a => a.IdAlarma != id && a.Nombre != null && a.Nombre.ToUpper() == nombre))
                return Conflict("Ya existe otra alarma con ese nombre.");

            if (await _context.Barrios.FindAsync(dto.IdBarrio) == null)
                return BadRequest("El barrio indicado no existe.");

            entidad.Nombre = nombre;
            entidad.IdBarrio = dto.IdBarrio;
            entidad.Latitud = dto.Latitud;
            entidad.Longitud = dto.Longitud;
            entidad.RadioCobertura = dto.RadioCobertura;
            entidad.Estado = estado;   // si cambia a ACTIVA/INACTIVA el trigger ajusta FECHA_ACTIVACION
            await _context.SaveChangesAsync();

            await _context.Entry(entidad).Reference(a => a.Barrio).LoadAsync();
            return Ok(ToDto(entidad));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesEscritura)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.Alarmas.FirstOrDefaultAsync(a => a.IdAlarma == id);
            if (entidad == null) return NotFound();

            try
            {
                _context.Alarmas.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)   // ORA-02292: hay alertas asociadas a la alarma
            {
                return Conflict("No se puede eliminar: la alarma tiene alertas asociadas.");
            }
        }
    }
}