using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("TIPOS_ALERTA")]
    public class TipoAlerta
    {
        [Key, Column("ID_TIPO_ALERTA")] public int IdTipoAlerta { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
        [Column("PRIORIDAD")] public string? Prioridad { get; set; }                  // ALTA | MEDIA | BAJA
        [Column("CENTRAL_RESPONSABLE")] public string? CentralResponsable { get; set; } // POLICIA | TRANSITO
    }
}