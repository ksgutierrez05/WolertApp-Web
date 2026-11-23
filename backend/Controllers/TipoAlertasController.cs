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

        private static readonly string[] PrioridadesValidas = { "ALTA", "MEDIA", "BAJA" };
        private static readonly string[] CentralesValidas = { "POLICIA", "TRANSITO" };

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
                    Prioridad = t.Prioridad,
                    CentralResponsable = t.CentralResponsable
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
                Prioridad = t.Prioridad,
                CentralResponsable = t.CentralResponsable
            });
        }

        // POST: api/TiposAlerta  (solo ADMIN)
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<TipoAlertaDTO>> PostTipo(TipoAlertaCreateDTO dto)
        {
            var error = Validar(dto.Nombre, dto.Prioridad, dto.CentralResponsable);
            if (error != null) return BadRequest(error);

            var nombre = dto.Nombre.Trim().ToUpper();

            if (await _context.TiposAlerta.AnyAsync(t => t.Nombre != null && t.Nombre.ToUpper() == nombre))
                return Conflict("Ya existe un tipo de alerta con ese nombre.");

            // El ID lo genera el trigger TRG_ID_TIPO_ALERTA
            var tipo = new TipoAlerta
            {
                Nombre = nombre,
                Prioridad = dto.Prioridad.Trim().ToUpper(),
                CentralResponsable = NormalizarCentral(dto.CentralResponsable)
            };

            _context.TiposAlerta.Add(tipo);
            await _context.SaveChangesAsync();

            var resultado = new TipoAlertaDTO
            {
                IdTipoAlerta = tipo.IdTipoAlerta,
                Nombre = tipo.Nombre,
                Prioridad = tipo.Prioridad,
                CentralResponsable = tipo.CentralResponsable
            };

            return CreatedAtAction(nameof(GetTipo), new { id = tipo.IdTipoAlerta }, resultado);
        }

        // PUT: api/TiposAlerta/5  (solo ADMIN)
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> PutTipo(int id, TipoAlertaCreateDTO dto)
        {
            var error = Validar(dto.Nombre, dto.Prioridad, dto.CentralResponsable);
            if (error != null) return BadRequest(error);

            var tipo = await _context.TiposAlerta.FindAsync(id);
            if (tipo == null) return NotFound();

            var nombre = dto.Nombre.Trim().ToUpper();

            if (await _context.TiposAlerta.AnyAsync(t =>
                    t.Nombre != null && t.Nombre.ToUpper() == nombre && t.IdTipoAlerta != id))
                return Conflict("Ya existe un tipo de alerta con ese nombre.");

            tipo.Nombre = nombre;
            tipo.Prioridad = dto.Prioridad.Trim().ToUpper();
            tipo.CentralResponsable = NormalizarCentral(dto.CentralResponsable);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/TiposAlerta/5  (solo ADMIN)
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteTipo(int id)
        {
            var tipo = await _context.TiposAlerta.FindAsync(id);
            if (tipo == null) return NotFound();

            // No se puede borrar un tipo que ya tiene alertas reportadas
            if (await _context.Alertas.AnyAsync(a => a.TipoAlertaId == id))
                return Conflict("No se puede eliminar: hay alertas que usan este tipo.");

            try
            {
                _context.TiposAlerta.Remove(tipo);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // ORA-02292: el tipo tiene suscripciones u otros registros asociados
                return Conflict("No se puede eliminar: el tipo tiene registros asociados.");
            }

            return NoContent();
        }

        private static string? NormalizarCentral(string? central)
        {
            return string.IsNullOrWhiteSpace(central) ? null : central.Trim().ToUpper();
        }

        private static string? Validar(string? nombre, string? prioridad, string? central)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return "El nombre es obligatorio.";
            if (string.IsNullOrWhiteSpace(prioridad) ||
                !PrioridadesValidas.Contains(prioridad.Trim().ToUpper()))
                return "La prioridad debe ser: ALTA, MEDIA o BAJA.";
            var c = NormalizarCentral(central);
            if (c != null && !CentralesValidas.Contains(c))
                return "La central responsable debe ser: POLICIA o TRANSITO.";
            return null;
        }
    }
}