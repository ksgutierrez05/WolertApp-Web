namespace backend.DTOs
{
	public class AlertaDTO
	{
		public int IdAlerta { get; set; }
		public string Tipo { get; set; } = string.Empty;
		public string Prioridad { get; set; } = string.Empty;
		public string Estado { get; set; } = string.Empty;
		public string? Descripcion { get; set; }
		public string ReportadoPor { get; set; } = string.Empty;
		public string? BarrioNombre { get; set; }
		public decimal? Latitud { get; set; }
		public decimal? Longitud { get; set; }
		public DateTime Fecha { get; set; }
	}
	public class AlertaCreateDTO
	{
		public int TipoAlertaId { get; set; }
		public string? Descripcion { get; set; }
		public decimal? Latitud { get; set; }
		public decimal? Longitud { get; set; }
	}
}