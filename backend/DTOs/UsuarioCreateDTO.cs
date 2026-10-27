using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class UsuarioCreateDTO
	{
		public string Cedula { get; set; } = null!;
		public string PrimerNombre { get; set; } = null!;
		public string? SegundoNombre { get; set; }
		public string PrimerApellido { get; set; } = null!;
		public string? SegundoApellido { get; set; }
		[EmailAddress]
		public string Correo { get; set; } = null!;
		public string? Telefono { get; set; }
		public string Username { get; set; } = null!;
		public string Password { get; set; } = null!;
		public string? Calle { get; set; }
		public string? Carrera { get; set; }
		public string? Etapa { get; set; }
		public string? Manzana { get; set; }
		public string? Casa { get; set; }
		public int? BarrioId { get; set; }
	}
}