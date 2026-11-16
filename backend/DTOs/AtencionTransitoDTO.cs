using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class AtencionTransitoRequestDto
    {
        [Required] public int? IdAlerta { get; set; }
        [Required] public int? IdUnidadTransito { get; set; }
        public int? IdAgenteTransito { get; set; }   // ID_USUARIO del agente; si quien registra es AGENTE_TRANSITO se toma del token
        public DateTime? FechaAtencion { get; set; } // si no se envía, la base usa la hora actual
        [Required, StringLength(20)] public string EstadoFinal { get; set; } = null!;   // EN_PROCESO / FINALIZADA
        [StringLength(200)] public string? Descripcion { get; set; }
        [StringLength(200)] public string? Observacion { get; set; }
    }

    public class AtencionTransitoDto
    {
        public int IdAtencionTransito { get; set; }
        public int? IdAlerta { get; set; }
        public int? IdUnidadTransito { get; set; }
        public int? IdAgenteTransito { get; set; }
        public DateTime? FechaAtencion { get; set; }
        public string? EstadoFinal { get; set; }
        public string? Descripcion { get; set; }
        public string? Observacion { get; set; }
        public int? UsuarioRegistra { get; set; }
        public int? IdAsignacion { get; set; }
    }
}