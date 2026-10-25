using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	// Igual que el registro normal, pero indicando qué rol se va a crear
	public class UsuarioPersonalCreateDTO : UsuarioCreateDTO
	{
		[Required]
		public int RolId { get; set; }
	}
}