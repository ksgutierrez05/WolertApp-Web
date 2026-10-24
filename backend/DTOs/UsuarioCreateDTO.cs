using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class UsuarioCreateDTO
	{
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

		[Required, MinLength(8), MaxLength(100)]
		public string Password { get; set; } = null!;

		[MaxLength(30)] public string? Calle { get; set; }
		[MaxLength(30)] public string? Carrera { get; set; }
		[MaxLength(30)] public string? Etapa { get; set; }
		[MaxLength(20)] public string? Manzana { get; set; }
		[MaxLength(20)] public string? Casa { get; set; }

		public int? BarrioId { get; set; }
	}
}