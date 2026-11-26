using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebPush;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebPushController : ControllerBase
{
    private readonly WebPushService _service;
    private readonly IWebHostEnvironment _environment;

    public WebPushController(
        WebPushService service,
        IWebHostEnvironment environment)
    {
        _service = service;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpGet("clave-publica")]
    public IActionResult ObtenerClavePublica()
    {
        return Ok(new
        {
            publicKey = _service.ObtenerClavePublica()
        });
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPost("enviar-prueba")]
    public async Task<IActionResult> EnviarPrueba(
        PushSuscripcionDto dto)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        try
        {
            await _service.EnviarNotificacionAsync(
                dto,
                "WolertApp",
                "Notificacion de prueba del sistema comunitario.");

            return Ok(new
            {
                mensaje = "Notificacion aceptada por el servicio Push."
            });
        }
        catch (WebPushException ex)
        {
            return StatusCode(502, new
            {
                mensaje = "Error del proveedor Web Push.",
                codigo = (int)ex.StatusCode
            });
        }
        catch (ArgumentException)
        {
            return BadRequest(new
            {
                mensaje = "Suscripcion invalida o no compatible."
            });
        }
        catch (InvalidOperationException)
        {
            return StatusCode(503, new
            {
                mensaje = "Web Push no esta configurado."
            });
        }
    }
}