using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("TIPOS_ARMA")]
    public class TipoArma
    {
        [Key, Column("ID_TIPO_ARMA")] public int IdTipoArma { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
    }
}
