using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Semaforos
    {
        [Key]
        public int IdSemaforo { get; set; }
        public string Codigo { get; set; }
        public string Direccion { get; set; }
        public string Estado { get; set; }
        public string? Tipo { get; set; }
        public double? Latitud { get; set; }
        public string? Longitud { get; set; }
        public string? Observacion { get; set; }
        [ForeignKey("Barrio")]
        public int? BarrioId { get; set; }
        public Barrio? Barrio { get; set; }
    }
}
