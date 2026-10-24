namespace backend.DTOs
{
	public class UsuarioDTO
	{
		public int IdUsuario { get; set; }
		public string Cedula { get; set; } = null!;
		public string PrimerNombre { get; set; } = null!;
		public string? SegundoNombre { get; set; }
		public string PrimerApellido { get; set; } = null!;
		public string? SegundoApellido { get; set; }
		public string Correo { get; set; } = null!;
		public string? Telefono { get; set; }
		public string Username { get; set; } = null!;
		public string? Calle { get; set; }
		public string? Carrera { get; set; }
		public string? Etapa { get; set; }
		public string? Manzana { get; set; }
		public string? Casa { get; set; }
		public string Estado { get; set; } = null!;
		public DateTime FechaCreacion { get; set; }
		public string RolNombre { get; set; } = null!;
		public string? BarrioNombre { get; set; }
	}
}