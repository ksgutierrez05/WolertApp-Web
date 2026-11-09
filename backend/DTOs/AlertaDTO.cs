namespace backend.DTOs
{
	public class AlertaDTO
	{
		public int idTipoAlerta { get; set; }
		public string nombre { get; set; }
		public string prioridad { get; set; }
	}

	public class AlertaCreateDTO
	{
		public string nombre { get; set; }
		public string prioridad { get; set; }
	}
}