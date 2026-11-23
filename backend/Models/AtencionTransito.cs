using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("ATENCION_TRANSITO")]
    public class AtencionTransito
    {
        [Key, Column("ID_ATENCION_TRANSITO")] public int IdAtencionTransito { get; set; }
        [Column("ID_ALERTA")] public int? IdAlerta { get; set; }
        [Column("ID_UNIDAD_TRANSITO")] public int? IdUnidadTransito { get; set; }
        // Guarda el ID_USUARIO del agente
        [Column("ID_AGENTE_TRANSITO")] public int? IdAgenteTransito { get; set; }
        [Column("FECHA_ATENCION")] public DateTime? FechaAtencion { get; set; }
        [Column("ESTADO_FINAL")] public string? EstadoFinal { get; set; }
        [Column("DESCRIPCION")] public string? Descripcion { get; set; }
        [Column("OBSERVACION")] public string? Observacion { get; set; }
        [Column("USUARIO_REGISTRA")] public int? UsuarioRegistra { get; set; }
        [Column("ID_ASIGNACION")] public int? IdAsignacion { get; set; }
    }
}