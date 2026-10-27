using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class UsuarioUpdateDTO
	{
		[Required] public string Cedula { get; set; } = null!;
		[Required] public string PrimerNombre { get; set; } = null!;
		public string? SegundoNombre { get; set; }
		[Required] public string PrimerApellido { get; set; } = null!;
		public string? SegundoApellido { get; set; }
		[Required, EmailAddress] public string Correo { get; set; } = null!;
		public string? Telefono { get; set; }
		[Required] public string Username { get; set; } = null!;
		public string? Calle { get; set; }
		public string? Carrera { get; set; }
		public string? Etapa { get; set; }
		public string? Manzana { get; set; }
		public string? Casa { get; set; }
		public int? BarrioId { get; set; }
	}
}