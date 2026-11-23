using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class SolicitudApoyoCrearDto
    {
        [Required] public int? IdAlerta { get; set; }
        [Required] public int? IdAsignacion { get; set; }   // asignación activa de quien pide apoyo
        [Required, StringLength(20)] public string CentralDestino { get; set; } = null!;   // POLICIA / TRANSITO
        [Required, StringLength(200)] public string Motivo { get; set; } = null!;
    }

    public class SolicitudApoyoResponderDto
    {
        [Required, StringLength(20)] public string Respuesta { get; set; } = null!;   // ACEPTADA / RECHAZADA
        [StringLength(200)] public string? Observacion { get; set; }
    }

    public class SolicitudApoyoDto
    {
        public int IdSolicitudApoyo { get; set; }
        public int? IdAlerta { get; set; }
        public int? IdAsignacionSolicitante { get; set; }
        public string? CentralOrigen { get; set; }
        public string? CentralDestino { get; set; }
        public string? Motivo { get; set; }
        public string? Estado { get; set; }
        public DateTime? FechaSolicitud { get; set; }
        public DateTime? FechaRespuesta { get; set; }
        public string? Observacion { get; set; }
    }
}