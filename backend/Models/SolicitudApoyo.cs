using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("SOLICITUDES_APOYO")]
    public class SolicitudApoyo
    {
        [Key, Column("ID_SOLICITUD_APOYO")] public int IdSolicitudApoyo { get; set; }
        [Column("ID_ALERTA")] public int? IdAlerta { get; set; }
        [Column("ID_ASIGNACION_SOLICITANTE")] public int? IdAsignacionSolicitante { get; set; }
        [Column("CENTRAL_ORIGEN")] public string? CentralOrigen { get; set; }
        [Column("CENTRAL_DESTINO")] public string? CentralDestino { get; set; }
        [Column("MOTIVO")] public string? Motivo { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("FECHA_SOLICITUD")] public DateTime? FechaSolicitud { get; set; }
        [Column("FECHA_RESPUESTA")] public DateTime? FechaRespuesta { get; set; }
        [Column("OBSERVACION")] public string? Observacion { get; set; }
    }
}