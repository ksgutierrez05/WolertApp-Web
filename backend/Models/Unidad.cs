using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("UNIDADES_POLICIALES")]
    public class Unidad
    {
        [Key, Column("ID_UNIDAD")] public int IdUnidad { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("LATITUD")] public decimal? Latitud { get; set; }
        [Column("LONGITUD")] public decimal? Longitud { get; set; }
        [Column("ID_BARRIO")] public int? IdBarrio { get; set; }
        [ForeignKey(nameof(IdBarrio))] public Barrio? Barrio { get; set; }
        public ICollection<Policia> Policias { get; set; } = new List<Policia>();
    }
}