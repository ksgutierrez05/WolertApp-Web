using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class NotificacionCrearDto
    {
        [Required] public int? IdUsuario { get; set; }
        public int? IdAlerta { get; set; }
        [Required, StringLength(150)] public string Mensaje { get; set; } = null!;
    }

    public class NotificacionDto
    {
        public int IdNotificacion { get; set; }
        public int? IdUsuario { get; set; }
        public string? UsuarioCedula { get; set; }
        public string? Mensaje { get; set; }
        public DateTime? Fecha { get; set; }
        public int? IdAlerta { get; set; }
        public string? Enviada { get; set; }   // S / N
        public string Estado { get; set; } = "PENDIENTE";  // ENVIADA / PENDIENTE
    }
}