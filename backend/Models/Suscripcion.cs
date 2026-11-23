using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("SUSCRIPCIONES")]
    public class Suscripcion
    {
        [Key, Column("ID_SUSCRIPCION")] public int IdSuscripcion { get; set; }

        [Column("ID_USUARIO")] public int? IdUsuario { get; set; }
        [ForeignKey(nameof(IdUsuario))] public Usuario? Usuario { get; set; }

        // NULL = todos los tipos de alerta
        [Column("ID_TIPO_ALERTA")] public int? IdTipoAlerta { get; set; }
        [ForeignKey(nameof(IdTipoAlerta))] public TipoAlerta? TipoAlerta { get; set; }

        // barrio y comuna NULL = toda la ciudad
        [Column("ID_BARRIO")] public int? IdBarrio { get; set; }
        [ForeignKey(nameof(IdBarrio))] public Barrio? Barrio { get; set; }

        [Column("ID_COMUNA")] public int? IdComuna { get; set; }
        [ForeignKey(nameof(IdComuna))] public Comuna? Comuna { get; set; }

        [Column("ESTADO")] public string? Estado { get; set; }
    }
}