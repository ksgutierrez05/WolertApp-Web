using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
	public class Rol
	{
		[Key]
		public int IdRol { get; set; }
		public string Nombre { get; set; } = null!;
		public string? Descripcion { get; set; }

		public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
	}
}