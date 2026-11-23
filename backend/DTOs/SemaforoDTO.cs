using System.ComponentModel.DataAnnotations;

namespace WolertApp.DTOs
{
    public class SemaforoRequestDto
    {
        [Required, StringLength(30)] public string Codigo { get; set; } = null!;
        [StringLength(150)] public string? Direccion { get; set; }
        [Required, StringLength(30)] public string Tipo { get; set; } = null!;
        [Required, StringLength(20)] public string Estado { get; set; } = null!;
        [Required] public int? IdBarrio { get; set; }
        [Required, Range(-90, 90)] public decimal? Latitud { get; set; }
        [Required, Range(-180, 180)] public decimal? Longitud { get; set; }
        [StringLength(200)] public string? Observacion { get; set; }
    }

    public class SemaforoDto
    {
        public int IdSemaforo { get; set; }
        public string? Codigo { get; set; }
        public string? Direccion { get; set; }
        public string? Tipo { get; set; }
        public string? Estado { get; set; }
        public int? IdBarrio { get; set; }
        public string? BarrioNombre { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
        public string? Observacion { get; set; }
    }
}