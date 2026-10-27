using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class BarrioDTO
	{
		public int IdBarrio { get; set; }
		public string Nombre { get; set; } = null!;
		public int ComunaId { get; set; }
		public string ComunaNombre { get; set; } = null!;
	}

	public class BarrioCreateDTO
	{
		public string Nombre { get; set; } = null!;

		[Required]
		public int ComunaId { get; set; }
	}
}