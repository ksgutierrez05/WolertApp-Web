using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
	public class Comuna
	{
		[Key]
		public int IdComuna { get; set; }

		[Required, MaxLength(50)]
		public string Nombre { get; set; } = null!;

		public ICollection<Barrio> Barrios { get; set; } = new List<Barrio>();
	}
}