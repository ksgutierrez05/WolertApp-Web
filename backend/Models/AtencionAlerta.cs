using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("ATENCION_ALERTA")]
    public class AtencionAlerta
    {
        [Key, Column("ID_ATENCION")] public int IdAtencion { get; set; }
        [Column("ID_ALERTA")] public int? IdAlerta { get; set; }
        [Column("ID_UNIDAD")] public int? IdUnidad { get; set; }
        [ForeignKey(nameof(IdUnidad))] public Unidad? Unidad { get; set; }
        [Column("FECHA_ATENCION")] public DateTime? FechaAtencion { get; set; }
        [Column("ESTADO_FINAL")] public string? EstadoFinal { get; set; }
        [Column("DESCRIPCION")] public string? Descripcion { get; set; }
        [Column("ID_TIPO_ARMA")] public int? IdTipoArma { get; set; }
        [ForeignKey(nameof(IdTipoArma))] public TipoArma? TipoArma { get; set; }
        [Column("ID_MEDIO_TRANSPORTE")] public int? IdMedioTransporte { get; set; }
        [ForeignKey(nameof(IdMedioTransporte))] public MedioTransporte? MedioTransporte { get; set; }
        [Column("OBSERVACION")] public string? Observacion { get; set; }
        // Guarda el ID_USUARIO del policía (POLICIAS ya no tiene ID propio)
        [Column("ID_POLICIA")] public int? IdPolicia { get; set; }
        [Column("USUARIO_REGISTRA")] public int? UsuarioRegistra { get; set; }
        [Column("ID_ASIGNACION")] public int? IdAsignacion { get; set; }
    }
}