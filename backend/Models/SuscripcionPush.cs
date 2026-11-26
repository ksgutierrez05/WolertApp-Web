using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("SUSCRIPCIONES_PUSH")]
public class SuscripcionPush
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("ID_SUSCRIPCION_PUSH")]
    public int IdSuscripcionPush { get; set; }

    [Column("ID_USUARIO")]
    public int IdUsuario { get; set; }

    [Column("ENDPOINT")]
    [MaxLength(2048)]
    public string Endpoint { get; set; } = string.Empty;

    [Column("P256DH")]
    [MaxLength(256)]
    public string P256dh { get; set; } = string.Empty;

    [Column("AUTH")]
    [MaxLength(256)]
    public string Auth { get; set; } = string.Empty;

    [Column("LATITUD", TypeName = "NUMBER(10,7)")]
    public decimal? Latitud { get; set; }

    [Column("LONGITUD", TypeName = "NUMBER(10,7)")]
    public decimal? Longitud { get; set; }

    [Column("RADIO_METROS")]
    public int RadioMetros { get; set; } = 500;

    [Column("ESTADO")]
    [MaxLength(15)]
    public string Estado { get; set; } = "ACTIVA";

    [Column("FECHA_REGISTRO")]
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    [Column("FECHA_UBICACION")]
    public DateTime? FechaUbicacion { get; set; }
}