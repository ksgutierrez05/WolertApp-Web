using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class GoogleRegisterDTO
	{
		[Required]
		public string Credential { get; set; } = string.Empty;

		[Required]
		public string Cedula { get; set; } = string.Empty;

		[Required]
		public string Username { get; set; } = string.Empty;

		[Phone]
		public string? Telefono { get; set; }

		public int? BarrioId { get; set; }
	}
}
