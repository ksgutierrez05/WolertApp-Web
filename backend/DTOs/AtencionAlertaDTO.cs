using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class AtencionAlertaCrearDto
    {
        [Required] public int? IdAlerta { get; set; }
        [Required] public int? IdUnidad { get; set; }
        [Required, StringLength(20)] public string EstadoFinal { get; set; } = null!;   // EN_PROCESO / FINALIZADA
        [StringLength(300)] public string? Descripcion { get; set; }
        public int? IdTipoArma { get; set; }
        public int? IdMedioTransporte { get; set; }
        [StringLength(200)] public string? Observacion { get; set; }
        public int? IdPolicia { get; set; }   // ID_USUARIO del policía; si quien registra es POLICIA se toma del token
    }

    public class AtencionAlertaActualizarDto
    {
        [Required, StringLength(20)] public string EstadoFinal { get; set; } = null!;
        [StringLength(300)] public string? Descripcion { get; set; }
        public int? IdTipoArma { get; set; }
        public int? IdMedioTransporte { get; set; }
        [StringLength(200)] public string? Observacion { get; set; }
    }

    public class AtencionAlertaDto
    {
        public int IdAtencion { get; set; }
        public int? IdAlerta { get; set; }
        public int? IdUnidad { get; set; }
        public string? UnidadNombre { get; set; }
        public DateTime? FechaAtencion { get; set; }
        public string? EstadoFinal { get; set; }
        public string? Descripcion { get; set; }
        public int? IdTipoArma { get; set; }
        public string? TipoArmaNombre { get; set; }
        public int? IdMedioTransporte { get; set; }
        public string? MedioTransporteNombre { get; set; }
        public string? Observacion { get; set; }
        public int? IdPolicia { get; set; }
        public int? UsuarioRegistra { get; set; }
        public int? IdAsignacion { get; set; }
    }
}