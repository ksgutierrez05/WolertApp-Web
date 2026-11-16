using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UsuarioUpdateDTO
    {
        [Required, StringLength(11)]
        public string Cedula { get; set; } = null!;

        [Required, StringLength(12)]
        public string PrimerNombre { get; set; } = null!;

        public string? SegundoNombre { get; set; }

        [Required]
        public string PrimerApellido { get; set; } = null!;

        public string? SegundoApellido { get; set; }

        [Required, EmailAddress, StringLength(40)]
        public string Correo { get; set; } = null!;

        [StringLength(10)]
        public string? Telefono { get; set; }

        [Required, StringLength(15)]
        public string Username { get; set; } = null!;

        public string? Calle { get; set; }
        public string? Carrera { get; set; }
        public string? Etapa { get; set; }
        public string? Manzana { get; set; }
        public string? Casa { get; set; }
        public int? BarrioId { get; set; }
    }
}