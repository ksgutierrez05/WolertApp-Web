using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UsuarioDTO
    {
        public int IdUsuario { get; set; }

        [StringLength(11)]
        public string? Cedula { get; set; }

        [StringLength(12)]
        public string? PrimerNombre { get; set; }

        public string? SegundoNombre { get; set; }
        public string? PrimerApellido { get; set; }
        public string? SegundoApellido { get; set; }

        [StringLength(40)]
        public string? Correo { get; set; }

        [StringLength(10)]
        public string? Telefono { get; set; }

        [StringLength(15)]
        public string? Username { get; set; }

        public string? Calle { get; set; }
        public string? Carrera { get; set; }
        public string? Etapa { get; set; }
        public string? Manzana { get; set; }
        public string? Casa { get; set; }
        public string? Estado { get; set; }
        public string? RolNombre { get; set; }
        public string? BarrioNombre { get; set; }
		public int? BarrioId { get; set; }
	}
}