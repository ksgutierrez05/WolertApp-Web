using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class UsuarioPersonalCreateDTO : UsuarioCreateDTO
	{
		[Required]
		public int RolId { get; set; }
	}
}