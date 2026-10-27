using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
	public class ComunaDTO
	{
		public int IdComuna { get; set; }
		public string Nombre { get; set; } = null!;
		public int TotalBarrios { get; set; }
	}

	public class ComunaCreateDTO
	{
		public string Nombre { get; set; } = null!;
	}
}