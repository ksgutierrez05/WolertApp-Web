using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ALERTAS")]
    public class Alerta
    {
        [Key, Column("ID_ALERTA")] public int IdAlerta { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }   // PENDIENTE | UNIDAD_ASIGNADA | EN_ATENCION | RESUELTA | CANCELADA
        [Column("LATITUD")] public decimal? Latitud { get; set; }
        [Column("LONGITUD")] public decimal? Longitud { get; set; }
        [Column("DESCRIPCION")] public string? Descripcion { get; set; }
        [Column("FECHA")] public DateTime? Fecha { get; set; }

        [Column("ID_USUARIO")] public int? UsuarioId { get; set; }
        [ForeignKey(nameof(UsuarioId))] public Usuario? Usuario { get; set; }

        [Column("ID_BARRIO")] public int? BarrioId { get; set; }
        [ForeignKey(nameof(BarrioId))] public Barrio? Barrio { get; set; }

        [Column("ID_TIPO_ALERTA")] public int? TipoAlertaId { get; set; }
        [ForeignKey(nameof(TipoAlertaId))] public TipoAlerta? TipoAlerta { get; set; }
    }
}