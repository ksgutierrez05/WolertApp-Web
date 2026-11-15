namespace backend.DTOs
{
	public class TipoAlertaDTO
	{
		public int IdTipoAlerta { get; set; }
		public string Nombre { get; set; } = string.Empty;
		public string Prioridad { get; set; } = string.Empty;
	}

	public class TipoAlertaCreateDTO
	{
		public string Nombre { get; set; } = string.Empty;
		public string Prioridad { get; set; } = string.Empty;
	}
}