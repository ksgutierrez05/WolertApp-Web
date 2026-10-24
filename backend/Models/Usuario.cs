using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Usuario
    {
        [Key]
        public int idUsuario { get; set; }
        public string cedula { get; set; }
        public string primerNombre { get; set; }
        public string segundoNombre { get; set; }
        public string primerApellido { get; set; }
        public string segundoApellido { get; set; }
        public string correo { get; set; }
        public string username { get; set; }
        public string passwordHash { get; set; }
        public string calle { get; set; }
        public string carrera { get; set; }
        public string etapa { get; set; }
        public string manzana { get; set; }
        public string casa { get; set; }
        public string estado { get; set; } = "activo";
        public DateTime fechaCreacion { get; set; } = DateTime.UtcNow;

        [ForeignKey("Rol")]
        public int RolId { get; set; }
        public Rol rol { get; set; }

        [ForeignKey("CreadoPor")]
        public int? CreadoPorId { get; set; }
        public Usuario CreadoPor { get; set; }
    }
}