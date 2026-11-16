using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Table("UNIDADES_TRANSITO")]
    public class UnidadTransito
    {
        [Key, Column("ID_UNIDAD_TRANSITO")] public int IdUnidadTransito { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("LATITUD"), Precision(10, 7)] public decimal? Latitud { get; set; }
        [Column("LONGITUD"), Precision(10, 7)] public decimal? Longitud { get; set; }
        [Column("ID_BARRIO")] public int? BarrioId { get; set; }
        [ForeignKey(nameof(BarrioId))] public Barrio? Barrio { get; set; }
        public ICollection<AgentesTransito> AgentesTransito { get; set; } = new List<AgentesTransito>();
    }
}
