using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("ROLES_USUARIO")]
    public class Rol
    {
        [Key, Column("ID_ROL")] public int IdRol { get; set; }
        [Column("NOMBRE")] public string Nombre { get; set; } = null!;
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}