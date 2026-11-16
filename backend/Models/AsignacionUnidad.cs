using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    // Solo lectura con EF: las asignaciones las crean los triggers / PKG_ALERTAS (pr_insertar_asignacion está bloqueado).
    [Table("ASIGNACIONES_UNIDAD")]
    public class AsignacionUnidad
    {
        [Key, Column("ID_ASIGNACION")] public int IdAsignacion { get; set; }
        [Column("ID_ALERTA")] public int? IdAlerta { get; set; }
        [Column("ID_UNIDAD")] public int? IdUnidad { get; set; }
        [ForeignKey(nameof(IdUnidad))] public Unidad? Unidad { get; set; }
        [Column("ID_UNIDAD_TRANSITO")] public int? IdUnidadTransito { get; set; }
        [Column("FECHA")] public DateTime? Fecha { get; set; }
        [Column("OBSERVACION")] public string? Observacion { get; set; }
        [Column("TIPO_PARTICIPACION")] public string? TipoParticipacion { get; set; }
        [Column("ESTADO_ASIGNACION")] public string? EstadoAsignacion { get; set; }
        [Column("ID_SOLICITUD_APOYO")] public int? IdSolicitudApoyo { get; set; }
    }
}