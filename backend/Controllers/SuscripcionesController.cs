using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WolertApp.DTOs;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SuscripcionesController : ControllerBase
    {
        private readonly AppDBContext _context;

        public SuscripcionesController(AppDBContext context) => _context = context;

        private bool EsAdmin => User.IsInRole("ADMIN");

        // Ajusta el claim si tu token guarda el ID del usuario con otro nombre.
        private int? UsuarioActualId =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

        private static string? NormalizarEstado(string? estado)
        {
            var e = string.IsNullOrWhiteSpace(estado) ? "ACTIVA" : estado.Trim().ToUpper();
            return e == "ACTIVA" || e == "INACTIVA" ? e : null;
        }

        private IQueryable<SuscripcionDto> Proyectar(IQueryable<Suscripcion> q) =>
            q.Select(s => new SuscripcionDto
            {
                IdSuscripcion = s.IdSuscripcion,
                IdUsuario = s.IdUsuario,
                UsuarioCedula = s.Usuario != null ? s.Usuario.Cedula : null,
                UsuarioCorreo = s.Usuario != null ? s.Usuario.Correo : null,
                IdTipoAlerta = s.IdTipoAlerta,
                TipoAlertaNombre = s.TipoAlerta != null ? s.TipoAlerta.Nombre : null,
                IdBarrio = s.IdBarrio,
                BarrioNombre = s.Barrio != null ? s.Barrio.Nombre : null,
                IdComuna = s.IdComuna,
                ComunaNombre = s.Comuna != null ? s.Comuna.Nombre : null,
                Estado = s.Estado,
                Alcance = s.IdBarrio != null ? "BARRIO" : (s.IdComuna != null ? "COMUNA" : "CIUDAD")
            });

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<SuscripcionDto>>> GetAll()
        {
            var lista = await Proyectar(_context.Suscripciones.AsNoTracking().OrderBy(s => s.IdSuscripcion))
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("mias")]
        public async Task<ActionResult<IEnumerable<SuscripcionDto>>> GetMias()
        {
            var uid = UsuarioActualId;
            if (uid == null) return Unauthorized();

            var lista = await Proyectar(_context.Suscripciones.AsNoTracking()
                    .Where(s => s.IdUsuario == uid)
                    .OrderByDescending(s => s.IdSuscripcion))
                .ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<SuscripcionDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.Suscripciones.AsNoTracking().Where(s => s.IdSuscripcion == id))
                .FirstOrDefaultAsync();
            if (dto == null) return NotFound();
            if (!EsAdmin && dto.IdUsuario != UsuarioActualId) return Forbid();
            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult<SuscripcionDto>> Create([FromBody] SuscripcionRequestDto dto)
        {
            var estado = NormalizarEstado(dto.Estado);
            if (estado == null) return BadRequest("El estado debe ser ACTIVA o INACTIVA.");

            int? idUsuario = EsAdmin ? (dto.IdUsuario ?? UsuarioActualId) : UsuarioActualId;
            if (idUsuario == null) return BadRequest("No se pudo determinar el usuario de la suscripción.");

            var error = await ValidarReferencias(idUsuario.Value, dto);
            if (error != null) return BadRequest(error);

            var duplicada = await _context.Suscripciones.AnyAsync(s =>
                s.IdUsuario == idUsuario && s.IdTipoAlerta == dto.IdTipoAlerta &&
                s.IdBarrio == dto.IdBarrio && s.IdComuna == dto.IdComuna);
            if (duplicada) return Conflict("Ya existe una suscripción con ese mismo tipo de alerta y zona.");

            var entidad = new Suscripcion
            {
                IdUsuario = idUsuario,
                IdTipoAlerta = dto.IdTipoAlerta,
                IdBarrio = dto.IdBarrio,
                IdComuna = dto.IdComuna,
                Estado = estado   // el ID lo genera el trigger
            };
            _context.Suscripciones.Add(entidad);
            await _context.SaveChangesAsync();

            var resp = await Proyectar(_context.Suscripciones.AsNoTracking().Where(s => s.IdSuscripcion == entidad.IdSuscripcion))
                .FirstAsync();
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdSuscripcion }, resp);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<SuscripcionDto>> Update(int id, [FromBody] SuscripcionRequestDto dto)
        {
            var entidad = await _context.Suscripciones.FirstOrDefaultAsync(s => s.IdSuscripcion == id);
            if (entidad == null) return NotFound();
            if (!EsAdmin && entidad.IdUsuario != UsuarioActualId) return Forbid();

            var estado = NormalizarEstado(dto.Estado ?? entidad.Estado);
            if (estado == null) return BadRequest("El estado debe ser ACTIVA o INACTIVA.");

            var error = await ValidarReferencias(entidad.IdUsuario!.Value, dto);
            if (error != null) return BadRequest(error);

            var duplicada = await _context.Suscripciones.AnyAsync(s =>
                s.IdSuscripcion != id && s.IdUsuario == entidad.IdUsuario &&
                s.IdTipoAlerta == dto.IdTipoAlerta && s.IdBarrio == dto.IdBarrio && s.IdComuna == dto.IdComuna);
            if (duplicada) return Conflict("Ya existe una suscripción con ese mismo tipo de alerta y zona.");

            // El dueño de la suscripción no se cambia.
            entidad.IdTipoAlerta = dto.IdTipoAlerta;
            entidad.IdBarrio = dto.IdBarrio;
            entidad.IdComuna = dto.IdComuna;
            entidad.Estado = estado;
            await _context.SaveChangesAsync();

            var resp = await Proyectar(_context.Suscripciones.AsNoTracking().Where(s => s.IdSuscripcion == id))
                .FirstAsync();
            return Ok(resp);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.Suscripciones.FirstOrDefaultAsync(s => s.IdSuscripcion == id);
            if (entidad == null) return NotFound();
            if (!EsAdmin && entidad.IdUsuario != UsuarioActualId) return Forbid();

            try
            {
                _context.Suscripciones.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)
            {
                return Conflict("No se puede eliminar la suscripción porque está en uso.");
            }
        }

        private async Task<string?> ValidarReferencias(int idUsuario, SuscripcionRequestDto dto)
        {
            if (await _context.Usuarios.FindAsync(idUsuario) == null) return "El usuario no existe.";
            if (dto.IdTipoAlerta != null && await _context.TiposAlerta.FindAsync(dto.IdTipoAlerta) == null)
                return "El tipo de alerta no existe.";
            if (dto.IdBarrio != null && await _context.Barrios.FindAsync(dto.IdBarrio) == null)
                return "El barrio no existe.";
            if (dto.IdComuna != null && await _context.Comunas.FindAsync(dto.IdComuna) == null)
                return "La comuna no existe.";
            return null;
        }
    }
}