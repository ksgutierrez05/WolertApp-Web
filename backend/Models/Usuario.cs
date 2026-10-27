using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
	public class Usuario
	{
		[Key]
		public int IdUsuario { get; set; }
		public string Cedula { get; set; } = null!;
		public string PrimerNombre { get; set; } = null!;
		public string? SegundoNombre { get; set; }
		public string PrimerApellido { get; set; } = null!;
		public string? SegundoApellido { get; set; }
		public string Correo { get; set; } = null!;
		public string? Telefono { get; set; }
		public string Username { get; set; } = null!;
		public string PasswordHash { get; set; } = null!;
		public string? Calle { get; set; }
		public string? Carrera { get; set; }
		public string? Etapa { get; set; }
		public string? Manzana { get; set; }
		 public string? Casa { get; set; }
		public string Estado { get; set; } = "activo";

		public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

		public int RolId { get; set; }
		[ForeignKey(nameof(RolId))]
		public Rol Rol { get; set; } = null!;

		public int? BarrioId { get; set; }
		[ForeignKey(nameof(BarrioId))]
		public Barrio? Barrio { get; set; }

		public int? CreadoPorId { get; set; }
		[ForeignKey(nameof(CreadoPorId))]
		public Usuario? CreadoPor { get; set; }
	}
}