using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
	public class Rol
	{
		[Key]
		public int IdRol { get; set; }

		[Required, MaxLength(30)]
		public string Nombre { get; set; } = null!;

		[MaxLength(200)]
		public string? Descripcion { get; set; }

		public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
	}
}