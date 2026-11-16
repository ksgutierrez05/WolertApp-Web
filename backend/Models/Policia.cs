using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("POLICIAS")]
    public class Policia
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("ID_USUARIO")] public int IdUsuario { get; set; }
        [ForeignKey(nameof(IdUsuario))] public Usuario? Usuario { get; set; }
        [Column("PLACA")] public string? Placa { get; set; }
        [Column("RANGO")] public string? Rango { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("ID_UNIDAD")] public int? IdUnidad { get; set; }
        [ForeignKey(nameof(IdUnidad))] public Unidad? Unidad { get; set; }
    }
}