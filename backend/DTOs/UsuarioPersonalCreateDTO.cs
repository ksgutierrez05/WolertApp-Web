using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class UsuarioPersonalCreateDTO : UsuarioCreateDTO
	{
		public int RolId { get; set; }
	}
}