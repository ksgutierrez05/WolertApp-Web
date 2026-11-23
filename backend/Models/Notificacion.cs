using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("NOTIFICACIONES")]
    public class Notificacion
    {
        [Key, Column("ID_NOTIFICACION")] public int IdNotificacion { get; set; }
        [Column("ID_USUARIO")] public int? IdUsuario { get; set; }
        [ForeignKey(nameof(IdUsuario))] public Usuario? Usuario { get; set; }
        [Column("MENSAJE")] public string? Mensaje { get; set; }
        [Column("FECHA")] public DateTime? Fecha { get; set; }
        [Column("ID_ALERTA")] public int? IdAlerta { get; set; }
        // 'S' = enviada, 'N' = pendiente (así la interpretan las vistas). El DEFAULT 'PENDIENTE' de la tabla las muestra como ERROR.
        [Column("ENVIADA")] public string? Enviada { get; set; }
    }
}