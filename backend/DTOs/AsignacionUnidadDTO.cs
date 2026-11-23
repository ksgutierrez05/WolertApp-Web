namespace WolertApp.DTOs
{
    public class AsignacionUnidadDto
    {
        public int IdAsignacion { get; set; }
        public int? IdAlerta { get; set; }
        public int? IdUnidad { get; set; }
        public string? UnidadNombre { get; set; }
        public int? IdUnidadTransito { get; set; }
        public DateTime? Fecha { get; set; }
        public string? Observacion { get; set; }
        public string? TipoParticipacion { get; set; }
        public string? EstadoAsignacion { get; set; }
        public int? IdSolicitudApoyo { get; set; }
    }
}