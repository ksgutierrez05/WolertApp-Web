using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using WolertApp.DTOs;
using WolertApp.Helpers;
using WolertApp.Models;

namespace WolertApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificacionesController : ControllerBase
    {
        private const string RolesAdmin = "ADMIN,ADMIN_POLICIA,ADMIN_TRANSITO";
        private readonly AppDBContext _context;

        public NotificacionesController(AppDBContext context) => _context = context;

        private static IQueryable<NotificacionDto> Proyectar(IQueryable<Notificacion> q) =>
            q.Select(n => new NotificacionDto
            {
                IdNotificacion = n.IdNotificacion,
                IdUsuario = n.IdUsuario,
                UsuarioCedula = n.Usuario != null ? n.Usuario.Cedula : null,
                Mensaje = n.Mensaje,
                Fecha = n.Fecha,
                IdAlerta = n.IdAlerta,
                Enviada = n.Enviada,
                Estado = n.Enviada == "S" ? "ENVIADA" : "PENDIENTE"
            });

        [HttpGet]
        [Authorize(Roles = RolesAdmin)]
        public async Task<ActionResult<IEnumerable<NotificacionDto>>> GetAll([FromQuery] int? idAlerta)
        {
            var q = _context.Notificaciones.AsNoTracking().AsQueryable();
            if (idAlerta != null) q = q.Where(n => n.IdAlerta == idAlerta);
            return Ok(await Proyectar(q.OrderByDescending(n => n.Fecha)).ToListAsync());
        }

        [HttpGet("mias")]
        public async Task<ActionResult<IEnumerable<NotificacionDto>>> GetMias()
        {
            var uid = User.IdUsuario();
            if (uid == null) return Unauthorized();
            var q = _context.Notificaciones.AsNoTracking().Where(n => n.IdUsuario == uid).OrderByDescending(n => n.Fecha);
            return Ok(await Proyectar(q).ToListAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<NotificacionDto>> GetById(int id)
        {
            var dto = await Proyectar(_context.Notificaciones.AsNoTracking().Where(n => n.IdNotificacion == id))
                .FirstOrDefaultAsync();
            if (dto == null) return NotFound();
            var esAdmin = User.IsInRole("ADMIN") || User.IsInRole("ADMIN_POLICIA") || User.IsInRole("ADMIN_TRANSITO");
            if (!esAdmin && dto.IdUsuario != User.IdUsuario()) return Forbid();
            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = RolesAdmin)]
        public async Task<ActionResult<NotificacionDto>> Create([FromBody] NotificacionCrearDto dto)
        {
            var mensaje = dto.Mensaje.Trim();
            if (mensaje.Length == 0) return BadRequest("El mensaje es obligatorio.");
            if (await _context.Usuarios.FindAsync(dto.IdUsuario) == null)
                return BadRequest("El usuario indicado no existe.");

            var entidad = new Notificacion
            {
                IdUsuario = dto.IdUsuario,
                IdAlerta = dto.IdAlerta,
                Mensaje = mensaje,
                Fecha = DateTime.UtcNow,   // el procedimiento usa SYSTIMESTAMP; si tu base no está en UTC, cámbialo a DateTime.Now
                Enviada = "N"              // N = pendiente
            };
            _context.Notificaciones.Add(entidad);
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException) { return BadRequest("La alerta indicada no existe."); }

            var resp = await Proyectar(_context.Notificaciones.AsNoTracking().Where(n => n.IdNotificacion == entidad.IdNotificacion)).FirstAsync();
            return CreatedAtAction(nameof(GetById), new { id = entidad.IdNotificacion }, resp);
        }

        [HttpPut("{id:int}/enviada")]
        [Authorize(Roles = RolesAdmin)]
        public async Task<ActionResult<NotificacionDto>> MarcarEnviada(int id)
        {
            var entidad = await _context.Notificaciones.FirstOrDefaultAsync(n => n.IdNotificacion == id);
            if (entidad == null) return NotFound();
            entidad.Enviada = "S";
            await _context.SaveChangesAsync();
            var resp = await Proyectar(_context.Notificaciones.AsNoTracking().Where(n => n.IdNotificacion == id)).FirstAsync();
            return Ok(resp);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = RolesAdmin)]
        public async Task<IActionResult> Delete(int id)
        {
            var entidad = await _context.Notificaciones.FirstOrDefaultAsync(n => n.IdNotificacion == id);
            if (entidad == null) return NotFound();
            try
            {
                _context.Notificaciones.Remove(entidad);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException) { return Conflict("No se puede eliminar la notificación porque está en uso."); }
        }
    }
}