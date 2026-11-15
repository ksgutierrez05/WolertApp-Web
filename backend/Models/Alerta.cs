using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
	public class Alerta
	{
		[Key]
		public int IdAlerta { get; set; }

		[Required, MaxLength(30)]
		public string Estado { get; set; } = "pendiente"; // pendiente | en_atencion | cerrada

		[Column(TypeName = "decimal(10,6)")]
		public decimal? Latitud { get; set; }
		[Column(TypeName = "decimal(10,6)")]	
		public decimal? Longitud { get; set; }
		public string? Descripcion { get; set; }
		public DateTime Fecha { get; set; } = DateTime.UtcNow;
		public int UsuarioId { get; set; }
		public Usuario Usuario { get; set; } = default!;

		public int? BarrioId { get; set; }
		public Barrio? Barrio { get; set; }

		public int TipoAlertaId { get; set; }
		public TipoAlerta TipoAlerta { get; set; } = default!;
	}
}