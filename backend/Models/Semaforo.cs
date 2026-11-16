using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("SEMAFOROS")]
    public class Semaforo
    {
        // El ID lo genera el trigger TRG_ID_SEMAFOROS (ver SQL/TRG_ID_SEMAFOROS.sql)
        [Key, Column("ID_SEMAFORO")] public int IdSemaforo { get; set; }
        [Column("CODIGO")] public string? Codigo { get; set; }
        [Column("DIRECCION")] public string? Direccion { get; set; }
        [Column("TIPO")] public string? Tipo { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        [Column("ID_BARRIO")] public int? IdBarrio { get; set; }
        [ForeignKey(nameof(IdBarrio))] public Barrio? Barrio { get; set; }
        [Column("LATITUD")] public decimal? Latitud { get; set; }
        [Column("LONGITUD")] public decimal? Longitud { get; set; }
        [Column("OBSERVACION")] public string? Observacion { get; set; }
    }
}