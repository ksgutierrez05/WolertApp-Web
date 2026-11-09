using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
	public class Alerta
	{
		[Key]
		public int idTipoAlerta { get; set; }
		public string nombre { get; set; }
		public string prioridad { get; set; }
	}
}