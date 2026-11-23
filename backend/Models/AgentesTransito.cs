using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AGENTES_TRANSITO")]
    public class AgentesTransito
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("ID_USUARIO")] public int IdUsuario { get; set; }
        [ForeignKey(nameof(IdUsuario))] public Usuario? Usuario { get; set; }
        [Column("PLACA")] public string? Placa { get; set; }
        [Column("RANGO")] public string? Rango { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("ID_UNIDAD_TRANSITO")] public int? UnidadTransitoId { get; set; }
        [ForeignKey(nameof(UnidadTransitoId))] public UnidadTransito? UnidadTransito { get; set; }
    }
}