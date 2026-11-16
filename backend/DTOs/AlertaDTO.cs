using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class AlertaDTO
    {
        public int IdAlerta { get; set; }
        public string? Tipo { get; set; }
        public string? Prioridad { get; set; }
        public string? Estado { get; set; }
        public string? Descripcion { get; set; }
        public string? ReportadoPor { get; set; }
        public string? BarrioNombre { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public DateTime? Fecha { get; set; }
    }

    public class AlertaCreateDTO
    {
        [Range(1, int.MaxValue)]
        public int TipoAlertaId { get; set; }

        [StringLength(200)]
        public string? Descripcion { get; set; }

        [Range(-90, 90)]
        public decimal? Latitud { get; set; }

        [Range(-180, 180)]
        public decimal? Longitud { get; set; }

        // Solo para el tipo SEMAFORO_DANADO
        public int? SemaforoId { get; set; }
    }
}