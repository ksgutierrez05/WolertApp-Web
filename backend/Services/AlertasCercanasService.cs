using backend.Data;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using WebPush;

namespace backend.Services;

public class AlertasCercanasService
{
    private readonly AppDBContext _context;
    private readonly WebPushService _push;
    private readonly ILogger<AlertasCercanasService> _logger;

    public AlertasCercanasService(
        AppDBContext context,
        WebPushService push,
        ILogger<AlertasCercanasService> logger)
    {
        _context = context;
        _push = push;
        _logger = logger;
    }

    private static double Radianes(double grados)
    {
        return grados * Math.PI / 180;
    }

    private static double CalcularDistancia(
        double lat1, double lon1,
        double lat2, double lon2)
    {
        const double radioTierra = 6371000;

        double dLat = Radianes(lat2 - lat1);
        double dLon = Radianes(lon2 - lon1);

        double a =
            Math.Pow(Math.Sin(dLat / 2), 2) +
            Math.Cos(Radianes(lat1)) *
            Math.Cos(Radianes(lat2)) *
            Math.Pow(Math.Sin(dLon / 2), 2);

        a = Math.Clamp(a, 0, 1);

        return radioTierra * 2 *
            Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    public async Task NotificarAsync(
        int idAlerta,
        int idUsuarioReporta,
        decimal? latitud,
        decimal? longitud,
        string tipoAlerta)
    {
        if (!latitud.HasValue || !longitud.HasValue)
            return;

        if (latitud.Value < -90 || latitud.Value > 90 ||
            longitud.Value < -180 || longitud.Value > 180)
            return;

        var limite = DateTime.UtcNow.AddHours(-24);

        var suscripciones = await _context.SuscripcionesPush
            .Where(s =>
                s.Estado == "ACTIVA" &&
                s.IdUsuario != idUsuarioReporta &&
                s.Latitud != null &&
                s.Longitud != null &&
                s.FechaUbicacion >= limite &&
                _context.Usuarios.Any(u =>
                    u.IdUsuario == s.IdUsuario &&
                    u.Estado == "ACTIVO"))
            .ToListAsync();

        foreach (var s in suscripciones)
        {
            double distancia = CalcularDistancia(
                (double)latitud.Value,
                (double)longitud.Value,
                (double)s.Latitud!.Value,
                (double)s.Longitud!.Value
            );

            if (distancia > s.RadioMetros)
                continue;

            try
            {
                await _push.EnviarNotificacionAsync(
                    new PushSuscripcionDto
                    {
                        Endpoint = s.Endpoint,
                        P256dh = s.P256dh,
                        Auth = s.Auth
                    },
                    "WolertApp | Alerta cercana",
                    $"Se ha reportado una alerta de {tipoAlerta} " +
                    $"a aproximadamente {Math.Round(distancia)} metros " +
                    "de tu ultima ubicacion. Consulta WolertApp."
                );

                _logger.LogInformation(
                    "Push aceptado. Alerta {Alerta}, usuario {Usuario}",
                    idAlerta, s.IdUsuario);
            }
            catch (WebPushException ex)
            {
                if ((int)ex.StatusCode == 404 ||
                    (int)ex.StatusCode == 410)
                {
                    s.Estado = "INACTIVA";
                    s.Latitud = null;
                    s.Longitud = null;
                    s.FechaUbicacion = null;
                }

                _logger.LogWarning(
                    "Error Push para suscripcion {Id}: {Codigo}",
                    s.IdSuscripcionPush, (int)ex.StatusCode);
            }
            catch (Exception)
            {
                _logger.LogWarning(
                    "No se pudo enviar Push a suscripcion {Id}",
                    s.IdSuscripcionPush);
            }
        }

        await _context.SaveChangesAsync();
    }
}