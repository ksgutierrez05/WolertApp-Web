using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("USUARIOS")]
    public class Usuario
    {
        [Key, Column("ID_USUARIO")] public int IdUsuario { get; set; }
        [Column("CEDULA")] public string? Cedula { get; set; }
        [Column("PRIMER_NOMBRE")] public string? PrimerNombre { get; set; }
        [Column("SEGUNDO_NOMBRE")] public string? SegundoNombre { get; set; }
        [Column("PRIMER_APELLIDO")] public string? PrimerApellido { get; set; }
        [Column("SEGUNDO_APELLIDO")] public string? SegundoApellido { get; set; }
        [Column("EMAIL")] public string? Correo { get; set; }
        [Column("TELEFONO")] public string? Telefono { get; set; }
        [Column("USERNAME")] public string? Username { get; set; }
        [Column("PASSWORD")] public string? PasswordHash { get; set; }
        [Column("CALLE")] public string? Calle { get; set; }
        [Column("CARRERA")] public string? Carrera { get; set; }
        [Column("ETAPA")] public string? Etapa { get; set; }
        [Column("MANZANA")] public string? Manzana { get; set; }
        [Column("CASA")] public string? Casa { get; set; }
        [Column("ACTIVO")] public string? Estado { get; set; } = "ACTIVO";

        [Column("ID_ROL")] public int? RolId { get; set; }
        [ForeignKey(nameof(RolId))] public Rol? Rol { get; set; }

        [Column("ID_BARRIO")] public int? BarrioId { get; set; }
        [ForeignKey(nameof(BarrioId))] public Barrio? Barrio { get; set; }
    }
}