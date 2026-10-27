using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
	public class Barrio
	{
		[Key]
		public int IdBarrio { get; set; }
		public string Nombre { get; set; } = null!;
		public int ComunaId { get; set; }
		[ForeignKey(nameof(ComunaId))]
		public Comuna Comuna { get; set; } = null!;
		public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
	}
}
