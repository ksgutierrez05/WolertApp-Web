using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "CIUDADANO")]
public class SuscripcionesPushController : ControllerBase
{
    private readonly AppDBContext _context;

    public SuscripcionesPushController(AppDBContext context)
    {
        _context = context;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(RegistrarPushDto dto)
    {
        var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(idTexto, out var idUsuario))
            return Unauthorized();

        if (!Uri.TryCreate(dto.Endpoint, UriKind.Absolute, out var uri)
            || uri.Scheme != Uri.UriSchemeHttps
            || !uri.IsDefaultPort
            || !string.IsNullOrEmpty(uri.UserInfo))
        {
            return BadRequest("Endpoint invalido.");
        }

        var host = uri.Host.ToLowerInvariant();

        if (host != "fcm.googleapis.com"
            && host != "updates.push.services.mozilla.com"
            && host != "web.push.apple.com")
        {
            return BadRequest("Proveedor Push no compatible.");
        }

        var usuarioActivo = await _context.Usuarios.AnyAsync(u =>
            u.IdUsuario == idUsuario && u.Estado == "ACTIVO");

        if (!usuarioActivo)
            return Forbid();

        var suscripcion = await _context.SuscripcionesPush
            .FirstOrDefaultAsync(s => s.Endpoint == dto.Endpoint);

        if (suscripcion != null && suscripcion.IdUsuario != idUsuario)
            return Conflict("El dispositivo pertenece a otra cuenta.");

        if (suscripcion == null)
        {
            suscripcion = new SuscripcionPush
            {
                IdUsuario = idUsuario,
                Endpoint = dto.Endpoint,
                FechaRegistro = DateTime.UtcNow
            };

            _context.SuscripcionesPush.Add(suscripcion);
        }

        suscripcion.P256dh = dto.P256dh;
        suscripcion.Auth = dto.Auth;
        suscripcion.Latitud = dto.Latitud;
        suscripcion.Longitud = dto.Longitud;
        suscripcion.RadioMetros = dto.RadioMetros;
        suscripcion.Estado = "ACTIVA";
        suscripcion.FechaUbicacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Notificaciones activadas correctamente.",
            idSuscripcion = suscripcion.IdSuscripcionPush
        });
    }

    [HttpGet("mis-suscripciones")]
    public async Task<IActionResult> MisSuscripciones()
    {
        var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(idTexto, out var idUsuario))
            return Unauthorized();

        var datos = await _context.SuscripcionesPush
            .Where(s => s.IdUsuario == idUsuario)
            .Select(s => new
            {
                s.IdSuscripcionPush,
                s.Estado,
                s.RadioMetros,
                s.FechaRegistro,
                s.FechaUbicacion
            })
            .ToListAsync();

        return Ok(datos);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Desactivar(int id)
    {
        var idTexto = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(idTexto, out var idUsuario))
            return Unauthorized();

        var suscripcion = await _context.SuscripcionesPush
            .FirstOrDefaultAsync(s =>
                s.IdSuscripcionPush == id &&
                s.IdUsuario == idUsuario);

        if (suscripcion == null)
            return NotFound();

        suscripcion.Estado = "INACTIVA";
        suscripcion.Latitud = null;
        suscripcion.Longitud = null;
        suscripcion.FechaUbicacion = null;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Notificaciones desactivadas."
        });
    }
}