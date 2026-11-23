using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolertApp.Models
{
    [Table("ALARMAS")]
    public class Alarma
    {
        [Key, Column("ID_ALARMA")] public int IdAlarma { get; set; }
        [Column("NOMBRE")] public string? Nombre { get; set; }
        [Column("ID_BARRIO")] public int? IdBarrio { get; set; }
        [ForeignKey(nameof(IdBarrio))] public Barrio? Barrio { get; set; }
        [Column("LATITUD")] public decimal? Latitud { get; set; }
        [Column("LONGITUD")] public decimal? Longitud { get; set; }
        [Column("RADIO_COBERTURA")] public decimal? RadioCobertura { get; set; }
        [Column("ESTADO")] public string? Estado { get; set; }
        // La llena el trigger TRG_FECHA_ACTIVACION_ALARMA (solo lectura desde la API)
        [Column("FECHA_ACTIVACION")] public DateTime? FechaActivacion { get; set; }
    }
}