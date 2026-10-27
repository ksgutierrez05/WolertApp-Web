using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UnidadTransito
    {
        [Key]
        public int IdUnidadTransito { get; set; }
        public string Nombre { get; set; }
        public string? Estado { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
        [ForeignKey("Barrio")]
        public int? BarrioId { get; set; }
        public Barrio? Barrio { get; set; }
        public ICollection<AgentesTransito> AgentesTransito { get; set; }
    }
}
