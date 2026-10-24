using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
	public class Usuario
	{
		[Key]
		public int IdUsuario { get; set; }

		[Required, MaxLength(20)]
		public string Cedula { get; set; } = null!;

		[Required, MaxLength(50)]
		public string PrimerNombre { get; set; } = null!;

		[MaxLength(50)]
		public string? SegundoNombre { get; set; }

		[Required, MaxLength(50)]
		public string PrimerApellido { get; set; } = null!;

		[MaxLength(50)]
		public string? SegundoApellido { get; set; }

		[Required, MaxLength(100), EmailAddress]
		public string Correo { get; set; } = null!;

		[MaxLength(10)]
		public string? Telefono { get; set; }

		[Required, MaxLength(50)]
		public string Username { get; set; } = null!;

		[Required, MaxLength(255)]
		public string PasswordHash { get; set; } = null!;

		[MaxLength(30)] public string? Calle { get; set; }
		[MaxLength(30)] public string? Carrera { get; set; }
		[MaxLength(30)] public string? Etapa { get; set; }
		[MaxLength(20)] public string? Manzana { get; set; }
		[MaxLength(20)] public string? Casa { get; set; }

		[MaxLength(20)]
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