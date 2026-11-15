using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
	[Table("TiposAlerta")]
	public class TipoAlerta
	{
		[Key]
		public int IdTipoAlerta { get; set; }

		[Required, MaxLength(50)]
		public string Nombre { get; set; } = string.Empty;

		[Required, MaxLength(20)]
		public string Prioridad { get; set; } = string.Empty; // alta | media | baja
	}
}