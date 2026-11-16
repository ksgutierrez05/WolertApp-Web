using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class AlarmaRequestDto
    {
        [Required, StringLength(30)] public string Nombre { get; set; } = null!;
        [Required] public int? IdBarrio { get; set; }
        [Required, Range(-90, 90)] public decimal? Latitud { get; set; }
        [Required, Range(-180, 180)] public decimal? Longitud { get; set; }
        [Required, Range(0.01, 1000000000)] public decimal? RadioCobertura { get; set; }
        // ACTIVA / INACTIVA. Si no se envía, se crea INACTIVA. FECHA_ACTIVACION la pone el trigger.
        [StringLength(20)] public string? Estado { get; set; }
    }

    public class AlarmaDto
    {
        public int IdAlarma { get; set; }
        public string? Nombre { get; set; }
        public int? IdBarrio { get; set; }
        public string? BarrioNombre { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public decimal? RadioCobertura { get; set; }
        public string? Estado { get; set; }
        public DateTime? FechaActivacion { get; set; }
    }
}