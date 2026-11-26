using backend.DTOs;
using System.Text.Json;
using WebPush;

namespace backend.Services;

public class WebPushService
{
    private readonly IConfiguration _configuration;

    public WebPushService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string ObtenerClavePublica()
    {
        return _configuration["Vapid:PublicKey"]
            ?? throw new InvalidOperationException(
                "VAPID no esta configurado.");
    }

    public async Task EnviarNotificacionAsync(
        PushSuscripcionDto datos,
        string titulo,
        string mensaje)
    {
        var subject = _configuration["Vapid:Subject"];
        var publicKey = _configuration["Vapid:PublicKey"];
        var privateKey = _configuration["Vapid:PrivateKey"];

        if (string.IsNullOrWhiteSpace(subject) ||
            string.IsNullOrWhiteSpace(publicKey) ||
            string.IsNullOrWhiteSpace(privateKey))
        {
            throw new InvalidOperationException(
                "Las claves VAPID no estan configuradas.");
        }

        if (!Uri.TryCreate(datos.Endpoint,
            UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps ||
            !uri.IsDefaultPort ||
            !string.IsNullOrEmpty(uri.UserInfo))
        {
            throw new ArgumentException(
                "Endpoint de suscripcion invalido.");
        }

        var host = uri.Host.ToLowerInvariant();

        if (host != "fcm.googleapis.com" &&
            host != "updates.push.services.mozilla.com" &&
            host != "web.push.apple.com")
        {
            throw new ArgumentException(
                "Proveedor Push no autorizado para esta prueba.");
        }

        var suscripcion = new PushSubscription(
            datos.Endpoint,
            datos.P256dh,
            datos.Auth);

        var vapid = new VapidDetails(
            subject,
            publicKey,
            privateKey);

        var payload = JsonSerializer.Serialize(new
        {
            title = titulo,
            body = mensaje,
            url = "/"
        });

        using var http = new HttpClient(
            new HttpClientHandler
            {
                AllowAutoRedirect = false
            });

        using var cliente = new WebPushClient(http);

        await cliente.SendNotificationAsync(
            suscripcion,
            payload,
            vapid);
    }
}