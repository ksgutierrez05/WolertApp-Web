using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("MEDIOS_TRANSPORTE")]
    public class MedioTransporte
    {
        [Key, Column("ID_MEDIO_TRANSPORTE")] public int IdMedioTransporte { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
    }
}